import {
  DestroyRef,
  Directive,
  ElementRef,
  OnInit,
  inject,
} from '@angular/core';

import { gsap, registerGsap } from './gsap';

/**
 * To sang duong vien cua the o phia con tro dang o.
 *
 * Khac `appSpotlight` (quang sang lon phu ca khoi), cai nay chi lam sang
 * mot doan vien - nhu anh den hat vao canh mot vat the.
 *
 * Toa do ghi bang phan tram nen khong phu thuoc kich thuoc the.
 */
@Directive({
  selector: '[appEdgeLight]',
  host: { class: 'edge-light' },
})
export class EdgeLightDirective implements OnInit {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    registerGsap();

    const element = this.host.nativeElement as HTMLElement;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        () => {
          gsap.set(element, { '--edge-x': 50, '--edge-y': 50 });

          const moveX = gsap.quickTo(element, '--edge-x', {
            duration: 0.4,
            ease: 'power2.out',
          });
          const moveY = gsap.quickTo(element, '--edge-y', {
            duration: 0.4,
            ease: 'power2.out',
          });

          const onMove = (event: PointerEvent): void => {
            const rect = element.getBoundingClientRect();
            moveX(((event.clientX - rect.left) / rect.width) * 100);
            moveY(((event.clientY - rect.top) / rect.height) * 100);
          };

          element.addEventListener('pointermove', onMove);

          return () => element.removeEventListener('pointermove', onMove);
        },
      );
    }, element);

    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
