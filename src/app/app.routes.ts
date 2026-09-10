import { Routes } from '@angular/router';

/**
 * Moi feature duoc lazy-load rieng de goi tai dau vao nho.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'nhan-dien',
  },
  {
    path: 'nhan-dien',
    title: 'Nhận diện xe — PVehicle',
    loadComponent: () =>
      import('./features/recognition/recognition.page').then(
        (m) => m.RecognitionPage,
      ),
  },
  {
    path: 'tu-van',
    title: 'Tư vấn xe — PVehicle',
    loadComponent: () =>
      import('./features/recommendation/recommendation.page').then(
        (m) => m.RecommendationPage,
      ),
  },
  {
    path: 'danh-muc',
    title: 'Danh mục xe — PVehicle',
    loadComponent: () =>
      import('./features/catalog/catalog.page').then((m) => m.CatalogPage),
  },
  {
    path: 'danh-muc/:className',
    title: 'Chi tiết xe — PVehicle',
    loadComponent: () =>
      import('./features/catalog/car-detail.page').then(
        (m) => m.CarDetailPage,
      ),
  },
  {
    path: '**',
    redirectTo: 'nhan-dien',
  },
];
