import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { ApiService } from './api.service';
import { toMessage } from './error.interceptor';
import type { FilterOptions } from './models';

interface FiltersState {
  options: FilterOptions | null;
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: FiltersState = {
  options: null,
  loading: false,
  error: null,
};

/** Nhan tieng Viet cho tung phan khuc. */
const SEGMENT_LABEL: Record<string, string> = {
  economy: 'Phổ thông',
  luxury: 'Cao cấp',
  exotic: 'Siêu xe',
};

/** Mot lua chon trong form loc. */
export interface FilterChoice {
  value: string;
  label: string;
}

/**
 * Cac gia tri hop le de dung form loc.
 *
 * Dung chung cho trang danh muc va trang tu van. Nap mot lan roi giu lai -
 * bang thong so it thay doi trong mot phien lam viec.
 */
export const FiltersStore = signalStore(
  { providedIn: 'root' },
  withState(INITIAL_STATE),
  withComputed(({ options }) => ({
    bodyStyles: computed<FilterChoice[]>(() =>
      (options()?.body_styles ?? []).map((value) => ({
        value,
        label: value,
      })),
    ),

    segments: computed<FilterChoice[]>(() =>
      (options()?.segments ?? []).map((value) => ({
        value,
        label: SEGMENT_LABEL[value] ?? value,
      })),
    ),

    priceMin: computed(() => options()?.price_min ?? 0),
    priceMax: computed(() => options()?.price_max ?? 0),
    seatsMin: computed(() => options()?.seats_min ?? 0),
    seatsMax: computed(() => options()?.seats_max ?? 0),

    /** Da co du lieu de dung form chua. */
    ready: computed(() => options() !== null),
  })),
  withMethods((store, api = inject(ApiService)) => ({
    /**
     * Nap cac gia tri loc tu may chu.
     *
     * Goi endpoint thay vi viet cung danh sach - bang thong so co the thay
     * doi. Da nap roi thi khong goi lai.
     */
    async load(): Promise<void> {
      if (store.options() !== null || store.loading()) {
        return;
      }

      patchState(store, { loading: true, error: null });
      try {
        const options = await firstValueFrom(api.getFilters());
        patchState(store, { options, loading: false });
      } catch (error) {
        patchState(store, { loading: false, error: toMessage(error) });
      }
    },
  })),
);
