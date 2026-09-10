import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { CarSpecs, RecommendResponse } from '../../core/models';
import { CarDetailStore } from './car-detail.store';

function car(class_name: string): CarSpecs {
  return {
    class_id: 1,
    class_name,
    brand: 'AM General',
    model: 'Hummer',
    body_style: 'SUV',
    year: 2000,
    seats: 7,
    segment: 'economy',
    price_million_vnd: 522.2,
    fuel_l_per_100km: 12.5,
  };
}

const SIMILAR: RecommendResponse = {
  count: 1,
  cars: [{ ...car('Dodge Durango SUV 2007'), score: 0.82 }],
};

describe('CarDetailStore', () => {
  let store: InstanceType<typeof CarDetailStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    store = TestBed.inject(CarDetailStore);
    httpMock = TestBed.inject(HttpTestingController);
    store.reset();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('nap song song thong so va xe tuong tu', async () => {
    const promise = store.load('AM General Hummer SUV');

    const detail = httpMock.expectOne((req) =>
      req.url.endsWith('/api/v1/cars/AM%20General%20Hummer%20SUV'),
    );
    const similar = httpMock.expectOne((req) =>
      req.url.endsWith('/api/v1/cars/AM%20General%20Hummer%20SUV/similar'),
    );

    detail.flush(car('AM General Hummer SUV'));
    similar.flush(SIMILAR);
    await promise;

    expect(store.found()).toBe(true);
    expect(store.car()?.brand).toBe('AM General');
    expect(store.similarCars().length).toBe(1);
  });

  it('ma hoa dung ten xe co dau cham va gach ngang', async () => {
    // Ten that trong danh muc, vi du "Bugatti Veyron 16.4 Convertible".
    const promise = store.load('Bugatti Veyron 16.4 Convertible');

    // Phai chot bang `endsWith` - `/similar` cung chua chuoi da ma hoa.
    const detail = httpMock.expectOne((req) =>
      req.url.endsWith('/cars/Bugatti%20Veyron%2016.4%20Convertible'),
    );
    const similar = httpMock.expectOne((req) => req.url.endsWith('/similar'));

    detail.flush(car('Bugatti Veyron 16.4 Convertible'));
    similar.flush({ count: 0, cars: [] });
    await promise;

    expect(store.found()).toBe(true);
  });

  it('van hien thong so khi xe tuong tu loi', async () => {
    const promise = store.load('Toyota Camry Sedan');

    httpMock
      .expectOne((req) => req.url.endsWith('/api/v1/cars/Toyota%20Camry%20Sedan'))
      .flush(car('Toyota Camry Sedan'));
    // Xe tuong tu hong khong duoc lam vo ca trang.
    httpMock
      .expectOne((req) => req.url.endsWith('/similar'))
      .flush('loi', { status: 503, statusText: 'Service Unavailable' });
    await promise;

    expect(store.found()).toBe(true);
    expect(store.similarCars()).toEqual([]);
    expect(store.error()).toBeNull();
  });

  it('bao khong tim thay khi may chu tra 404', async () => {
    const promise = store.load('Tesla Model S Sedan 2012');

    httpMock
      .expectOne((req) =>
        req.url.endsWith('/cars/Tesla%20Model%20S%20Sedan%202012'),
      )
      .flush(
        { detail: "Khong tim thay dong xe 'Tesla Model S Sedan 2012'." },
        { status: 404, statusText: 'Not Found' },
      );
    httpMock
      .expectOne((req) => req.url.endsWith('/similar'))
      .flush({ count: 0, cars: [] });
    await promise;

    expect(store.found()).toBe(false);
    expect(store.notFound()).toBe(true);
    expect(store.error()).toBe('Khong tim thay xe nay');
  });
});
