import { Pipe, PipeTransform } from '@angular/core';

/** Nguong doi tu "trieu" sang "ty" cho de doc. */
const BILLION_THRESHOLD = 1000;

/**
 * Dinh dang gia ban tu don vi trieu VND.
 *
 * 594.4  -> "594 trieu"
 * 1199.0 -> "1,20 ty"
 */
@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  transform(million_vnd: number | null | undefined): string {
    if (million_vnd == null) {
      return '—';
    }

    if (million_vnd >= BILLION_THRESHOLD) {
      const billions = (million_vnd / BILLION_THRESHOLD).toFixed(2);
      // Tieng Viet dung dau phay lam dau thap phan.
      return `${billions.replace('.', ',')} tỷ`;
    }

    return `${Math.round(million_vnd).toLocaleString('vi-VN')} triệu`;
  }
}
