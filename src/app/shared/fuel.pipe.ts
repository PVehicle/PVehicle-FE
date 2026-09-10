import { Pipe, PipeTransform } from '@angular/core';

/**
 * Dinh dang muc tieu hao nhien lieu.
 *
 * Backend danh dau xe dien bang `fuel_l_per_100km: 0.0`. Hien thi
 * "0.0 L/100km" se lam nguoi dung tuong he thong loi.
 */
@Pipe({ name: 'fuel' })
export class FuelPipe implements PipeTransform {
  transform(litres_per_100km: number | null | undefined): string {
    if (litres_per_100km == null) {
      return '—';
    }

    if (litres_per_100km === 0) {
      return 'Xe điện';
    }

    return `${litres_per_100km.toFixed(1).replace('.', ',')} L/100km`;
  }
}
