import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../environments/environment';

/** Cac endpoint luon mo, khong bao gio can API key. */
const PUBLIC_PATHS = ['/health', '/ready'];

/**
 * Them header `X-API-Key` vao request khi co cau hinh key.
 *
 * Backend co the chay khong bat xac thuc (thuong gap khi phat trien), luc
 * do `apiKey` rong va interceptor de request di qua nguyen ven.
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const key = environment.apiKey;
  if (!key) {
    return next(req);
  }

  const isPublic = PUBLIC_PATHS.some((path) =>
    new URL(req.url, window.location.origin).pathname.endsWith(path),
  );
  if (isPublic) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { 'X-API-Key': key } }));
};
