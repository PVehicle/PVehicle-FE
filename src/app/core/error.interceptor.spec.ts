import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { toAppError, toMessage } from './error.interceptor';

/** Dung mot loi HTTP gia lap de kiem tra. */
function makeError(
  status: number,
  body: unknown = null,
  headers: Record<string, string> = {},
): HttpErrorResponse {
  return new HttpErrorResponse({
    status,
    error: body,
    headers: new HttpHeaders(headers),
  });
}

describe('toAppError', () => {
  it('dich ma loi sang thong bao tieng Viet', () => {
    expect(toAppError(makeError(413)).message).toBe(
      'Anh qua lon, toi da 10 MB',
    );
    expect(toAppError(makeError(429)).message).toBe(
      'Ban thao tac qua nhanh, thu lai sau',
    );
    expect(toAppError(makeError(503)).message).toBe('He thong dang khoi dong');
  });

  it('doc duoc `detail` dang mang cua loi 422', () => {
    const body = {
      detail: [
        { loc: ['query', 'top_k'], msg: 'phai nho hon 20', type: 'value' },
        { loc: ['query', 'offset'], msg: 'phai la so duong', type: 'value' },
      ],
    };

    // Neu gia dinh `detail` luon la chuoi thi ket qua se la
    // "[object Object]" - day chinh la loi can chan.
    expect(toAppError(makeError(422, body)).message).toBe(
      'phai nho hon 20; phai la so duong',
    );
  });

  it('doc duoc `detail` dang chuoi cua loi nghiep vu', () => {
    const body = { detail: 'Khong doc duoc anh' };
    // 400 co san thong bao rieng nen dung ma khong nam trong bang de
    // kiem tra duong doc `detail`.
    expect(toAppError(makeError(418, body)).message).toBe(
      'Khong doc duoc anh',
    );
  });

  it('doc duoc loi 422 that cua backend (detail dang chuoi)', () => {
    // Kiem chung voi backend that: FastAPI khai bao `detail` la mang, nhung
    // handler cua PVehicle-AI gop lai thanh chuoi tieng Viet kem request_id.
    const body = {
      detail:
        'Du lieu gui len khong hop le. limit: Input should be less than ' +
        'or equal to 200',
      request_id: '76dc1509a088',
    };

    const result = toAppError(makeError(422, body));
    expect(result.message).toBe(body.detail);
    expect(result.requestId).toBe('76dc1509a088');
  });

  it('lay request id tu header X-Request-ID', () => {
    const error = makeError(500, null, { 'X-Request-ID': 'a1b2c3d4e5f6' });
    expect(toAppError(error).requestId).toBe('a1b2c3d4e5f6');
  });

  it('lay request id tu body khi header khong co', () => {
    const error = makeError(500, { request_id: 'body-id-123' });
    expect(toAppError(error).requestId).toBe('body-id-123');
  });

  it('bao loi mang khi status bang 0', () => {
    const result = toAppError(makeError(0));
    expect(result.message).toBe(
      'Khong ket noi duoc may chu, kiem tra lai mang',
    );
  });

  it('tra thong bao chung cho loi khong phai HTTP', () => {
    expect(toMessage(new Error('loi la'))).toBe(
      'Da co loi xay ra, vui long thu lai',
    );
  });
});
