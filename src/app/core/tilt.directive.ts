import {
  DestroyRef,
  Directive,
  ElementRef,
  OnInit,
  inject,
  input,
} from '@angular/core';

import { gsap, registerGsap } from './gsap';

/** Do nghieng toi da, tinh bang do. */
const MAX_TILT = 9;

/**
 * The nghieng theo vi tri con tro, nhu mot tam the co the cam nghieng.
 *
 * Chi bat tren thiet bi co con tro that (chuot). Man hinh cam ung khong co
 * `hover` nen hieu ung nay vo nghia o do, va nguoi dung giam chuyen dong
 * cung duoc bo qua.
 */
@Directive({
  selector: '[appTilt]',
})
export class TiltDirective implements OnInit {
  /** Do manh cua hieu ung, 1 la mac dinh. */
  readonly tiltStrength = input(1);

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
          const strength = this.tiltStrength();
          const quickX = gsap.quickTo(element, 'rotationY', {
            duration: 0.5,
            ease: 'power3.out',
          });
          const quickY = gsap.quickTo(element, 'rotationX', {
            duration: 0.5,
            ease: 'power3.out',
          });

          gsap.set(element, {
            transformPerspective: 900,
            transformStyle: 'preserve-3d',
          });

          const onMove = (event: PointerEvent): void => {
            const rect = element.getBoundingClientRect();
            // Doi vi tri con tro ve khoang -0.5 .. 0.5 quanh tam the.
            const px = (event.clientX - rect.left) / rect.width - 0.5;
            const py = (event.clientY - rect.top) / rect.height - 0.5;

            quickX(px * MAX_TILT * 2 * strength);
            quickY(-py * MAX_TILT * 2 * strength);
          };

          const onLeave = (): void => {
            quickX(0);
            quickY(0);
          };

          element.addEventListener('pointermove', onMove);
          element.addEventListener('pointerleave', onLeave);

          return () => {
            element.removeEventListener('pointermove', onMove);
            element.removeEventListener('pointerleave', onLeave);
          };
        },
      );
    }, element);

    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
