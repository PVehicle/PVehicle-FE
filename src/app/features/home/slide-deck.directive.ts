import {
  DestroyRef,
  Directive,
  ElementRef,
  OnInit,
  inject,
  input,
} from '@angular/core';

import { ScrollTrigger, gsap, registerGsap } from '../../core/gsap';

/**
 * Bien cac phan tu con thanh mot chuoi "slide" chiem tron man hinh.
 *
 * Cuon toi giua mot slide thi trang tu bat sang slide do, giong trinh
 * chieu. Moi slide co hieu ung rieng khi vao va mo dan khi bi cuon qua.
 *
 * Chi bat tren man hinh du cao va khi nguoi dung khong yeu cau giam
 * chuyen dong - man hinh thap ma ep 100vh thi noi dung bi cat.
 */
@Directive({
  selector: '[appSlideDeck]',
})
export class SlideDeckDirective implements OnInit {
  /** Selector cua tung slide ben trong. */
  readonly slideSelector = input('.slide');

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    registerGsap();

    const root = this.host.nativeElement as HTMLElement;

    const ctx = gsap.context(() => {
      const slides = Array.from(
        root.querySelectorAll<HTMLElement>(this.slideSelector()),
      );

      if (slides.length === 0) {
        return;
      }

      const mm = gsap.matchMedia();

      // Man hinh thap hoac nguoi dung giam chuyen dong: bo che do slide,
      // trang tro ve dang cuon thuong.
      mm.add(
        '(prefers-reduced-motion: reduce), (max-height: 34rem)',
        () => {
          root.classList.remove('deck-active');
        },
      );

      mm.add(
        '(prefers-reduced-motion: no-preference) and (min-height: 34.01rem)',
        () => {
          root.classList.add('deck-active');

          // Bat sang slide gan nhat khi nguoi dung dung cuon.
          const snapTrigger = ScrollTrigger.create({
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            snap: {
              // Chia deu theo so slide: 3 slide -> moc 0, 0.5, 1.
              snapTo: 1 / (slides.length - 1),
              duration: { min: 0.25, max: 0.6 },
              delay: 0.08,
              ease: 'power2.inOut',
            },
          });

          // Tung slide: noi dung troi len khi vao, mo dan khi bi cuon qua.
          slides.forEach((slide, index) => {
            const content = slide.querySelector('.slide-inner');
            if (content === null) {
              return;
            }

            // Slide dau tien da co hieu ung rieng luc tai trang.
            if (index > 0) {
              gsap.from(content, {
                opacity: 0,
                y: 60,
                scale: 0.97,
                duration: 0.9,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: slide,
                  start: 'top 65%',
                  toggleActions: 'play none none reverse',
                },
              });
            }

            // Slide cuoi khong can mo di - phia sau no khong con gi.
            if (index < slides.length - 1) {
              gsap.to(content, {
                opacity: 0.15,
                scale: 0.95,
                ease: 'none',
                scrollTrigger: {
                  trigger: slide,
                  start: 'bottom 85%',
                  end: 'bottom 25%',
                  scrub: true,
                },
              });
            }
          });

          return () => snapTrigger.kill();
        },
      );
    }, root);

    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
