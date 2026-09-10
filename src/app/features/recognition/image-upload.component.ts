import { Component, output, signal, viewChild, ElementRef } from '@angular/core';

/** Cac kieu MIME goi y cho hop thoai chon file. */
const ACCEPT = 'image/jpeg,image/png,image/bmp,image/gif,image/webp';

/**
 * Khu vuc chon anh: keo tha, bam chon, hoac dan URL.
 *
 * Component chi lo viec lay ra `File` - phan kiem tra hop le do store lam
 * de logic kiem tra nam mot cho duy nhat.
 */
@Component({
  selector: 'app-image-upload',
  template: `
    <div
      class="dropzone"
      [class.dragging]="dragging()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)">
      <span class="glow" aria-hidden="true"></span>

      <span class="icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 16V4m0 0L8 8m4-4 4 4M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
      </span>

      <p class="title">Kéo thả ảnh vào đây</p>
      <p class="hint">JPEG, PNG, BMP, GIF, WEBP · tối đa 10 MB</p>

      <button type="button" class="app-btn app-btn--primary" (click)="openPicker()">
        Chọn ảnh từ máy
      </button>

      <input
        #pickerEl
        type="file"
        class="visually-hidden"
        [accept]="accept"
        (change)="onPick($event)" />
    </div>

    <form class="url-form" (submit)="onSubmitUrl($event)">
      <label for="image-url">Hoặc dán đường dẫn ảnh</label>
      <div class="url-row">
        <input
          id="image-url"
          type="url"
          name="imageUrl"
          placeholder="https://..."
          [value]="url()"
          (input)="onUrlInput($event)" />
        <button
          type="submit"
          class="app-btn app-btn--ghost"
          [disabled]="url().trim() === '' || fetching()">
          @if (fetching()) {
            <span class="app-spinner" aria-hidden="true"></span>
            <span>Đang tải</span>
          } @else {
            <span>Tải ảnh</span>
          }
        </button>
      </div>

      @if (urlError()) {
        <p class="error" role="alert">{{ urlError() }}</p>
      }
    </form>
  `,
  styles: `
    .dropzone {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2.5rem 1.25rem;
      overflow: hidden;
      border: 2px dashed var(--mat-sys-outline-variant);
      border-radius: var(--app-radius-lg);
      background: var(--app-gradient), var(--mat-sys-surface-container-low);
      text-align: center;
      transition:
        border-color var(--app-duration) var(--app-ease),
        transform var(--app-duration) var(--app-spring),
        box-shadow var(--app-duration) var(--app-ease);
    }

    .dropzone:hover {
      border-color: color-mix(
        in srgb,
        var(--mat-sys-primary) 55%,
        transparent
      );
      box-shadow: var(--app-shadow-md);
    }

    // Dang keo file vao: vien sang han, khoi nhich len va co nhip dap.
    .dropzone.dragging {
      border-color: var(--mat-sys-primary);
      border-style: solid;
      transform: scale(1.01);
      animation: app-pulse-ring 1.2s ease-in-out infinite;
    }

    // Quang sang chay theo vien khi keo file vao.
    .glow {
      position: absolute;
      inset: -40%;
      opacity: 0;
      pointer-events: none;
      background: conic-gradient(
        from 0deg,
        transparent 0%,
        color-mix(in srgb, var(--mat-sys-primary) 22%, transparent) 25%,
        transparent 50%
      );
      transition: opacity var(--app-duration) var(--app-ease);
    }

    .dropzone.dragging .glow {
      opacity: 1;
      animation: app-spin 3s linear infinite;
    }

    .icon {
      display: grid;
      place-items: center;
      width: 3.5rem;
      height: 3.5rem;
      margin-bottom: 0.25rem;
      border-radius: 50%;
      background: var(--mat-sys-surface-container-high);
      color: var(--mat-sys-primary);
      transition: transform var(--app-duration) var(--app-spring);
    }

    .dropzone:hover .icon {
      transform: translateY(-3px);
    }

    .dropzone.dragging .icon {
      transform: translateY(-6px) scale(1.06);
    }

    .title {
      position: relative;
      margin: 0;
      font: var(--mat-sys-title-medium);
    }

    .hint {
      position: relative;
      margin: 0 0 0.75rem;
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }

    .dropzone .app-btn {
      position: relative;
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }

    .url-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1.25rem;
    }

    label {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-label-medium);
    }

    .url-row {
      display: flex;
      gap: 0.5rem;
    }

    .url-row input {
      flex: 1;
      min-width: 0;
      padding: 0.6rem 0.9rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--app-radius-pill);
      background: var(--mat-sys-surface-container-low);
      color: var(--mat-sys-on-surface);
      transition:
        border-color var(--app-duration-fast) var(--app-ease),
        box-shadow var(--app-duration-fast) var(--app-ease);
    }

    .url-row input:focus {
      outline: none;
      border-color: var(--mat-sys-primary);
      box-shadow: 0 0 0 3px
        color-mix(in srgb, var(--mat-sys-primary) 18%, transparent);
    }

    .error {
      margin: 0;
      color: var(--mat-sys-error);
      font: var(--mat-sys-body-small);
      animation: app-fade-in-up var(--app-duration) var(--app-ease) both;
    }
  `,
})
export class ImageUploadComponent {
  /** Phat ra khi nguoi dung chon duoc mot file anh. */
  readonly fileSelected = output<File>();

  protected readonly accept = ACCEPT;
  protected readonly dragging = signal(false);
  protected readonly url = signal('');
  protected readonly fetching = signal(false);
  protected readonly urlError = signal<string | null>(null);

  private readonly pickerEl =
    viewChild.required<ElementRef<HTMLInputElement>>('pickerEl');

  protected openPicker(): void {
    this.pickerEl().nativeElement.click();
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);

    const file = event.dataTransfer?.files[0];
    if (file) {
      this.fileSelected.emit(file);
    }
  }

  protected onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
    }
    // Xoa gia tri de chon lai dung file do van kich hoat `change`.
    input.value = '';
  }

  protected onUrlInput(event: Event): void {
    this.url.set((event.target as HTMLInputElement).value);
    this.urlError.set(null);
  }

  /**
   * Tai anh tu URL roi phat ra dang `File`.
   *
   * Backend khong nhan URL nen frontend phai tu tai ve. Buoc nay thuong
   * hong vi CORS - may chu chua anh phai cho phep truy cap tu trinh duyet.
   */
  protected async onSubmitUrl(event: Event): Promise<void> {
    event.preventDefault();

    const url = this.url().trim();
    if (url === '') {
      return;
    }

    this.fetching.set(true);
    this.urlError.set(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        this.urlError.set(`Không tải được ảnh (HTTP ${response.status})`);
        return;
      }

      const blob = await response.blob();
      const name = url.split('/').pop() || 'image';
      this.fileSelected.emit(new File([blob], name, { type: blob.type }));
      this.url.set('');
    } catch {
      // `fetch` nem loi khi mat mang hoac may chu chan CORS.
      this.urlError.set(
        'Không tải được ảnh. Máy chủ chứa ảnh có thể chặn truy cập.',
      );
    } finally {
      this.fetching.set(false);
    }
  }
}
