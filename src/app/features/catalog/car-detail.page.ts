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
        <h1>{{ car.class_name }}</h1>

        <dl class="specs">
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
          <ul class="grid">
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
      padding: 1rem;
    }

    .breadcrumb a {
      color: var(--mat-sys-primary);
    }

    h1 {
      font: var(--mat-sys-headline-small);
    }

    h2 {
      margin-top: 2rem;
      font: var(--mat-sys-title-medium);
    }

    .specs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
      gap: 0.75rem 1.5rem;
      margin: 1rem 0;
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
      font: var(--mat-sys-body-large);
    }

    .note {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
      gap: 0.75rem;
      padding: 0;
      list-style: none;
    }

    .card-link {
      display: block;
      color: inherit;
      text-decoration: none;
      border-radius: 0.75rem;
    }

    .card-link:hover app-car-card {
      border-color: var(--mat-sys-primary);
    }

    .notice,
    .error {
      padding: 0.75rem;
      border-radius: 0.5rem;
    }

    .notice {
      background: var(--mat-sys-surface-variant);
    }

    .error {
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
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
