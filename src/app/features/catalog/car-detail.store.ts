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
import type { CarSpecs, RecommendedCar } from '../../core/models';

/** So xe tuong tu hien thi o trang chi tiet. */
const SIMILAR_COUNT = 6;

interface CarDetailState {
  car: CarSpecs | null;
  similarCars: RecommendedCar[];
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: CarDetailState = {
  car: null,
  similarCars: [],
  loading: false,
  error: null,
};

export const CarDetailStore = signalStore(
  { providedIn: 'root' },
  withState(INITIAL_STATE),
  withComputed(({ car, error }) => ({
    found: computed(() => car() !== null),

    /** Xe khong ton tai - hien thong bao rieng thay vi loi chung. */
    notFound: computed(
      () => car() === null && error() === 'Khong tim thay xe nay',
    ),
  })),
  withMethods((store, api = inject(ApiService)) => ({
    /**
     * Nap thong so va xe tuong tu cua mot dong xe.
     *
     * Hai loi goi chay song song vi khong phu thuoc nhau. Xe tuong tu hong
     * thi van hien duoc thong so - khong de no lam vo ca trang.
     */
    async load(class_name: string): Promise<void> {
      patchState(store, { loading: true, error: null });

      const [carResult, similarResult] = await Promise.allSettled([
        firstValueFrom(api.getCar(class_name)),
        firstValueFrom(api.getSimilarCars(class_name, SIMILAR_COUNT)),
      ]);

      if (carResult.status === 'rejected') {
        patchState(store, {
          car: null,
          similarCars: [],
          loading: false,
          error: toMessage(carResult.reason),
        });
        return;
      }

      patchState(store, {
        car: carResult.value,
        similarCars:
          similarResult.status === 'fulfilled'
            ? similarResult.value.cars
            : [],
        loading: false,
        error: null,
      });
    },

    reset(): void {
      patchState(store, INITIAL_STATE);
    },
  })),
);
