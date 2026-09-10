import { DOCUMENT, Injectable, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Thoi gian man che quet vao, tinh bang giay. */
const SWEEP_IN = 0.42;

/** Thoi gian man che quet ra. */
const SWEEP_OUT = 0.5;

/** Kieu rut gon cho phan GSAP thuc su dung o day. */
type GsapModule = typeof import('./gsap');

/**
 * Hieu ung chuyen giua cac trang.
 *
 * Mot man che truot ngang qua man hinh che di khoanh khac trang cu bien
 * mat, sau do trang moi troi len. Cach nay giau duoc buoc lazy-load chunk
 * cua trang moi - nguoi dung thay mot chuyen canh lien mach thay vi mot
 * khoang trang.
 *
 * GSAP duoc nap DONG chu khong import truc tiep: service nay chay o tang
 * `App` nen import tinh se keo ca thu vien vao bundle dau vao, lam cham
 * lan hien thi dau tien. Nap dong thi lan chuyen trang dau khong co hieu
 * ung, cac lan sau co - danh doi hop ly.
 */
@Injectable({ providedIn: 'root' })
export class PageTransitionService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  private sweep: HTMLElement | null = null;
  private reduced = false;
  private gsapModule: GsapModule | null = null;

  /** Goi mot lan luc ung dung khoi dong. */
  init(): void {
    const view = this.document.defaultView;

    // `matchMedia` khong ton tai trong jsdom va mot so moi truong khong
    // phai trinh duyet - thieu no thi coi nhu khong dung hieu ung.
    const canAnimate = typeof view?.matchMedia === 'function';
    this.reduced =
      !canAnimate ||
      view.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.reduced) {
      // Khong dung hieu ung thi khong can nap thu vien.
      this.watchNavigation();
      return;
    }

    this.sweep = this.createSweep();
    void this.loadGsap();
    this.watchNavigation();
  }

  private watchNavigation(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => this.onStart());

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.onEnd());
  }

  /** Nap GSAP sau khi ung dung da hien thi xong. */
  private async loadGsap(): Promise<void> {
    const module = await import('./gsap');
    module.registerGsap();
    this.gsapModule = module;
  }

  /** Tao lop phu dung de che man hinh luc chuyen trang. */
  private createSweep(): HTMLElement {
    const element = this.document.createElement('div');
    element.className = 'page-sweep';
    element.setAttribute('aria-hidden', 'true');
    this.document.body.appendChild(element);
    return element;
  }

  private onStart(): void {
    if (this.gsapModule === null || this.sweep === null) {
      return;
    }

    // Quet tu trai sang, phu kin man hinh.
    this.gsapModule.gsap.fromTo(
      this.sweep,
      { xPercent: -100 },
      { xPercent: 0, duration: SWEEP_IN, ease: 'power3.inOut' },
    );
  }

  private onEnd(): void {
    // Trang moi luon bat dau tu dau trang, khong giu vi tri cuon cu.
    this.document.defaultView?.scrollTo({ top: 0, behavior: 'instant' });

    if (this.gsapModule === null || this.sweep === null) {
      return;
    }

    const { gsap, ScrollTrigger } = this.gsapModule;
    const main = this.document.querySelector('main');

    const tl = gsap.timeline({
      // Vi tri cac trigger doi hoan toan khi sang trang khac.
      onComplete: () => ScrollTrigger.refresh(),
    });

    // Man che quet tiep sang phai roi bien mat.
    tl.to(this.sweep, {
      xPercent: 100,
      duration: SWEEP_OUT,
      ease: 'power3.inOut',
    });

    if (main !== null) {
      tl.from(
        main,
        { opacity: 0, y: 24, duration: 0.5, ease: 'power2.out' },
        '-=0.3',
      );
    }
  }
}
