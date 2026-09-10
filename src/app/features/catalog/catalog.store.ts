import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { toMessage } from '../../core/error.interceptor';
import type { CarSpecs } from '../../core/models';

/** So xe hien thi tren mot trang. */
export const PAGE_SIZE = 20;

/** Bo loc dang ap dung. `null` nghia la khong loc theo truong do. */
export interface CatalogFilters {
  brand: string | null;
  bodyStyle: string | null;
  segment: string | null;
}

export const EMPTY_FILTERS: CatalogFilters = {
  brand: null,
  bodyStyle: null,
  segment: null,
};

interface CatalogState {
  cars: CarSpecs[];
  total: number;
  offset: number;
  filters: CatalogFilters;
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: CatalogState = {
  cars: [],
  total: 0,
  offset: 0,
  filters: EMPTY_FILTERS,
  loading: false,
  error: null,
};

export const CatalogStore = signalStore(
  { providedIn: 'root' },
  withState(INITIAL_STATE),
  withComputed(({ total, offset, cars, loading, filters }) => ({
    /** Trang hien tai, dem tu 1 cho nguoi dung de hieu. */
    currentPage: computed(() => Math.floor(offset() / PAGE_SIZE) + 1),

    pageCount: computed(() => Math.max(1, Math.ceil(total() / PAGE_SIZE))),

    hasPrevious: computed(() => offset() > 0),

    hasNext: computed(() => offset() + PAGE_SIZE < total()),

    /** Danh sach rong that su, khong phai dang tai. */
    isEmpty: computed(() => !loading() && cars().length === 0),

    /** Co bo loc nao dang bat khong - de goi y nguoi dung xoa loc. */
    hasFilters: computed(() => {
      const value = filters();
      return (
        value.brand !== null ||
        value.bodyStyle !== null ||
        value.segment !== null
      );
    }),
  })),
  withMethods((store, api = inject(ApiService)) => {
    /** Goi may chu voi bo loc va vi tri trang hien tai. */
    async function fetchPage(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const filters = store.filters();
        const response = await firstValueFrom(
          api.listCars({
            brand: filters.brand,
            bodyStyle: filters.bodyStyle,
            segment: filters.segment,
            limit: PAGE_SIZE,
            offset: store.offset(),
          }),
        );
        patchState(store, {
          cars: response.cars,
          total: response.total,
          loading: false,
        });
      } catch (error) {
        patchState(store, {
          cars: [],
          total: 0,
          loading: false,
          error: toMessage(error),
        });
      }
    }

    return {
      /** Nap trang danh muc theo trang thai hien tai. */
      load: fetchPage,

      /**
       * Doi bo loc.
       *
       * Ve trang dau vi ket qua moi co the it hon vi tri dang xem.
       */
      async setFilters(filters: CatalogFilters): Promise<void> {
        patchState(store, { filters, offset: 0 });
        await fetchPage();
      },

      /** Xoa het bo loc. */
      async clearFilters(): Promise<void> {
        patchState(store, { filters: EMPTY_FILTERS, offset: 0 });
        await fetchPage();
      },

      /** Nhay toi mot trang, dem tu 1. */
      async goToPage(page: number): Promise<void> {
        const pageCount = Math.max(
          1,
          Math.ceil(store.total() / PAGE_SIZE),
        );
        const safePage = Math.min(Math.max(page, 1), pageCount);
        patchState(store, { offset: (safePage - 1) * PAGE_SIZE });
        await fetchPage();
      },

      async nextPage(): Promise<void> {
        if (store.offset() + PAGE_SIZE < store.total()) {
          patchState(store, { offset: store.offset() + PAGE_SIZE });
          await fetchPage();
        }
      },

      async previousPage(): Promise<void> {
        if (store.offset() > 0) {
          patchState(store, {
            offset: Math.max(0, store.offset() - PAGE_SIZE),
          });
          await fetchPage();
        }
      },

      reset(): void {
        patchState(store, INITIAL_STATE);
      },
    };
  }),
);
