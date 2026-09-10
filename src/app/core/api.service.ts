import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import type {
  CarListQuery,
  CarListResponse,
  CarSpecs,
  FilterOptions,
  HealthResponse,
  ReadinessResponse,
  RecognitionResponse,
  RecognizeOptions,
  RecommendRequest,
  RecommendResponse,
} from './models';

/** Bao toan bo REST API cua PVehicle-AI. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base_url = environment.apiBaseUrl;

  // --- Kiem tra suc khoe -------------------------------------------------

  /** Tien trinh con song khong. Luon tra 200 neu may chu con chay. */
  health(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.base_url}/health`);
  }

  /** Da nap xong mo hinh chua. Tra 503 khi chua san sang. */
  ready(): Observable<ReadinessResponse> {
    return this.http.get<ReadinessResponse>(`${this.base_url}/ready`);
  }

  // --- Nhan dien ---------------------------------------------------------

  /**
   * Nhan dien cac dong xe co trong anh.
   *
   * Khong tu dat `Content-Type` cho `FormData` - trinh duyet phai tu sinh
   * kem `boundary`, dat tay se lam backend khong doc duoc file.
   */
  recognize(
    file: File,
    options: RecognizeOptions = {},
  ): Observable<RecognitionResponse> {
    const form = new FormData();
    form.append('file', file);

    let params = new HttpParams();
    if (options.topK != null) {
      params = params.set('top_k', options.topK);
    }
    if (options.includeSimilar != null) {
      params = params.set('include_similar', options.includeSimilar);
    }
    if (options.similarCount != null) {
      params = params.set('similar_count', options.similarCount);
    }

    return this.http.post<RecognitionResponse>(
      `${this.base_url}/api/v1/recognize`,
      form,
      { params },
    );
  }

  // --- Danh muc xe -------------------------------------------------------

  /** Liet ke danh muc xe, co loc va phan trang. */
  listCars(query: CarListQuery = {}): Observable<CarListResponse> {
    let params = new HttpParams();
    if (query.brand) {
      params = params.set('brand', query.brand);
    }
    if (query.bodyStyle) {
      params = params.set('body_style', query.bodyStyle);
    }
    if (query.segment) {
      params = params.set('segment', query.segment);
    }
    if (query.limit != null) {
      params = params.set('limit', query.limit);
    }
    if (query.offset != null) {
      params = params.set('offset', query.offset);
    }

    return this.http.get<CarListResponse>(`${this.base_url}/api/v1/cars`, {
      params,
    });
  }

  /**
   * Lay cac gia tri hop le de dung form loc.
   *
   * Goi endpoint nay thay vi viet cung danh sach - bang thong so co the
   * thay doi theo thoi gian.
   */
  getFilters(): Observable<FilterOptions> {
    return this.http.get<FilterOptions>(
      `${this.base_url}/api/v1/cars/filters`,
    );
  }

  /**
   * Tra cuu thong so mot dong xe theo ten lop day du.
   *
   * `class_name` chua dau cach nen bat buoc phai ma hoa.
   */
  getCar(class_name: string): Observable<CarSpecs> {
    const encoded = encodeURIComponent(class_name);
    return this.http.get<CarSpecs>(`${this.base_url}/api/v1/cars/${encoded}`);
  }

  /** Tim cac xe co dac diem gan giong xe da cho. */
  getSimilarCars(
    class_name: string,
    top_n = 5,
  ): Observable<RecommendResponse> {
    const encoded = encodeURIComponent(class_name);
    const params = new HttpParams().set('top_n', top_n);

    return this.http.get<RecommendResponse>(
      `${this.base_url}/api/v1/cars/${encoded}/similar`,
      { params },
    );
  }

  // --- Tu van ------------------------------------------------------------

  /**
   * Goi y xe theo nhu cau.
   *
   * Cac dieu kien la rang buoc cung - danh sach rong (`count: 0`) khong
   * phai loi, chi nghia la khong co xe nao thoa man.
   */
  recommend(needs: RecommendRequest): Observable<RecommendResponse> {
    return this.http.post<RecommendResponse>(
      `${this.base_url}/api/v1/recommend`,
      needs,
    );
  }
}
