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
      <h1 class="app-enter">Nhận diện <span class="app-gradient-text">xe</span></h1>

      @if (health.isOffline()) {
        <div class="offline" role="alert">
          <span class="offline-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="none" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round"
                d="M12 8v5m0 3.5v.01M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
          </span>
          <div>
            <p class="offline-title">Không kết nối được máy chủ</p>
            <p class="offline-body">
              Backend chưa chạy hoặc không phản hồi. Hãy khởi động máy chủ
              rồi tải lại trang.
            </p>
            <code class="offline-cmd"
              >python -m uvicorn src.api.main:app --reload</code
            >
          </div>
        </div>
      } @else if (!health.canRecognize()) {
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
            class="app-btn app-btn--primary"
            [disabled]="!store.canSubmit() || !health.canRecognize()"
            (click)="onRecognize()">
            @if (store.loading()) {
              <span class="app-spinner" aria-hidden="true"></span>
              <span>Đang nhận diện</span>
            } @else {
              <span>Nhận diện</span>
            }
          </button>
          <button type="button" class="app-btn app-btn--ghost" (click)="onReset()">
            Chọn ảnh khác
          </button>
        </div>

        <app-detection-overlay
          [imageUrl]="url"
          [vehicles]="store.vehicles()"
          [selectedIndex]="store.selectedIndex()"
          (vehicleClicked)="store.select($event)" />
      }

      @if (store.loading()) {
        <div class="loading-block" role="status">
          <p class="notice">
            Đang xử lý ảnh, ảnh nhiều xe có thể mất gần một giây.
          </p>
          <div class="app-skeleton skeleton-line"></div>
          <div class="app-skeleton skeleton-line short"></div>
          <div class="app-skeleton skeleton-block"></div>
        </div>
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
            <div class="result-panel app-enter">
              <app-prediction-list [vehicle]="vehicle" />
            </div>
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
      padding: 1.5rem 1rem 4rem;
    }

    h1 {
      margin: 0 0 1.5rem;
      font-family: var(--app-font-display);
      font-size: clamp(1.85rem, 4vw, 2.5rem);
      font-weight: 700;
      letter-spacing: -0.03em;
    }

    h1 .app-gradient-text {
      display: inline-block;
      padding-bottom: 0.05em;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin: 1.25rem 0;
    }

    // --- Bao may chu khong phan hoi ------------------------------------

    .offline {
      display: flex;
      gap: 0.9rem;
      margin-bottom: 1.5rem;
      padding: 1.1rem 1.25rem;
      border: 1px solid color-mix(
        in srgb,
        var(--mat-sys-error) 45%,
        transparent
      );
      border-radius: var(--app-radius-lg);
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
      animation: app-fade-in-up var(--app-duration) var(--app-ease) both;
    }

    .offline-icon {
      flex-shrink: 0;
      color: var(--mat-sys-error);
    }

    .offline-title {
      margin: 0 0 0.3rem;
      font-family: var(--app-font-display);
      font-size: 1.02rem;
      font-weight: 650;
    }

    .offline-body {
      margin: 0 0 0.7rem;
      font-size: 0.92rem;
      line-height: 1.6;
    }

    .offline-cmd {
      display: inline-block;
      padding: 0.35rem 0.65rem;
      border-radius: var(--app-radius-sm);
      background: color-mix(in srgb, var(--mat-sys-on-surface) 10%, transparent);
      font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
      font-size: 0.82rem;
      word-break: break-all;
    }

    .notice,
    .error,
    .warning {
      padding: 0.85rem 1rem;
      border-radius: var(--app-radius-md);
      animation: app-fade-in-up var(--app-duration) var(--app-ease) both;
    }

    .notice {
      margin: 0;
      background: var(--mat-sys-surface-container);
      color: var(--mat-sys-on-surface-variant);
    }

    .error,
    .warning {
      border-left: 3px solid var(--mat-sys-error);
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
    }

    // --- Trang thai dang tai -------------------------------------------

    .loading-block {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      margin: 1.25rem 0;
    }

    .skeleton-line {
      height: 0.9rem;
    }

    .skeleton-line.short {
      width: 60%;
    }

    .skeleton-block {
      height: 7rem;
    }

    // --- Chon xe trong anh nhieu xe ------------------------------------

    .vehicle-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1.25rem 0;
    }

    .vehicle-tabs button {
      padding: 0.4rem 1rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--app-radius-pill);
      background: var(--mat-sys-surface-container-low);
      color: var(--mat-sys-on-surface);
      font: var(--mat-sys-label-large);
      cursor: pointer;
      transition:
        transform var(--app-duration-fast) var(--app-spring),
        background-color var(--app-duration-fast) var(--app-ease),
        color var(--app-duration-fast) var(--app-ease);
    }

    .vehicle-tabs button:hover {
      transform: translateY(-1px);
      border-color: var(--mat-sys-primary);
    }

    .vehicle-tabs button.active {
      background: var(--mat-sys-primary);
      border-color: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      box-shadow: var(--app-shadow-sm);
    }

    // --- Khung ket qua --------------------------------------------------

    .result-panel {
      margin-top: 1.25rem;
      padding: 1.25rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--app-radius-lg);
      background: var(--mat-sys-surface-container-low);
    }

    .timing {
      margin-top: 1.25rem;
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
