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
 * Dem so tang dan khi cuon toi.
 *
 * ```html
 * <span appCountUp [countTo]="95.3" [decimals]="1">95,3</span>
 * ```
 *
 * Noi dung ban dau trong the la gia tri cuoi cung - de san o day de nguoi
 * dung khong thay so 0 neu JavaScript chua chay hoac bi tat.
 */
@Directive({
  selector: '[appCountUp]',
})
export class CountUpDirective implements OnInit {
  /** Gia tri dich. */
  readonly countTo = input.required<number>();

  /** So chu so thap phan. */
  readonly decimals = input(0);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    registerGsap();

    const element = this.host.nativeElement as HTMLElement;
    const target = this.countTo();
    const decimals = this.decimals();

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Giam chuyen dong: giu nguyen so da co san trong the.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const counter = { value: 0 };

        gsap.to(counter, {
          value: target,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            // Chi dem mot lan, dem lai moi lan cuon qua se gay roi mat.
            once: true,
          },
          onUpdate: () => {
            // Tieng Viet dung dau phay lam dau thap phan.
            element.textContent = counter.value
              .toFixed(decimals)
              .replace('.', ',');
          },
        });
      });
    }, element);

    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
