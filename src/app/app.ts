import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';

import { HealthStore } from './core/health.store';
import { PageTransitionService } from './core/page-transition.service';

type Theme = 'light' | 'dark';

/** Khoa luu lua chon chu de cua nguoi dung giua cac lan truy cap. */
const THEME_STORAGE_KEY = 'pvehicle-theme';

/** Kieu rut gon cho phan GSAP dung o day. */
type GsapModule = typeof import('./core/gsap');

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly health = inject(HealthStore);
  private readonly transitions = inject(PageTransitionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly nav = viewChild.required<ElementRef<HTMLElement>>('nav');

  protected readonly theme = signal<Theme>(readStoredTheme());

  /** Nap dong de GSAP khong bi keo vao bundle dau vao. */
  private gsapModule: GsapModule | null = null;

  ngOnInit(): void {
    this.applyTheme(this.theme());
    this.transitions.init();
    // Biet som backend da nap mo hinh chua de con vo hieu hoa tab nhan dien.
    void this.health.check();

    void this.setupIndicator();
  }

  protected toggleTheme(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.applyTheme(next);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Trinh duyet chan luu tru (che do rieng tu) - bo qua, khong the
      // ghi nho lua chon nhung giao dien van chay binh thuong.
    }
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.dataset['theme'] = theme;
  }

  /**
   * Cho thanh chi bao truot sang tab dang chon.
   *
   * Di chuyen mot the duy nhat thay vi bat/tat tung the con - co vay moi
   * thay chi bao truot ngang giua cac tab.
   */
  private async setupIndicator(): Promise<void> {
    const navElement = this.nav().nativeElement;
    const indicator = navElement.querySelector<HTMLElement>('.nav-indicator');

    if (indicator === null) {
      return;
    }

    const module = await import('./core/gsap');
    module.registerGsap();
    this.gsapModule = module;

    // Dat vi tri dau ngay, khong hoat hinh - nguoi dung vua vao trang thi
    // chi bao phai co san o dung cho.
    this.moveIndicator(navElement, indicator, false);

    const sub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // `routerLinkActive` gan lop `active` sau khi dieu huong xong, nen
        // phai doi sang khung hinh ke tiep moi doc duoc vi tri dung.
        requestAnimationFrame(() =>
          this.moveIndicator(navElement, indicator, true),
        );
      });

    // Doi kich thuoc cua so lam cac tab xe dich - dat lai cho chi bao.
    const onResize = (): void =>
      this.moveIndicator(navElement, indicator, false);
    window.addEventListener('resize', onResize);

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
      window.removeEventListener('resize', onResize);
    });
  }

  /** Dua thanh chi bao toi duoi tab dang chon. */
  private moveIndicator(
    navElement: HTMLElement,
    indicator: HTMLElement,
    animate: boolean,
  ): void {
    const active = navElement.querySelector<HTMLElement>('a.active');
    const gsap = this.gsapModule?.gsap;

    if (gsap === undefined) {
      return;
    }

    if (active === null) {
      // Khong tab nao dang chon (duong dan la) - an chi bao di.
      gsap.to(indicator, { opacity: 0, duration: animate ? 0.2 : 0 });
      return;
    }

    const navBox = navElement.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();

    // Thanh chi bao ngan hon tab mot chut, can giua ben duoi chu.
    const width = activeBox.width * 0.45;
    const x = activeBox.left - navBox.left + (activeBox.width - width) / 2;

    gsap.to(indicator, {
      x,
      width,
      opacity: 1,
      duration: animate ? 0.45 : 0,
      ease: 'power3.inOut',
    });
  }
}

/**
 * Doc chu de da luu; neu chua co thi bam theo cai dat he dieu hanh.
 */
function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Khong doc duoc luu tru - roi xuong lua chon cua he dieu hanh.
  }

  // `matchMedia` khong ton tai trong jsdom va mot so moi truong khong phai
  // trinh duyet - thieu no thi mac dinh chu de sang.
  const prefers_dark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefers_dark ? 'dark' : 'light';
}
