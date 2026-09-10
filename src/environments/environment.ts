/**
 * Cau hinh cho ban dung that (production).
 *
 * `apiKey` de rong khi may chu khong bat xac thuc - interceptor se bo qua
 * header `X-API-Key`. Khong bao gio viet cung key that vao day.
 */
export const environment = {
  production: true,
  apiBaseUrl: '/api-proxy',
  apiKey: '',
};
