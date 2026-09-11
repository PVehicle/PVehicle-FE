import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { HealthStore } from './health.store';
import type { ReadinessResponse } from './models';

const READY: ReadinessResponse = {
  status: 'ready',
  models_loaded: true,
  car_count: 216,
  class_count: 196,
  detail: null,
};

describe('HealthStore', () => {
  let store: InstanceType<typeof HealthStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    store = TestBed.inject(HealthStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  /** Tra loi request `/ready` dang cho. */
  function flushReady(
    body: ReadinessResponse | string,
    opts?: { status: number; statusText: string },
  ): void {
    const request = httpMock.expectOne((req) => req.url.endsWith('/ready'));
    if (opts) {
      request.flush(body, opts);
    } else {
      request.flush(body);
    }
  }

  it('bat nhan dien khi mo hinh da nap', async () => {
    const promise = store.check();
    flushReady(READY);
    await promise;

    expect(store.canRecognize()).toBe(true);
    expect(store.carCount()).toBe(216);
    expect(store.isOffline()).toBe(false);
  });

  it('phan biet may chu khong phan hoi voi mo hinh chua nap', async () => {
    // status 0 = khong ket noi duoc (backend chua bat).
    const promise = store.check();
    httpMock
      .expectOne((req) => req.url.endsWith('/ready'))
      .error(new ProgressEvent('error'), { status: 0, statusText: '' });
    await promise;

    expect(store.isOffline()).toBe(true);
    expect(store.canRecognize()).toBe(false);
  });

  it('503 la mo hinh chua nap, khong phai mat ket noi', async () => {
    const promise = store.check();
    flushReady('chua san sang', {
      status: 503,
      statusText: 'Service Unavailable',
    });
    await promise;

    // Day la trang thai khoi dong binh thuong - khong duoc bao "mat ket
    // noi" vi may chu van dang tra loi.
    expect(store.isOffline()).toBe(false);
    expect(store.canRecognize()).toBe(false);
    expect(store.error()).toBe('He thong dang khoi dong');
  });
});
