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
import { validateImageFile } from '../../core/image-validation';
import type { RecognitionResponse } from '../../core/models';

interface RecognitionState {
  /** URL xem truoc anh dang chon (object URL). */
  previewUrl: string | null;
  fileName: string | null;
  result: RecognitionResponse | null;
  loading: boolean;
  error: string | null;
  selectedIndex: number;
}

const INITIAL_STATE: RecognitionState = {
  previewUrl: null,
  fileName: null,
  result: null,
  loading: false,
  error: null,
  selectedIndex: 0,
};

/** Xin backend tra ve bao nhieu kha nang cho moi xe. */
const TOP_K = 5;

/** So xe tuong tu xin kem theo moi ket qua. */
const SIMILAR_COUNT = 3;

export const RecognitionStore = signalStore(
  { providedIn: 'root' },
  withState(INITIAL_STATE),
  withComputed(({ result, selectedIndex, previewUrl, loading }) => ({
    vehicles: computed(() => result()?.vehicles ?? []),

    /** Xe dang duoc chon de xem chi tiet. */
    selected: computed(
      () => result()?.vehicles[selectedIndex()] ?? null,
    ),

    /** Nhieu kha nang anh khong chua o to. */
    notACar: computed(() => result()?.likely_not_a_car ?? false),

    /** Anh co nhieu xe thi giao dien cho phep chon tung chiec. */
    hasMultipleVehicles: computed(
      () => (result()?.vehicles.length ?? 0) > 1,
    ),

    /** Chan nguoi dung bam lien tuc khi chua chon anh hoac dang tai. */
    canSubmit: computed(() => previewUrl() !== null && !loading()),

    processingMs: computed(() => result()?.processing_ms ?? null),
  })),
  withMethods((store, api = inject(ApiService)) => {
    /** Thu hoi object URL cu de khong ro ri bo nho. */
    function revokePreview(): void {
      const url = store.previewUrl();
      if (url !== null) {
        URL.revokeObjectURL(url);
      }
    }

    return {
      /**
       * Chon anh va kiem tra o phia client truoc khi cho gui.
       *
       * Tra `true` khi anh hop le.
       */
      async selectFile(file: File): Promise<boolean> {
        const check = await validateImageFile(file);
        if (!check.valid) {
          revokePreview();
          patchState(store, {
            previewUrl: null,
            fileName: null,
            result: null,
            error: check.message,
          });
          return false;
        }

        revokePreview();
        patchState(store, {
          previewUrl: URL.createObjectURL(file),
          fileName: file.name,
          result: null,
          error: null,
          selectedIndex: 0,
        });
        return true;
      },

      /** Gui anh len may chu de nhan dien. */
      async recognize(file: File): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const result = await firstValueFrom(
            api.recognize(file, {
              topK: TOP_K,
              includeSimilar: true,
              similarCount: SIMILAR_COUNT,
            }),
          );
          patchState(store, { result, loading: false, selectedIndex: 0 });
        } catch (error) {
          patchState(store, {
            result: null,
            loading: false,
            error: toMessage(error),
          });
        }
      },

      /** Chon mot xe trong anh nhieu xe. */
      select(index: number): void {
        const count = store.result()?.vehicles.length ?? 0;
        if (index >= 0 && index < count) {
          patchState(store, { selectedIndex: index });
        }
      },

      /** Xoa ket qua va anh dang chon. */
      reset(): void {
        revokePreview();
        patchState(store, INITIAL_STATE);
      },
    };
  }),
);
