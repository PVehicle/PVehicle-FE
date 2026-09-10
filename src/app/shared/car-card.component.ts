import { Component, computed, input } from '@angular/core';

import { FuelPipe } from './fuel.pipe';
import { PricePipe } from './price.pipe';
import type { CarSpecs, RecommendedCar } from '../core/models';

/** Nhan tieng Viet cho tung phan khuc. */
const SEGMENT_LABEL: Record<string, string> = {
  economy: 'Phổ thông',
  luxury: 'Cao cấp',
  exotic: 'Siêu xe',
};

/**
 * The hien thi thong so mot dong xe.
 *
 * Nhan duoc ca `CarSpecs` va `RecommendedCar` - loai thu hai co them
 * truong `score`, hien thi khi co.
 */
@Component({
  selector: 'app-car-card',
  imports: [PricePipe, FuelPipe],
  host: { class: 'car-card' },
  template: `
    <article>
      <h3 class="name">{{ car().class_name }}</h3>

      <dl class="specs">
        <div>
          <dt>Giá</dt>
          <dd>{{ car().price_million_vnd | price }}</dd>
        </div>
        <div>
          <dt>Tiêu hao</dt>
          <dd>{{ car().fuel_l_per_100km | fuel }}</dd>
        </div>
        <div>
          <dt>Số chỗ</dt>
          <dd>{{ car().seats }} chỗ</dd>
        </div>
        <div>
          <dt>Kiểu dáng</dt>
          <dd>{{ car().body_style }}</dd>
        </div>
        <div>
          <dt>Phân khúc</dt>
          <dd>{{ segmentLabel() }}</dd>
        </div>
        <div>
          <dt>Năm</dt>
          <dd>{{ car().year }}</dd>
        </div>
      </dl>

      @if (score() !== null) {
        <p class="score">Điểm phù hợp: {{ score()!.toFixed(1) }}</p>
      }
    </article>
  `,
  styles: `
    :host {
      display: block;
      padding: 1rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 0.75rem;
    }

    .name {
      margin: 0 0 0.75rem;
      font: var(--mat-sys-title-small);
    }

    .specs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
      gap: 0.5rem 1rem;
      margin: 0;
    }

    .specs div {
      display: flex;
      flex-direction: column;
    }

    dt {
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
    }

    dd {
      margin: 0;
      font: var(--mat-sys-body-medium);
    }

    .score {
      margin: 0.75rem 0 0;
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class CarCardComponent {
  readonly car = input.required<CarSpecs | RecommendedCar>();

  /** `score` chi co o `RecommendedCar`. */
  protected readonly score = computed(() => {
    const car = this.car();
    return 'score' in car ? car.score : null;
  });

  protected readonly segmentLabel = computed(() => {
    const segment = this.car().segment;
    return SEGMENT_LABEL[segment] ?? segment;
  });
}
