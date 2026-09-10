import { Component } from '@angular/core';

/**
 * Trang tu van xe theo nhu cau.
 *
 * Khung trang - form nhu cau va danh sach ket qua se duoc bo sung sau.
 */
@Component({
  selector: 'app-recommendation-page',
  template: `
    <section class="p-4">
      <h1 class="text-2xl font-bold">Tư vấn xe</h1>
      <p class="mt-4">Chọn ngân sách và nhu cầu để nhận gợi ý.</p>
    </section>
  `,
})
export class RecommendationPage {}
