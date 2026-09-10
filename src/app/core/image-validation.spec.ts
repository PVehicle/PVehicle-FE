import {
  MAX_FILE_BYTES,
  detectImageFormat,
  validateImageFile,
} from './image-validation';

/** Dung mot File tu cac byte cho truoc. */
function makeFile(
  bytes: number[],
  { name = 'anh.jpg', type = 'image/jpeg', padTo = 0 } = {},
): File {
  const data = new Uint8Array(Math.max(bytes.length, padTo));
  data.set(bytes);
  return new File([data], name, { type });
}

const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const BMP = [0x42, 0x4d, 0x00, 0x00];
const GIF89 = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];
const GIF87 = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61];

/** "RIFF" + 4 byte kich thuoc + "WEBP" */
const WEBP = [
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
];

describe('detectImageFormat', () => {
  it('nhan dang duoc cac dinh dang duoc ho tro', () => {
    expect(detectImageFormat(new Uint8Array(JPEG))).toBe('jpeg');
    expect(detectImageFormat(new Uint8Array(PNG))).toBe('png');
    expect(detectImageFormat(new Uint8Array(BMP))).toBe('bmp');
    expect(detectImageFormat(new Uint8Array(WEBP))).toBe('webp');
  });

  it('nhan dang ca hai phien ban GIF', () => {
    expect(detectImageFormat(new Uint8Array(GIF89))).toBe('gif');
    expect(detectImageFormat(new Uint8Array(GIF87))).toBe('gif');
  });

  it('tra null khi khong khop dinh dang nao', () => {
    // "%PDF"
    const pdf = [0x25, 0x50, 0x44, 0x46];
    expect(detectImageFormat(new Uint8Array(pdf))).toBeNull();
  });

  it('tra null khi qua ngan de nhan dang', () => {
    expect(detectImageFormat(new Uint8Array([0xff]))).toBeNull();
    expect(detectImageFormat(new Uint8Array([]))).toBeNull();
  });

  it('khong nham RIFF khong phai WEBP thanh anh', () => {
    // "RIFF" + kich thuoc + "WAVE" - file am thanh, khong phai anh.
    const wav = [
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56,
      0x45,
    ];
    expect(detectImageFormat(new Uint8Array(wav))).toBeNull();
  });
});

describe('validateImageFile', () => {
  it('chap nhan anh JPEG hop le', async () => {
    const result = await validateImageFile(makeFile(JPEG));
    expect(result.valid).toBe(true);
    expect(result.format).toBe('jpeg');
    expect(result.message).toBeNull();
  });

  it('tu choi file rong', async () => {
    const result = await validateImageFile(new File([], 'rong.jpg'));
    expect(result.valid).toBe(false);
    expect(result.error).toBe('empty');
    expect(result.message).toBe('File ảnh rỗng, vui lòng chọn ảnh khác');
  });

  it('tu choi file vuot 10 MB', async () => {
    const result = await validateImageFile(
      makeFile(JPEG, { padTo: MAX_FILE_BYTES + 1 }),
    );
    expect(result.valid).toBe(false);
    expect(result.error).toBe('too-large');
  });

  it('tu choi file khong phai anh du duoi la .jpg', async () => {
    // Day chinh la ly do phai doc chu ky byte: `type` noi day la JPEG
    // nhung noi dung thuc te la PDF.
    const fake = makeFile([0x25, 0x50, 0x44, 0x46], {
      name: 'gia-mao.jpg',
      type: 'image/jpeg',
    });

    const result = await validateImageFile(fake);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('unsupported-format');
  });

  it('kiem tra kich thuoc truoc dinh dang', async () => {
    // File qua lon VA sai dinh dang - bao loi kich thuoc vi ro rang hon.
    const huge = makeFile([0x25, 0x50, 0x44, 0x46], {
      padTo: MAX_FILE_BYTES + 1,
    });

    expect((await validateImageFile(huge)).error).toBe('too-large');
  });
});
