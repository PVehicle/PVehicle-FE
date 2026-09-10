import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Loi da duoc dich sang tieng Viet, kem ma tra cuu cho bo phan ho tro.
 */
export interface AppError {
  status: number;
  message: string;
  requestId: string | null;
}

/** Thong bao tieng Viet theo tung ma HTTP. */
const MESSAGE_BY_STATUS: Record<number, string> = {
  400: 'File anh khong hop le',
  401: 'Chua dang nhap',
  404: 'Khong tim thay xe nay',
  413: 'Anh qua lon, toi da 10 MB',
  415: 'Chi ho tro JPEG, PNG, BMP, GIF, WEBP',
  429: 'Ban thao tac qua nhanh, thu lai sau',
  503: 'He thong dang khoi dong',
};

const NETWORK_MESSAGE = 'Khong ket noi duoc may chu, kiem tra lai mang';
const UNKNOWN_MESSAGE = 'Da co loi xay ra, vui long thu lai';

/** Mot phan tu trong mang `detail` cua loi 422 (FastAPI validation). */
interface ValidationDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

function isValidationDetail(value: unknown): value is ValidationDetail {
  return (
    typeof value === 'object' &&
    value !== null &&
    'msg' in value &&
    typeof (value as ValidationDetail).msg === 'string'
  );
}

/**
 * Doc truong `detail` trong body loi.
 *
 * Backend tra ve HAI dang khac nhau:
 * - Loi nghiep vu (400/404/413/415/503): `detail` la chuoi.
 * - Loi validation (422): `detail` la mang `ValidationError[]`.
 *
 * Neu gia dinh luon la chuoi thi giao dien se hien `[object Object]`.
 */
function readDetail(body: unknown): string | null {
  if (typeof body !== 'object' || body === null || !('detail' in body)) {
    return null;
  }

  const detail = (body as { detail: unknown }).detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail.filter(isValidationDetail).map((item) => item.msg);
    return messages.length > 0 ? messages.join('; ') : null;
  }

  return null;
}

/** Chuyen loi HTTP tho thanh `AppError` co thong bao tieng Viet. */
export function toAppError(error: unknown): AppError {
  if (!(error instanceof HttpErrorResponse)) {
    return { status: 0, message: UNKNOWN_MESSAGE, requestId: null };
  }

  // status 0 = request khong toi duoc may chu (mat mang, CORS, server tat).
  if (error.status === 0) {
    return { status: 0, message: NETWORK_MESSAGE, requestId: null };
  }

  const requestId =
    error.headers.get('X-Request-ID') ??
    (typeof error.error === 'object' &&
    error.error !== null &&
    'request_id' in error.error
      ? String((error.error as { request_id: unknown }).request_id)
      : null);

  // Uu tien thong bao co san theo ma loi; 422 thi doc `detail` cho cu the.
  const message =
    MESSAGE_BY_STATUS[error.status] ??
    readDetail(error.error) ??
    UNKNOWN_MESSAGE;

  return { status: error.status, message, requestId };
}

/** Rut thong bao hien thi tu mot loi bat ky. */
export function toMessage(error: unknown): string {
  return toAppError(error).message;
}

/**
 * Chuyen moi loi HTTP thanh `AppError` truoc khi den tay store/component.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(catchError((error) => throwError(() => toAppError(error))));
