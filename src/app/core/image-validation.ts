/**
 * Kiem tra anh o phia client truoc khi gui len may chu.
 *
 * Backend kiem tra chu ky byte dau file chu khong tin `content-type`, nen
 * frontend lam tuong tu de bao loi som thay vi doi may chu tra 413/415.
 */

/** Gioi han kich thuoc file, dong bo voi backend. */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** So byte dau can doc de nhan dang dinh dang. */
const SIGNATURE_BYTES = 12;

export type ImageFormat = 'jpeg' | 'png' | 'bmp' | 'gif' | 'webp';

/** Cac dinh dang backend chap nhan. */
export const SUPPORTED_FORMATS: readonly ImageFormat[] = [
  'jpeg',
  'png',
  'bmp',
  'gif',
  'webp',
];

export type ImageValidationError =
  | 'empty'
  | 'too-large'
  | 'unsupported-format';

export interface ImageValidationResult {
  valid: boolean;
  error: ImageValidationError | null;
  message: string | null;
  format: ImageFormat | null;
}

const MESSAGE_BY_ERROR: Record<ImageValidationError, string> = {
  empty: 'File ảnh rỗng, vui lòng chọn ảnh khác',
  'too-large': 'Ảnh quá lớn, tối đa 10 MB',
  'unsupported-format': 'Chỉ hỗ trợ JPEG, PNG, BMP, GIF, WEBP',
};

/** So khop `bytes` voi mot chu ky, `null` trong mau nghia la byte tuy y. */
function matches(bytes: Uint8Array, signature: (number | null)[]): boolean {
  if (bytes.length < signature.length) {
    return false;
  }
  return signature.every(
    (expected, index) => expected === null || bytes[index] === expected,
  );
}

/**
 * Nhan dang dinh dang anh tu vai byte dau file.
 *
 * Tra `null` khi khong khop dinh dang nao duoc ho tro.
 */
export function detectImageFormat(bytes: Uint8Array): ImageFormat | null {
  // JPEG: FF D8 FF
  if (matches(bytes, [0xff, 0xd8, 0xff])) {
    return 'jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (matches(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'png';
  }

  // BMP: 42 4D ("BM")
  if (matches(bytes, [0x42, 0x4d])) {
    return 'bmp';
  }

  // GIF: "GIF87a" hoac "GIF89a"
  if (matches(bytes, [0x47, 0x49, 0x46, 0x38, null, 0x61])) {
    return 'gif';
  }

  // WEBP: "RIFF" ???? "WEBP" - 4 byte kich thuoc nam giua nen bo qua.
  const riff = matches(bytes, [0x52, 0x49, 0x46, 0x46]);
  const webp = matches(bytes.subarray(8), [0x57, 0x45, 0x42, 0x50]);
  if (riff && webp) {
    return 'webp';
  }

  return null;
}

/** Doc `SIGNATURE_BYTES` byte dau cua file. */
async function readSignature(file: File): Promise<Uint8Array> {
  const buffer = await file.slice(0, SIGNATURE_BYTES).arrayBuffer();
  return new Uint8Array(buffer);
}

function fail(error: ImageValidationError): ImageValidationResult {
  return {
    valid: false,
    error,
    message: MESSAGE_BY_ERROR[error],
    format: null,
  };
}

/**
 * Kiem tra file co phai anh hop le khong.
 *
 * Doc chu ky byte thay vi tin `file.type` - trinh duyet doan kieu tu duoi
 * file nen `.jpg` chua noi dung khac van co `type` la `image/jpeg`.
 */
export async function validateImageFile(
  file: File,
): Promise<ImageValidationResult> {
  if (file.size === 0) {
    return fail('empty');
  }

  if (file.size > MAX_FILE_BYTES) {
    return fail('too-large');
  }

  const format = detectImageFormat(await readSignature(file));
  if (format === null) {
    return fail('unsupported-format');
  }

  return { valid: true, error: null, message: null, format };
}
