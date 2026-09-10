import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  it('khoi tao duoc component goc', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('hien thi day du ba muc dieu huong', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const links = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'nav a',
    );
    const labels = Array.from(links).map((link) => link.textContent?.trim());

    expect(labels).toEqual(['Nhận diện', 'Tư vấn', 'Danh mục']);
  });

  it('goi /ready khi khoi dong de biet mo hinh da nap chua', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const request = httpMock.expectOne((req) => req.url.endsWith('/ready'));
    expect(request.request.method).toBe('GET');
  });
});
