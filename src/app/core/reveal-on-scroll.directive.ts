import {
  DestroyRef,
  Directive,
  ElementRef,
  OnInit,
  inject,
  input,
} from '@angular/core';

import { gsap, registerGsap } from './gsap';

/**
 * Cho phan tu hien ra khi cuon toi.
 *
 * Dat `appReveal` len mot khoi de chinh no troi len, hoac truyen mot
 * selector con qua `revealChildren` de cac phan tu ben trong hien lan luot.
 *
 * ```html
 * <section appReveal revealChildren=".card">...</section>
 * ```
 */
@Directive({
  selector: '[appReveal]',
})
export class RevealOnScrollDirective implements OnInit {
  /** Selector cac phan tu con can hien lan luot. Rong thi hien chinh no. */
  readonly revealChildren = input('');

  /** Do tre giua cac phan tu con, tinh bang giay. */
  readonly revealStagger = input(0.12);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    registerGsap();

    const element = this.host.nativeElement as HTMLElement;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        // Ton trong lua chon giam chuyen dong: hien ngay, khong hoat hinh.
        gsap.set(element, { opacity: 1, clearProps: 'transform' });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const selector = this.revealChildren();
        const targets = selector
          ? Array.from(element.querySelectorAll(selector))
          : [element];

        if (targets.length === 0) {
          return;
        }

        gsap.from(targets, {
          opacity: 0,
          y: 28,
          duration: 0.7,
          ease: 'power3.out',
          stagger: selector ? this.revealStagger() : 0,
          scrollTrigger: {
            trigger: element,
            // Bat dau khi dinh khoi len toi 82% chieu cao man hinh - luc
            // do nguoi dung da nhin thay phan dau cua khoi.
            start: 'top 82%',
            // `play none none reverse`: chay khi cuon toi, lui lai khi cuon
            // nguoc len de quay lai van thay hieu ung.
            toggleActions: 'play none none reverse',
          },
        });
      });
    }, element);

    // `revert()` huy ca tween lan ScrollTrigger tao ra ben trong context.
    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
