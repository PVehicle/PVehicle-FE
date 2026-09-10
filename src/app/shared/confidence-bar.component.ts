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
      position: relative;
      height: 0.55rem;
      overflow: hidden;
      background: var(--mat-sys-surface-container-high);
      border-radius: var(--app-radius-pill);
    }

    .fill {
      height: 100%;
      border-radius: var(--app-radius-pill);
      // Thanh chay tu 0 den gia tri that khi xuat hien.
      animation: bar-grow var(--app-duration-slow) var(--app-ease) both;
      transition: width var(--app-duration) var(--app-ease);
    }

    @keyframes bar-grow {
      from {
        transform: scaleX(0);
        transform-origin: left;
      }
      to {
        transform: scaleX(1);
        transform-origin: left;
      }
    }

    // Mau di kem chu o component cha, khong dung mau lam tin hieu duy nhat.
    .fill.high {
      background: linear-gradient(
        90deg,
        var(--mat-sys-primary),
        color-mix(in srgb, var(--mat-sys-tertiary) 70%, var(--mat-sys-primary))
      );
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
