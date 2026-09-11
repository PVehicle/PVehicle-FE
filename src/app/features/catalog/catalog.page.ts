import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CarCardComponent } from '../../shared/car-card.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { FiltersStore } from '../../core/filters.store';
import { CatalogFiltersComponent } from './catalog-filters.component';
import { CatalogStore } from './catalog.store';
import type { CatalogFilters } from './catalog.store';

/** Trang danh muc toan bo dong xe, co loc va phan trang. */
@Component({
  selector: 'app-catalog-page',
  imports: [
    RouterLink,
    CarCardComponent,
    CatalogFiltersComponent,
    EmptyStateComponent,
  ],
  template: `
    <section class="page">
      <h1 class="app-enter">Danh mục <span class="app-gradient-text">xe</span></h1>

      <app-catalog-filters
        [filters]="store.filters()"
        [hasFilters]="store.hasFilters()"
        (filtersChanged)="onFiltersChanged($event)"
        (cleared)="store.clearFilters()" />

      @if (store.error(); as message) {
        <p class="error" role="alert">{{ message }}</p>
      }

      @if (store.loading()) {
        <div class="skeleton-grid" role="status" aria-label="Đang tải danh mục">
          @for (item of skeletonRows; track item) {
            <div class="app-skeleton skeleton-card"></div>
          }
        </div>
      }

      @if (store.isEmpty() && !store.error()) {
        <app-empty-state
          title="Không có xe nào phù hợp"
          [hints]="store.hasFilters() ? filteredHints : emptyHints" />
      } @else if (!store.loading()) {
        <p class="summary" role="status">
          {{ store.total() }} dòng xe · Trang {{ store.currentPage() }}/{{
            store.pageCount()
          }}
        </p>

        <ul class="grid app-stagger">
          @for (car of store.cars(); track car.class_name) {
            <li>
              <a
                class="card-link"
                [routerLink]="['/danh-muc', car.class_name]"
                [attr.aria-label]="'Xem chi tiết ' + car.class_name">
                <app-car-card [car]="car" />
              </a>
            </li>
          }
        </ul>

        <nav class="pagination" aria-label="Phân trang danh mục">
          <button
            type="button"
            class="app-btn app-btn--ghost"
            [disabled]="!store.hasPrevious()"
            (click)="store.previousPage()">
            ← Trang trước
          </button>

          <span aria-live="polite">
            Trang {{ store.currentPage() }} / {{ store.pageCount() }}
          </span>

          <button
            type="button"
            class="app-btn app-btn--ghost"
            [disabled]="!store.hasNext()"
            (click)="store.nextPage()">
            Trang sau →
          </button>
        </nav>
      }
    </section>
  `,
  styles: `
    .page {
      max-width: 72rem;
      margin: 0 auto;
      padding: 1.5rem 1rem 4rem;
    }

    h1 {
      margin: 0 0 0.5rem;
      font-family: var(--app-font-display);
      font-size: clamp(1.85rem, 4vw, 2.5rem);
      font-weight: 700;
      letter-spacing: -0.03em;
    }


    .summary {
      margin: 0 0 1rem;
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
      gap: 0.85rem;
      margin: 1rem 0;
      padding: 0;
      list-style: none;
    }

    .card-link {
      display: block;
      color: inherit;
      text-decoration: none;
      border-radius: var(--app-radius-lg);
    }

    // --- Skeleton luc dang tai ------------------------------------------

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
      gap: 0.85rem;
      margin: 1rem 0;
    }

    .skeleton-card {
      height: 11rem;
    }

    // --- Phan trang ------------------------------------------------------

    .pagination {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    .pagination span {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-label-large);
      font-variant-numeric: tabular-nums;
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
export class CatalogPage implements OnInit {
  protected readonly store = inject(CatalogStore);
  private readonly filtersStore = inject(FiltersStore);

  /** Sáu ô xám lấp chỗ trong lúc chờ dữ liệu. */
  protected readonly skeletonRows = [0, 1, 2, 3, 4, 5];

  protected readonly emptyHints = [
    'Danh mục hiện chưa có dữ liệu, thử tải lại trang',
  ];

  protected readonly filteredHints = [
    'Thử bỏ bớt một điều kiện lọc',
    'Kiểm tra lại chính tả tên hãng xe',
    'Bấm "Xóa bộ lọc" để xem toàn bộ danh mục',
  ];

  ngOnInit(): void {
    void this.filtersStore.load();
    void this.store.load();
  }

  protected onFiltersChanged(filters: CatalogFilters): void {
    void this.store.setFilters(filters);
  }
}
