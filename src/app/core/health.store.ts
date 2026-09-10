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
import type { ReadinessResponse } from './models';

interface HealthState {
  readiness: ReadinessResponse | null;
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: HealthState = {
  readiness: null,
  loading: false,
  error: null,
};

/**
 * Trang thai san sang cua backend.
 *
 * Giao dien goi `check()` khi khoi dong va vo hieu hoa tab nhan dien neu
 * `models_loaded: false`. Chuc nang tu van van chay duoc vi no chi can
 * bang thong so, khong can mo hinh.
 */
export const HealthStore = signalStore(
  { providedIn: 'root' },
  withState(INITIAL_STATE),
  withComputed(({ readiness }) => ({
    /** Chi bat tab nhan dien khi mo hinh da nap xong. */
    canRecognize: computed(() => readiness()?.models_loaded ?? false),

    /** Tong so dong xe trong bang thong so (196 quoc te + 20 Viet Nam). */
    carCount: computed(() => readiness()?.car_count ?? 0),

    /** So lop mo hinh quoc te phan loai duoc. Khac voi `carCount`. */
    classCount: computed(() => readiness()?.class_count ?? 0),
  })),
  withMethods((store, api = inject(ApiService)) => ({
    /**
     * Hoi backend da san sang chua.
     *
     * `/ready` tra 503 khi chua nap duoc mo hinh - day la trang thai binh
     * thuong luc khoi dong, khong phai su co, nen van luu ket qua de giao
     * dien biet ma vo hieu hoa tab nhan dien.
     */
    async check(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const readiness = await firstValueFrom(api.ready());
        patchState(store, { readiness, loading: false });
      } catch (error) {
        patchState(store, {
          readiness: null,
          loading: false,
          error: toMessage(error),
        });
      }
    },
  })),
);
