import { Component, input } from '@angular/core';

/**
 * Trang chi tiet mot dong xe.
 *
 * `className` nhan tu route param nho `withComponentInputBinding()`.
 */
@Component({
  selector: 'app-car-detail-page',
  template: `
    <section class="p-4">
      <h1 class="text-2xl font-bold">{{ className() }}</h1>
      <p class="mt-4">Thông số kỹ thuật và xe tương tự.</p>
    </section>
  `,
})
export class CarDetailPage {
  readonly className = input.required<string>();
}
