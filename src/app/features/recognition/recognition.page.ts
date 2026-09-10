import { Component, inject } from '@angular/core';

import { HealthStore } from '../../core/health.store';

/**
 * Trang nhan dien xe.
 *
 * Khung trang - phan tai anh, ve khung bao va danh sach du doan se duoc
 * bo sung o buoc sau.
 */
@Component({
  selector: 'app-recognition-page',
  template: `
    <section class="p-4">
      <h1 class="text-2xl font-bold">Nhận diện xe</h1>

      @if (!health.canRecognize()) {
        <p role="status" class="mt-4">
          Hệ thống đang khởi động, chức năng nhận diện tạm thời chưa dùng
          được.
        </p>
      } @else {
        <p class="mt-4">Tải ảnh lên để nhận diện dòng xe.</p>
      }
    </section>
  `,
})
export class RecognitionPage {
  protected readonly health = inject(HealthStore);
}
