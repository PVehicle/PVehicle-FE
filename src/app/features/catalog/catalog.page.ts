import { Component, inject } from '@angular/core';

import { HealthStore } from '../../core/health.store';

/**
 * Trang danh muc xe.
 *
 * Khung trang - bang/luoi, bo loc va phan trang se duoc bo sung sau.
 */
@Component({
  selector: 'app-catalog-page',
  template: `
    <section class="p-4">
      <h1 class="text-2xl font-bold">Danh mục xe</h1>
      <p class="mt-4">{{ health.carCount() }} dòng xe trong danh mục.</p>
    </section>
  `,
})
export class CatalogPage {
  protected readonly health = inject(HealthStore);
}
