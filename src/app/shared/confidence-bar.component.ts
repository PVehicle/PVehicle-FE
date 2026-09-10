import { Component, computed, input } from '@angular/core';

/** Xac suat tu nguong nay tro len duoc coi la dang tin. */
const HIGH_CONFIDENCE = 0.5;

/** Duoi nguong nay thi ket qua rat khong chac chan. */
const LOW_CONFIDENCE = 0.15;

/**
 * Thanh the hien xac suat cua mot du doan.
 *
 * Dung `role="meter"` thay vi `progressbar` vi day la gia tri do duoc,
 * khong phai tien do cua mot tac vu.
 */
@Component({
  selector: 'app-confidence-bar',
  host: { class: 'confidence-bar' },
  template: `
    <div
      class="track"
      role="meter"
      [attr.aria-valuenow]="percent()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-label]="label()">
      <div class="fill" [class]="level()" [style.width.%]="percent()"></div>
    </div>
  `,
  styles: `
    .track {
      height: 0.5rem;
      overflow: hidden;
      background: var(--mat-sys-surface-variant);
      border-radius: 999px;
    }

    .fill {
      height: 100%;
      border-radius: 999px;
      transition: width 200ms ease-out;
    }

    // Mau di kem chu o component cha, khong dung mau lam tin hieu duy nhat.
    .fill.high {
      background: var(--mat-sys-primary);
    }

    .fill.medium {
      background: var(--mat-sys-tertiary);
    }

    .fill.low {
      background: var(--mat-sys-error);
    }
  `,
})
export class ConfidenceBarComponent {
  /** Xac suat trong khoang 0-1. */
  readonly confidence = input.required<number>();

  /** Nhan cho trinh doc man hinh. */
  readonly label = input<string>('Độ tin cậy');

  protected readonly percent = computed(() =>
    Math.round(this.confidence() * 100),
  );

  protected readonly level = computed(() => {
    const value = this.confidence();
    if (value >= HIGH_CONFIDENCE) {
      return 'high';
    }
    return value >= LOW_CONFIDENCE ? 'medium' : 'low';
  });
}
