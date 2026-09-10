import { Component, inject, input, output } from '@angular/core';

import { FiltersStore } from '../../core/filters.store';
import type { CatalogFilters } from './catalog.store';

/**
 * Form loc danh muc xe.
 *
 * Cac lua chon lay tu `/cars/filters` chu khong viet cung, tru o "Hang" -
 * backend khong tra ve danh sach hang nen o do de nguoi dung tu go.
 */
@Component({
  selector: 'app-catalog-filters',
  template: `
    <form class="filters" (submit)="$event.preventDefault()">
      <div class="field">
        <label for="filter-brand">Hãng xe</label>
        <input
          id="filter-brand"
          type="search"
          placeholder="Ví dụ: Toyota"
          [value]="filters().brand ?? ''"
          (change)="onBrandChange($event)" />
      </div>

      <div class="field">
        <label for="filter-body-style">Kiểu dáng</label>
        <select
          id="filter-body-style"
          [value]="filters().bodyStyle ?? ''"
          (change)="onBodyStyleChange($event)">
          <option value="">Tất cả</option>
          @for (choice of store.bodyStyles(); track choice.value) {
            <option [value]="choice.value">{{ choice.label }}</option>
          }
        </select>
      </div>

      <div class="field">
        <label for="filter-segment">Phân khúc</label>
        <select
          id="filter-segment"
          [value]="filters().segment ?? ''"
          (change)="onSegmentChange($event)">
          <option value="">Tất cả</option>
          @for (choice of store.segments(); track choice.value) {
            <option [value]="choice.value">{{ choice.label }}</option>
          }
        </select>
      </div>

      @if (hasFilters()) {
        <button type="button" class="app-btn app-btn--ghost clear" (click)="cleared.emit()">
          Xóa bộ lọc
        </button>
      }
    </form>

    @if (store.error(); as message) {
      <p class="error" role="alert">
        Không tải được danh sách bộ lọc: {{ message }}
      </p>
    }
  `,
  styles: `
    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      align-items: end;
      gap: 0.85rem;
      margin: 1.25rem 0;
      padding: 1.1rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--app-radius-lg);
      background: var(--mat-sys-surface-container-low);
      animation: app-fade-in-up var(--app-duration) var(--app-ease) both;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    label {
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    input,
    select {
      padding: 0.55rem 0.85rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--app-radius-sm);
      background: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface);
      font: var(--mat-sys-body-medium);
      transition:
        border-color var(--app-duration-fast) var(--app-ease),
        box-shadow var(--app-duration-fast) var(--app-ease);
    }

    input:hover,
    select:hover {
      border-color: color-mix(in srgb, var(--mat-sys-primary) 50%, transparent);
    }

    input:focus,
    select:focus {
      outline: none;
      border-color: var(--mat-sys-primary);
      box-shadow: 0 0 0 3px
        color-mix(in srgb, var(--mat-sys-primary) 18%, transparent);
    }

    .clear {
      animation: app-pop-in var(--app-duration) var(--app-spring) both;
    }

    .error {
      color: var(--mat-sys-error);
      font: var(--mat-sys-body-small);
    }
  `,
})
export class CatalogFiltersComponent {
  readonly filters = input.required<CatalogFilters>();
  readonly hasFilters = input(false);

  readonly filtersChanged = output<CatalogFilters>();
  readonly cleared = output<void>();

  protected readonly store = inject(FiltersStore);

  /** O trong nghia la khong loc theo truong do. */
  private readValue(event: Event): string | null {
    const value = (
      event.target as HTMLInputElement | HTMLSelectElement
    ).value.trim();
    return value === '' ? null : value;
  }

  protected onBrandChange(event: Event): void {
    this.filtersChanged.emit({
      ...this.filters(),
      brand: this.readValue(event),
    });
  }

  protected onBodyStyleChange(event: Event): void {
    this.filtersChanged.emit({
      ...this.filters(),
      bodyStyle: this.readValue(event),
    });
  }

  protected onSegmentChange(event: Event): void {
    this.filtersChanged.emit({
      ...this.filters(),
      segment: this.readValue(event),
    });
  }
}
