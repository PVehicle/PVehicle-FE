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
 * Quang sang mo di theo con tro, nhu den studio roi tren san khau.
 *
 * Directive dat tren mot khoi chua; no tao mot lop phu ben trong roi cho
 * lop do bam theo chuot. Toa do ghi vao bien CSS `--spot-x` / `--spot-y`
 * de phan trinh bay nam het trong stylesheet.
 *
 * Chi bat tren thiet bi co con tro that. Man hinh cam ung khong co hover
 * nen den se dung yen mot cho, vo nghia.
 */
@Directive({
  selector: '[appSpotlight]',
})
export class SpotlightDirective implements OnInit {
  /** Ban kinh quang sang, don vi CSS. */
  readonly spotlightSize = input('34rem');

  /** Do dam cua quang sang, 0 den 1. */
  readonly spotlightOpacity = input(0.16);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    registerGsap();

    const host = this.host.nativeElement as HTMLElement;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        () => {
          const light = document.createElement('span');
          light.className = 'spotlight-layer';
          light.setAttribute('aria-hidden', 'true');
          light.style.setProperty('--spot-size', this.spotlightSize());
          light.style.setProperty(
            '--spot-strength',
            String(this.spotlightOpacity()),
          );
          // Dat gia tri dau; thieu buoc nay GSAP khong biet doc tu dau.
          // Dung so thuan roi ghep don vi bang calc() trong CSS - GSAP
          // animate custom property tot nhat khi gia tri la so.
          gsap.set(light, { '--spot-x': 0, '--spot-y': 0, opacity: 0 });
          host.appendChild(light);

          // `quickTo` tao san tween roi chi doi gia tri dich - hop voi su
          // kien ban lien tuc nhu `pointermove`, khong tao tween moi moi
          // lan chuot nhich.
          const moveX = gsap.quickTo(light, '--spot-x', {
            duration: 0.55,
            ease: 'power3.out',
          });
          const moveY = gsap.quickTo(light, '--spot-y', {
            duration: 0.55,
            ease: 'power3.out',
          });

          const onMove = (event: PointerEvent): void => {
            const rect = host.getBoundingClientRect();
            moveX(event.clientX - rect.left);
            moveY(event.clientY - rect.top);
          };

          const onEnter = (): void => {
            gsap.to(light, { opacity: 1, duration: 0.4 });
          };

          const onLeave = (): void => {
            // Mo di khi chuot roi khoi khoi, khong de den treo lo lung.
            gsap.to(light, { opacity: 0, duration: 0.5 });
          };

          host.addEventListener('pointermove', onMove);
          host.addEventListener('pointerenter', onEnter);
          host.addEventListener('pointerleave', onLeave);

          return () => {
            host.removeEventListener('pointermove', onMove);
            host.removeEventListener('pointerenter', onEnter);
            host.removeEventListener('pointerleave', onLeave);
            light.remove();
          };
        },
      );
    }, host);

    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
