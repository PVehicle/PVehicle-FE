import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { CarListResponse, CarSpecs } from '../../core/models';
import { CatalogStore, PAGE_SIZE } from './catalog.store';

function car(class_name: string, brand = 'Toyota'): CarSpecs {
  return {
    class_id: 1,
    class_name,
    brand,
    model: 'Model',
    body_style: 'SUV',
    year: 2012,
    seats: 5,
    segment: 'economy',
    price_million_vnd: 500,
    fuel_l_per_100km: 8,
  };
}

function page(cars: CarSpecs[], total: number, offset = 0): CarListResponse {
  return { total, limit: PAGE_SIZE, offset, cars };
}

describe('CatalogStore', () => {
  let store: InstanceType<typeof CatalogStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    store = TestBed.inject(CatalogStore);
    httpMock = TestBed.inject(HttpTestingController);
    store.reset();
  });

  afterEach(() => {
    httpMock.verify();
  });

  /** Tra loi mot request `/cars` dang cho. */
  function flushList(response: CarListResponse): void {
    httpMock
      .expectOne((req) => req.url.endsWith('/api/v1/cars'))
      .flush(response);
  }

  it('nap trang dau voi dung limit va offset', async () => {
    const promise = store.load();

    const request = httpMock.expectOne((req) =>
      req.url.endsWith('/api/v1/cars'),
    );
    expect(request.request.params.get('limit')).toBe(String(PAGE_SIZE));
    expect(request.request.params.get('offset')).toBe('0');

    request.flush(page([car('Toyota Camry Sedan')], 216));
    await promise;

    expect(store.total()).toBe(216);
    expect(store.cars().length).toBe(1);
    expect(store.currentPage()).toBe(1);
  });

  it('tinh so trang tu tong so xe', async () => {
    const promise = store.load();
    flushList(page([car('A')], 216));
    await promise;

    // 216 xe, moi trang 20 -> 11 trang.
    expect(store.pageCount()).toBe(11);
    expect(store.hasPrevious()).toBe(false);
    expect(store.hasNext()).toBe(true);
  });

  it('chuyen trang sau va gui dung offset', async () => {
    const first = store.load();
    flushList(page([car('A')], 216));
    await first;

    const second = store.nextPage();
    const request = httpMock.expectOne((req) =>
      req.url.endsWith('/api/v1/cars'),
    );
    expect(request.request.params.get('offset')).toBe(String(PAGE_SIZE));

    request.flush(page([car('B')], 216, PAGE_SIZE));
    await second;

    expect(store.currentPage()).toBe(2);
    expect(store.hasPrevious()).toBe(true);
  });

  it('khong di qua trang cuoi', async () => {
    const promise = store.load();
    flushList(page([car('A')], 5));
    await promise;

    // Chi co 5 xe, gon trong mot trang.
    expect(store.hasNext()).toBe(false);

    // Khong phat sinh request nao - `afterEach` se bat neu co.
    await store.nextPage();
    expect(store.currentPage()).toBe(1);
  });

  it('gioi han trang khi nhay vuot pham vi', async () => {
    const first = store.load();
    flushList(page([car('A')], 216));
    await first;

    const jump = store.goToPage(999);
    httpMock
      .expectOne((req) => req.url.endsWith('/api/v1/cars'))
      .flush(page([car('Z')], 216, 200));
    await jump;

    // 11 trang, nhay toi 999 thi dung lai o trang cuoi.
    expect(store.currentPage()).toBe(11);
  });

  it('gui bo loc len may chu va ve trang dau', async () => {
    const first = store.load();
    flushList(page([car('A')], 216));
    await first;

    const next = store.nextPage();
    httpMock
      .expectOne((req) => req.url.endsWith('/api/v1/cars'))
      .flush(page([car('B')], 216, PAGE_SIZE));
    await next;
    expect(store.currentPage()).toBe(2);

    const filtered = store.setFilters({
      brand: 'Toyota',
      bodyStyle: 'SUV',
      segment: null,
    });

    const request = httpMock.expectOne((req) =>
      req.url.endsWith('/api/v1/cars'),
    );
    expect(request.request.params.get('brand')).toBe('Toyota');
    expect(request.request.params.get('body_style')).toBe('SUV');
    // Bo loc bang null thi khong gui tham so.
    expect(request.request.params.has('segment')).toBe(false);
    // Doi bo loc phai ve trang dau.
    expect(request.request.params.get('offset')).toBe('0');

    request.flush(page([car('Toyota Sequoia SUV')], 11));
    await filtered;

    expect(store.currentPage()).toBe(1);
    expect(store.hasFilters()).toBe(true);
  });

  it('xoa bo loc thi tra ve danh muc day du', async () => {
    const filtered = store.setFilters({
      brand: 'Toyota',
      bodyStyle: null,
      segment: null,
    });
    flushList(page([car('Toyota Camry Sedan')], 11));
    await filtered;
    expect(store.hasFilters()).toBe(true);

    const cleared = store.clearFilters();
    const request = httpMock.expectOne((req) =>
      req.url.endsWith('/api/v1/cars'),
    );
    expect(request.request.params.has('brand')).toBe(false);

    request.flush(page([car('A')], 216));
    await cleared;

    expect(store.hasFilters()).toBe(false);
    expect(store.total()).toBe(216);
  });

  it('danh sach rong khong phai loi', async () => {
    const promise = store.setFilters({
      brand: 'KhongTonTai',
      bodyStyle: null,
      segment: null,
    });
    flushList(page([], 0));
    await promise;

    expect(store.isEmpty()).toBe(true);
    expect(store.error()).toBeNull();
  });

  it('bao loi tieng Viet khi may chu tra loi', async () => {
    const promise = store.load();
    httpMock
      .expectOne((req) => req.url.endsWith('/api/v1/cars'))
      .flush('loi', { status: 503, statusText: 'Service Unavailable' });
    await promise;

    expect(store.error()).toBe('He thong dang khoi dong');
    expect(store.cars()).toEqual([]);
  });
});
