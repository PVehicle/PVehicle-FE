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
      <p>Kéo thả ảnh vào đây</p>

      <button type="button" (click)="openPicker()">
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
        <button type="submit" [disabled]="url().trim() === '' || fetching()">
          {{ fetching() ? 'Đang tải...' : 'Tải ảnh' }}
        </button>
      </div>

      @if (urlError()) {
        <p class="error" role="alert">{{ urlError() }}</p>
      }
    </form>
  `,
  styles: `
    .dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem 1rem;
      border: 2px dashed var(--mat-sys-outline);
      border-radius: 0.75rem;
      text-align: center;
    }

    .dropzone.dragging {
      border-color: var(--mat-sys-primary);
      background: var(--mat-sys-surface-variant);
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
      margin-top: 1rem;
    }

    .url-row {
      display: flex;
      gap: 0.5rem;
    }

    .url-row input {
      flex: 1;
      min-width: 0;
      padding: 0.5rem;
    }

    .error {
      margin: 0;
      color: var(--mat-sys-error);
      font: var(--mat-sys-body-small);
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
