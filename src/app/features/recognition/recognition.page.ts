import { Component, inject, isDevMode } from '@angular/core';

import { EmptyStateComponent } from '../../shared/empty-state.component';
import { HealthStore } from '../../core/health.store';
import { DetectionOverlayComponent } from './detection-overlay.component';
import { ImageUploadComponent } from './image-upload.component';
import { PredictionListComponent } from './prediction-list.component';
import { RecognitionStore } from './recognition.store';

/** Trang nhan dien dong xe tu anh. */
@Component({
  selector: 'app-recognition-page',
  imports: [
    ImageUploadComponent,
    DetectionOverlayComponent,
    PredictionListComponent,
    EmptyStateComponent,
  ],
  template: `
    <section class="page">
      <h1>Nhận diện xe</h1>

      @if (!health.canRecognize()) {
        <p class="notice" role="status">
          Hệ thống đang khởi động, chức năng nhận diện tạm thời chưa dùng
          được. Chức năng tư vấn xe vẫn hoạt động bình thường.
        </p>
      }

      <app-image-upload (fileSelected)="onFileSelected($event)" />

      @if (store.error(); as message) {
        <p class="error" role="alert">{{ message }}</p>
      }

      @if (store.previewUrl(); as url) {
        <div class="actions">
          <button
            type="button"
            [disabled]="!store.canSubmit() || !health.canRecognize()"
            (click)="onRecognize()">
            {{ store.loading() ? 'Đang nhận diện...' : 'Nhận diện' }}
          </button>
          <button type="button" (click)="onReset()">Chọn ảnh khác</button>
        </div>

        <app-detection-overlay
          [imageUrl]="url"
          [vehicles]="store.vehicles()"
          [selectedIndex]="store.selectedIndex()"
          (vehicleClicked)="store.select($event)" />
      }

      @if (store.loading()) {
        <p class="notice" role="status">
          Đang xử lý ảnh, ảnh nhiều xe có thể mất gần một giây.
        </p>
      }

      @if (store.result(); as result) {
        @if (store.notACar()) {
          <p class="warning" role="alert">
            Nhiều khả năng đây không phải ảnh ô tô. Hãy thử ảnh khác chụp rõ
            chiếc xe.
          </p>
        }

        @if (result.vehicles.length === 0) {
          <app-empty-state
            title="Không nhận diện được xe nào trong ảnh"
            [hints]="emptyHints" />
        } @else {
          @if (store.hasMultipleVehicles()) {
            <div
              class="vehicle-tabs"
              role="tablist"
              aria-label="Các xe trong ảnh">
              @for (vehicle of store.vehicles(); track $index) {
                <button
                  type="button"
                  role="tab"
                  [attr.aria-selected]="$index === store.selectedIndex()"
                  [class.active]="$index === store.selectedIndex()"
                  (click)="store.select($index)">
                  Xe {{ $index + 1 }}
                </button>
              }
            </div>
          }

          @if (store.selected(); as vehicle) {
            <app-prediction-list [vehicle]="vehicle" />
          }
        }

        @if (showTiming && store.processingMs(); as ms) {
          <p class="timing">Thời gian xử lý: {{ ms.toFixed(0) }} ms</p>
        }
      }
    </section>
  `,
  styles: `
    .page {
      max-width: 60rem;
      margin: 0 auto;
      padding: 1rem;
    }

    h1 {
      font: var(--mat-sys-headline-small);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1rem 0;
    }

    .actions button {
      padding: 0.5rem 1rem;
      border: 1px solid var(--mat-sys-outline);
      border-radius: 999px;
      background: transparent;
      color: var(--mat-sys-on-surface);
      cursor: pointer;
    }

    .actions button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .notice,
    .error,
    .warning {
      padding: 0.75rem;
      border-radius: 0.5rem;
    }

    .notice {
      background: var(--mat-sys-surface-variant);
    }

    .error,
    .warning {
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
    }

    .vehicle-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1rem 0;
    }

    .vehicle-tabs button {
      padding: 0.35rem 0.9rem;
      border: 1px solid var(--mat-sys-outline);
      border-radius: 999px;
      background: transparent;
      color: var(--mat-sys-on-surface);
      cursor: pointer;
    }

    .vehicle-tabs button.active {
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
    }

    .timing {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }
  `,
})
export class RecognitionPage {
  protected readonly store = inject(RecognitionStore);
  protected readonly health = inject(HealthStore);

  /** `processing_ms` chi huu ich khi go loi, khong dua len giao dien chinh. */
  protected readonly showTiming = isDevMode();

  protected readonly emptyHints = [
    'Chụp rõ toàn bộ chiếc xe, tránh bị che khuất',
    'Dùng ảnh có độ phân giải cao hơn',
    'Tránh ảnh chụp quá xa hoặc quá tối',
  ];

  /** File dang chon, giu lai de bam "Nhan dien" thi gui di. */
  private currentFile: File | null = null;

  protected async onFileSelected(file: File): Promise<void> {
    const accepted = await this.store.selectFile(file);
    this.currentFile = accepted ? file : null;
  }

  protected async onRecognize(): Promise<void> {
    if (this.currentFile !== null) {
      await this.store.recognize(this.currentFile);
    }
  }

  protected onReset(): void {
    this.currentFile = null;
    this.store.reset();
  }
}
