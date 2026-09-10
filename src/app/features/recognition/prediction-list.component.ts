import { PercentPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { CarCardComponent } from '../../shared/car-card.component';
import { ConfidenceBarComponent } from '../../shared/confidence-bar.component';
import type { DetectedVehicle } from '../../core/models';

/** Nhan tieng Viet cho mo hinh dua ra ket qua. */
const SOURCE_LABEL: Record<string, string> = {
  international: 'Xe quốc tế',
  vietnam: 'Xe Việt Nam',
};

/**
 * Ket qua nhan dien cua mot chiec xe: cac kha nang, thong so, xe tuong tu.
 */
@Component({
  selector: 'app-prediction-list',
  imports: [PercentPipe, ConfidenceBarComponent, CarCardComponent],
  template: `
    @if (!vehicle().is_confident) {
      <p class="warning" role="alert">
        Độ tin cậy chỉ {{ topConfidence() | percent: '1.1-1' }} — kết quả chỉ
        mang tính tham khảo, không nên xem là kết luận chắc chắn.
      </p>
    }

    <p class="source">
      Nguồn: {{ sourceLabel() }}
      @if (vehicle().box === null) {
        · Không khoanh được vùng xe, hệ thống phân loại toàn bộ ảnh
      }
    </p>

    <h3>Các khả năng</h3>
    <ol class="predictions app-stagger">
      @for (prediction of vehicle().predictions; track prediction.class_name) {
        <li>
          <span class="label">{{ prediction.class_name }}</span>
          <app-confidence-bar
            [confidence]="prediction.confidence"
            [label]="prediction.class_name" />
          <span class="value">
            {{ prediction.confidence | percent: '1.1-1' }}
          </span>
        </li>
      } @empty {
        <li>Không nhận diện được xe nào.</li>
      }
    </ol>

    @if (vehicle().specs; as specs) {
      <h3>Thông số kỹ thuật</h3>
      <app-car-card [car]="specs" />
      <p class="note">
        Giá và mức tiêu hao của xe quốc tế là số liệu mô phỏng, không phải
        giá thị trường.
      </p>
    }

    @if (similarCars().length > 0) {
      <h3>Xe tương tự</h3>
      <div class="similar app-stagger">
        @for (car of similarCars(); track car.class_name) {
          <app-car-card [car]="car" />
        }
      </div>
    }
  `,
  styles: `
    .warning {
      padding: 0.85rem 1rem;
      border-left: 3px solid var(--mat-sys-error);
      border-radius: var(--app-radius-md);
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
      animation: app-fade-in-up var(--app-duration) var(--app-ease) both;
    }

    .source,
    .note {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }

    h3 {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin: 1.75rem 0 0.75rem;
      font: var(--mat-sys-title-small);
      font-weight: 650;
      letter-spacing: -0.01em;
    }

    // Vach ngang keo dai het phan con lai cua dong tieu de.
    h3::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--mat-sys-outline-variant);
    }

    .predictions {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .predictions li {
      display: grid;
      grid-template-columns: 1fr 7rem 3.5rem;
      align-items: center;
      gap: 0.85rem;
      padding: 0.5rem 0.6rem;
      border-radius: var(--app-radius-sm);
      transition: background-color var(--app-duration-fast) var(--app-ease);
    }

    .predictions li:hover {
      background: var(--mat-sys-surface-container);
    }

    // Kha nang cao nhat duoc lam noi bat.
    .predictions li:first-child .label {
      font-weight: 650;
    }

    .value {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-weight: 600;
    }

    .similar {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
      gap: 0.85rem;
    }

    // Man hinh hep: cho ten xuong dong rieng de thanh xac suat con cho.
    @media (max-width: 30rem) {
      .predictions li {
        grid-template-columns: 1fr 3.5rem;
      }

      .label {
        grid-column: 1 / -1;
      }
    }
  `,
})
export class PredictionListComponent {
  readonly vehicle = input.required<DetectedVehicle>();

  protected readonly topConfidence = computed(
    () => this.vehicle().predictions[0]?.confidence ?? 0,
  );

  protected readonly similarCars = computed(
    () => this.vehicle().similar_cars ?? [],
  );

  protected readonly sourceLabel = computed(() => {
    const source = this.vehicle().source ?? 'international';
    return SOURCE_LABEL[source] ?? source;
  });
}
