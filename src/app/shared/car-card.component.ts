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
      position: relative;
      display: block;
      padding: 1.1rem;
      overflow: hidden;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--app-radius-lg);
      background: var(--mat-sys-surface-container-low);
      transition:
        transform var(--app-duration) var(--app-spring),
        border-color var(--app-duration) var(--app-ease),
        box-shadow var(--app-duration) var(--app-ease);
    }

    :host:hover {
      transform: translateY(-3px);
      border-color: color-mix(in srgb, var(--mat-sys-primary) 45%, transparent);
      box-shadow: var(--app-shadow-md);
    }

    // Vach mau doc ben trai, hien ra khi ro chuot vao the.
    :host::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--mat-sys-primary);
      transform: scaleY(0);
      transform-origin: center;
      transition: transform var(--app-duration) var(--app-ease);
    }

    :host:hover::before {
      transform: scaleY(1);
    }

    .name {
      margin: 0 0 0.85rem;
      font: var(--mat-sys-title-small);
      font-weight: 650;
      letter-spacing: -0.01em;
    }

    .specs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
      gap: 0.65rem 1rem;
      margin: 0;
    }

    .specs div {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    dt {
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    dd {
      margin: 0;
      font: var(--mat-sys-body-medium);
      font-weight: 550;
    }

    .score {
      display: inline-block;
      margin: 0.9rem 0 0;
      padding: 0.25rem 0.7rem;
      border-radius: var(--app-radius-pill);
      background: color-mix(in srgb, var(--mat-sys-primary) 14%, transparent);
      color: var(--mat-sys-primary);
      font: var(--mat-sys-label-medium);
      font-weight: 600;
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
