import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { RecognitionResponse } from '../../core/models';
import { RecognitionStore } from './recognition.store';

const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);

function jpegFile(name = 'xe.jpg'): File {
  return new File([JPEG_BYTES], name, { type: 'image/jpeg' });
}

/** Ket qua co hai xe de kiem tra viec chon tung chiec. */
function twoVehicleResult(): RecognitionResponse {
  return {
    vehicle_count: 2,
    likely_not_a_car: false,
    processing_ms: 210.5,
    vehicles: [
      {
        box: {
          x1: 10,
          y1: 20,
          x2: 100,
          y2: 200,
          confidence: 0.8,
          coco_class: 'car',
        },
        source: 'international',
        is_confident: true,
        predictions: [
          { model_index: 1, class_name: 'Xe A', confidence: 0.9 },
        ],
        similar_cars: [],
      },
      {
        box: null,
        source: 'vietnam',
        is_confident: false,
        predictions: [
          { model_index: 2, class_name: 'Xe B', confidence: 0.1 },
        ],
        similar_cars: [],
      },
    ],
  };
}

describe('RecognitionStore', () => {
  let store: InstanceType<typeof RecognitionStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    store = TestBed.inject(RecognitionStore);
    httpMock = TestBed.inject(HttpTestingController);
    store.reset();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('bat dau o trang thai rong', () => {
    expect(store.previewUrl()).toBeNull();
    expect(store.result()).toBeNull();
    expect(store.vehicles()).toEqual([]);
    expect(store.canSubmit()).toBe(false);
  });

  it('nhan anh hop le va tao URL xem truoc', async () => {
    const accepted = await store.selectFile(jpegFile());

    expect(accepted).toBe(true);
    expect(store.previewUrl()).not.toBeNull();
    expect(store.fileName()).toBe('xe.jpg');
    expect(store.canSubmit()).toBe(true);
  });

  it('tu choi file khong phai anh va bao loi', async () => {
    const pdf = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'a.jpg', {
      type: 'image/jpeg',
    });

    const accepted = await store.selectFile(pdf);

    expect(accepted).toBe(false);
    expect(store.previewUrl()).toBeNull();
    expect(store.error()).toBe('Chỉ hỗ trợ JPEG, PNG, BMP, GIF, WEBP');
  });

  it('gui anh len may chu kem dung tham so', async () => {
    const promise = store.recognize(jpegFile());

    const request = httpMock.expectOne((req) =>
      req.url.endsWith('/api/v1/recognize'),
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.params.get('top_k')).toBe('5');
    expect(request.request.params.get('include_similar')).toBe('true');
    expect(request.request.params.get('similar_count')).toBe('3');

    request.flush(twoVehicleResult());
    await promise;

    expect(store.loading()).toBe(false);
    expect(store.vehicles().length).toBe(2);
    expect(store.hasMultipleVehicles()).toBe(true);
  });

  it('chon duoc tung xe trong anh nhieu xe', async () => {
    const promise = store.recognize(jpegFile());
    httpMock
      .expectOne((req) => req.url.endsWith('/api/v1/recognize'))
      .flush(twoVehicleResult());
    await promise;

    expect(store.selected()?.predictions[0].class_name).toBe('Xe A');

    store.select(1);
    expect(store.selected()?.predictions[0].class_name).toBe('Xe B');
    // Xe thu hai co `box = null` - giao dien phai xu ly duoc.
    expect(store.selected()?.box).toBeNull();
  });

  it('bo qua chi so nam ngoai danh sach', async () => {
    const promise = store.recognize(jpegFile());
    httpMock
      .expectOne((req) => req.url.endsWith('/api/v1/recognize'))
      .flush(twoVehicleResult());
    await promise;

    store.select(99);
    expect(store.selectedIndex()).toBe(0);

    store.select(-1);
    expect(store.selectedIndex()).toBe(0);
  });

  it('luu thong bao tieng Viet khi may chu tra loi', async () => {
    const promise = store.recognize(jpegFile());

    httpMock
      .expectOne((req) => req.url.endsWith('/api/v1/recognize'))
      .flush('qua lon', { status: 413, statusText: 'Payload Too Large' });
    await promise;

    expect(store.loading()).toBe(false);
    expect(store.result()).toBeNull();
    expect(store.error()).toBe('Anh qua lon, toi da 10 MB');
  });

  it('danh dau anh nhieu kha nang khong phai o to', async () => {
    const promise = store.recognize(jpegFile());

    httpMock.expectOne((req) => req.url.endsWith('/api/v1/recognize')).flush({
      vehicle_count: 0,
      likely_not_a_car: true,
      processing_ms: 88,
      vehicles: [],
    } satisfies RecognitionResponse);
    await promise;

    expect(store.notACar()).toBe(true);
    expect(store.vehicles()).toEqual([]);
  });
});
