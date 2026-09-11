import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CarCardComponent } from '../../shared/car-card.component';
import { FuelPipe } from '../../shared/fuel.pipe';
import { PricePipe } from '../../shared/price.pipe';
import { CarDetailStore } from './car-detail.store';

/**
 * Trang chi tiet mot dong xe, kem cac xe tuong tu.
 *
 * `className` nhan tu route param nho `withComponentInputBinding()`.
 * Angular da giai ma san gia tri nen khong can `decodeURIComponent()`.
 */
@Component({
  selector: 'app-car-detail-page',
  imports: [RouterLink, CarCardComponent, PricePipe, FuelPipe],
  template: `
    <section class="page">
      <nav class="breadcrumb">
        <a routerLink="/danh-muc">← Về danh mục</a>
      </nav>

      @if (store.loading()) {
        <p class="notice" role="status">Đang tải thông số...</p>
      }

      @if (store.error(); as message) {
        <p class="error" role="alert">{{ message }}</p>
      }

      @if (store.car(); as car) {
        <h1 class="app-enter">{{ car.class_name }}</h1>

        <dl class="specs app-enter">
          <div>
            <dt>Hãng</dt>
            <dd>{{ car.brand }}</dd>
          </div>
          <div>
            <dt>Dòng</dt>
            <dd>{{ car.model }}</dd>
          </div>
          <div>
            <dt>Năm</dt>
            <dd>{{ car.year }}</dd>
          </div>
          <div>
            <dt>Kiểu dáng</dt>
            <dd>{{ car.body_style }}</dd>
          </div>
          <div>
            <dt>Số chỗ</dt>
            <dd>{{ car.seats }} chỗ</dd>
          </div>
          <div>
            <dt>Giá</dt>
            <dd>{{ car.price_million_vnd | price }}</dd>
          </div>
          <div>
            <dt>Tiêu hao</dt>
            <dd>{{ car.fuel_l_per_100km | fuel }}</dd>
          </div>
        </dl>

        <p class="note">
          Giá và mức tiêu hao của xe quốc tế là số liệu mô phỏng, không phải
          giá thị trường.
        </p>

        @if (store.similarCars().length > 0) {
          <h2>Xe tương tự</h2>
          <ul class="grid app-stagger">
            @for (similar of store.similarCars(); track similar.class_name) {
              <li>
                <a
                  class="card-link"
                  [routerLink]="['/danh-muc', similar.class_name]"
                  [attr.aria-label]="'Xem chi tiết ' + similar.class_name">
                  <app-car-card [car]="similar" />
                </a>
              </li>
            }
          </ul>
        }
      }
    </section>
  `,
  styles: `
    .page {
      max-width: 72rem;
      margin: 0 auto;
      padding: 1.5rem 1rem 4rem;
    }

    .breadcrumb {
      margin-bottom: 1rem;
    }

    .breadcrumb a {
      display: inline-flex;
      align-items: center;
      padding: 0.35rem 0.8rem;
      border-radius: var(--app-radius-pill);
      color: var(--mat-sys-primary);
      text-decoration: none;
      font: var(--mat-sys-label-large);
      transition:
        background-color var(--app-duration-fast) var(--app-ease),
        transform var(--app-duration-fast) var(--app-spring);
    }

    .breadcrumb a:hover {
      background: var(--mat-sys-surface-container);
      transform: translateX(-3px);
    }

    h1 {
      margin: 0 0 1.25rem;
      font-family: var(--app-font-display);
      font-size: clamp(1.75rem, 3.8vw, 2.4rem);
      font-weight: 700;
      letter-spacing: -0.03em;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin: 2.5rem 0 1rem;
      font: var(--mat-sys-title-medium);
      font-weight: 650;
    }

    h2::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--mat-sys-outline-variant);
    }

    .specs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
      gap: 1rem 1.5rem;
      margin: 0 0 1rem;
      padding: 1.25rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--app-radius-lg);
      background: var(--app-gradient), var(--mat-sys-surface-container-low);
    }

    .specs div {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    dt {
      font: var(--mat-sys-label-small);
      color: var(--mat-sys-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    dd {
      margin: 0;
      font: var(--mat-sys-body-large);
      font-weight: 600;
    }

    .note {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
      gap: 0.85rem;
      padding: 0;
      list-style: none;
    }

    .card-link {
      display: block;
      color: inherit;
      text-decoration: none;
      border-radius: var(--app-radius-lg);
    }

    .notice,
    .error {
      padding: 0.85rem 1rem;
      border-radius: var(--app-radius-md);
    }

    .notice {
      background: var(--mat-sys-surface-container);
    }

    .error {
      border-left: 3px solid var(--mat-sys-error);
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
      animation: app-fade-in-up var(--app-duration) var(--app-ease) both;
    }
  `,
})
export class CarDetailPage {
  readonly className = input.required<string>();

  protected readonly store = inject(CarDetailStore);

  constructor() {
    // Bam vao mot xe tuong tu se doi route param ma khong dung lai
    // component - `effect` bat duoc thay doi do, `ngOnInit` thi khong.
    effect(() => {
      void this.store.load(this.className());
    });
  }
}
