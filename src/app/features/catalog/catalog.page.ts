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
      <h1>Danh mục xe</h1>

      <app-catalog-filters
        [filters]="store.filters()"
        [hasFilters]="store.hasFilters()"
        (filtersChanged)="onFiltersChanged($event)"
        (cleared)="store.clearFilters()" />

      @if (store.error(); as message) {
        <p class="error" role="alert">{{ message }}</p>
      }

      @if (store.loading()) {
        <p class="notice" role="status">Đang tải danh mục...</p>
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

        <ul class="grid">
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
            [disabled]="!store.hasPrevious()"
            (click)="store.previousPage()">
            Trang trước
          </button>

          <span aria-live="polite">
            Trang {{ store.currentPage() }} / {{ store.pageCount() }}
          </span>

          <button
            type="button"
            [disabled]="!store.hasNext()"
            (click)="store.nextPage()">
            Trang sau
          </button>
        </nav>
      }
    </section>
  `,
  styles: `
    .page {
      max-width: 72rem;
      margin: 0 auto;
      padding: 1rem;
    }

    h1 {
      font: var(--mat-sys-headline-small);
    }

    .summary {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
      gap: 0.75rem;
      margin: 1rem 0;
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

    .pagination {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .pagination button {
      padding: 0.5rem 1rem;
      border: 1px solid var(--mat-sys-outline);
      border-radius: 999px;
      background: transparent;
      color: var(--mat-sys-on-surface);
      cursor: pointer;
    }

    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
export class CatalogPage implements OnInit {
  protected readonly store = inject(CatalogStore);
  private readonly filtersStore = inject(FiltersStore);

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
