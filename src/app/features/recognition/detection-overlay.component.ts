import {
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import type { DetectedVehicle } from '../../core/models';

/**
 * Ve khung bao len anh.
 *
 * Toa do `box` tinh theo anh GOC, con anh hien thi thuong bi thu nho. Thay
 * vi tu nhan he so ty le, component dat `viewBox` bang kich thuoc anh goc
 * va de trinh duyet tu quy doi - cach nay van dung khi cua so doi kich
 * thuoc, con he so tinh mot lan luc anh tai xong thi khong.
 *
 * Xe co `box = null` (khong phat hien duoc) khong ve khung.
 */
@Component({
  selector: 'app-detection-overlay',
  template: `
    <div class="wrapper">
      <img
        #img
        [src]="imageUrl()"
        (load)="onLoad()"
        alt="Ảnh xe đã tải lên" />

      @if (naturalWidth() > 0) {
        <svg
          class="overlay"
          [attr.viewBox]="'0 0 ' + naturalWidth() + ' ' + naturalHeight()"
          preserveAspectRatio="none"
          aria-hidden="true">
          @for (vehicle of vehicles(); track $index) {
            @if (vehicle.box; as box) {
              <rect
                class="box"
                [class.selected]="$index === selectedIndex()"
                [attr.x]="box.x1"
                [attr.y]="box.y1"
                [attr.width]="box.x2 - box.x1"
                [attr.height]="box.y2 - box.y1"
                (click)="vehicleClicked.emit($index)" />
            }
          }
        </svg>
      }
    </div>
  `,
  styles: `
    .wrapper {
      position: relative;
      display: inline-block;
      max-width: 100%;
    }

    img {
      display: block;
      // Nguoi dung co the tai anh 4000x3000 - gioi han chieu cao hien thi.
      max-height: 70vh;
      max-width: 100%;
      object-fit: contain;
    }

    .overlay {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .box {
      fill: transparent;
      stroke: var(--mat-sys-outline);
      // Giu net vien khong bi keo gian theo ty le cua viewBox.
      vector-effect: non-scaling-stroke;
      stroke-width: 2;
      cursor: pointer;
      pointer-events: all;
    }

    .box.selected {
      stroke: var(--mat-sys-primary);
      stroke-width: 4;
    }
  `,
})
export class DetectionOverlayComponent {
  readonly imageUrl = input.required<string>();
  readonly vehicles = input.required<DetectedVehicle[]>();
  readonly selectedIndex = input(0);

  /** Nguoi dung bam vao mot khung bao. */
  readonly vehicleClicked = output<number>();

  protected readonly naturalWidth = signal(0);
  protected readonly naturalHeight = signal(0);

  private readonly imgRef =
    viewChild.required<ElementRef<HTMLImageElement>>('img');

  protected onLoad(): void {
    const img = this.imgRef().nativeElement;
    this.naturalWidth.set(img.naturalWidth);
    this.naturalHeight.set(img.naturalHeight);
  }
}
