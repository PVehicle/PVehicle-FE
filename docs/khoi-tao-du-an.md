# Khởi tạo dự án PVehicle-FE

Tài liệu ghi lại việc dựng nền móng frontend: cấu hình, tầng `core/`, và
các quyết định kỹ thuật kèm lý do.

---

## 1. Phiên bản thực tế đã cài

| Gói | Phiên bản | Ghi chú |
| :--- | :--- | :--- |
| Angular | 22.1.7 | standalone, zoneless |
| TypeScript | 6.0.3 | **khác đặc tả** — xem mục 5 |
| `@ngrx/signals` | 22.0.0 | đúng đặc tả |
| Angular Material | 22.1.6 | theme azure-blue |
| Tailwind CSS | 4.x | qua `@tailwindcss/postcss` |
| Vitest | 4.1.11 | test runner mặc định của Angular 22 |
| `openapi-typescript` | 7.13.0 | sinh `api-types.ts` |
| Node | 24.18.0 | môi trường phát triển |

---

## 2. Cấu trúc đã dựng

```text
src/app/
├── core/
│   ├── api-types.ts            # SINH TỰ ĐỘNG — không sửa tay
│   ├── models.ts               # Bí danh cho các schema
│   ├── api.service.ts          # Bao đủ 7 endpoint
│   ├── api-key.interceptor.ts  # Thêm X-API-Key khi có cấu hình
│   ├── error.interceptor.ts    # Dịch mã lỗi sang tiếng Việt
│   └── health.store.ts         # Trạng thái /ready
│
├── features/
│   ├── recognition/recognition.page.ts        # khung trang
│   ├── recommendation/recommendation.page.ts  # khung trang
│   └── catalog/
│       ├── catalog.page.ts                    # khung trang
│       └── car-detail.page.ts                 # khung trang
│
├── shared/
│   ├── price.pipe.ts           # 594.4 → "594 triệu"
│   └── fuel.pipe.ts            # 0.0 → "Xe điện"
│
├── app.config.ts               # zoneless, HttpClient, interceptors
├── app.routes.ts               # lazy loading, đường dẫn tiếng Việt
├── app.ts                      # shell: điều hướng + chuyển chủ đề
└── app.html / app.scss
```

Bốn trang trong `features/` hiện là **khung rỗng**. Chúng tồn tại để
`app.routes.ts` có đích trỏ tới và dự án build được. Nội dung thật sẽ làm
ở các bước sau.

---

## 3. Các quyết định kỹ thuật

### 3.1. `error.interceptor` xử lý `detail` hai dạng

Backend trả `detail` theo **hai kiểu khác nhau**:

- Lỗi nghiệp vụ (400/404/413/415/503) → `detail` là **chuỗi**
- Lỗi validation (422) → `detail` là **mảng** `ValidationError[]`

Nếu giả định luôn là chuỗi, giao diện sẽ hiện `[object Object]`. Hàm
`readDetail()` kiểm tra kiểu trước khi đọc, và có test riêng chặn lỗi này.

`request_id` lấy từ header `X-Request-ID`, nếu không có thì đọc từ body.

### 3.2. `api-key.interceptor` bỏ qua endpoint công khai

`/health` và `/ready` luôn mở nên không gắn header. Khi `environment.apiKey`
rỗng (trường hợp thường gặp lúc phát triển), interceptor để request đi qua
nguyên vẹn.

Key **không viết cứng** trong code — đọc từ `environment.ts`.

### 3.3. Chủ đề sáng/tối

`body { color-scheme: light dark; }` để mặc định bám theo
`prefers-color-scheme`. Nút chuyển ghi đè bằng thuộc tính
`html[data-theme]`, lựa chọn lưu vào `localStorage`.

Cả hai lời gọi `localStorage` đều bọc `try/catch` — trình duyệt ở chế độ
riêng tư có thể ném lỗi khi truy cập.

### 3.4. `matchMedia` phải kiểm tra trước khi gọi

jsdom (môi trường test) không cài đặt `window.matchMedia`. Gọi thẳng sẽ
ném `TypeError` ngay lúc khởi tạo component. Code kiểm tra
`typeof window.matchMedia === 'function'` trước, thiếu thì mặc định chủ đề
sáng.

Lỗi này bị test bắt được chứ không phải suy đoán.

### 3.5. Không tự đặt `Content-Type` cho `FormData`

Trong `ApiService.recognize()`, `FormData` được truyền thẳng cho
`HttpClient`. Đặt tay `multipart/form-data` sẽ thiếu tham số `boundary` và
backend không đọc được file.

### 3.6. `class_name` phải mã hóa

`class_name` chứa dấu cách (ví dụ `Tesla Model S Sedan 2012`).
`ApiService.getCar()` và `getSimilarCars()` đều gọi `encodeURIComponent()`.

---

## 4. Vấn đề đã gặp và cách xử lý

### 4.1. npm 11 chặn install scripts

npm 11 không chạy `postinstall` mặc định. `esbuild` cần bước này, thiếu nó
thì build hỏng. Đã duyệt bằng:

```bash
npm approve-scripts esbuild lmdb msgpackr-extract @parcel/watcher
npm rebuild
```

### 4.2. `openapi-typescript` xung đột peer dependency

`openapi-typescript@7.13.0` khai báo `peerDependencies: { typescript: "^5.x" }`
trong khi dự án dùng TypeScript 6.0.3 → `npm install` báo `ERESOLVE`.

Đây là **peer range lạc hậu ở phía thư viện**. Công cụ chỉ đọc JSON rồi
sinh ra file `.ts` dạng text, nó không biên dịch bằng TS API của dự án, nên
lệch phiên bản không ảnh hưởng chức năng. Đã kiểm chứng: sinh ra 783 dòng
types đầy đủ, build và test đều pass.

Xử lý bằng `.npmrc` (kèm chú thích lý do):

```ini
legacy-peer-deps=true
```

### 4.3. `toFixed()` và làm tròn IEEE-754

Test ban đầu kỳ vọng `9.45 → "9,5"` nhưng thực tế ra `"9,4"`. Nguyên nhân:
`9.45` lưu trong IEEE-754 thực tế là `9.4499...` nên `toFixed(1)` làm tròn
xuống. Đây là hành vi **đúng chuẩn JavaScript**, không phải lỗi code — test
đã sửa lại cho khớp và ghi chú rõ.

---

## 5. Điểm lệch so với đặc tả — cần anh quyết định

**`README.md` ghi TypeScript 7.0, dự án đang chạy 6.0.3.**

Angular CLI 22.1.7 scaffold ra `typescript ~6.0.2`. TypeScript 7.0.2 đã có
trên npm, nhưng Angular 22.1 chưa khai báo hỗ trợ nó trong peer range.

Chưa nâng lên 7.0 vì việc đó có thể làm vỡ `@angular/compiler-cli`. Cần
quyết định trước khi làm feature.

---

## 6. Kiểm chứng

| Việc | Lệnh | Kết quả |
| :--- | :--- | :--- |
| Build dev | `npm run build -- --configuration development` | Thành công |
| Build production | `npm run build` | Thành công, 263 kB initial |
| Kiểm thử | `npm run test:ci` | 18/18 pass |
| Sinh types | `npm run gen:api` | 783 dòng |

Lazy loading hoạt động đúng — 4 trang tách thành chunk riêng.

---

## 7. Lệnh thường dùng

```bash
npm start              # chạy dev server
npm run build          # build production
npm run test:ci        # chạy test một lần
npm run gen:api        # sinh lại api-types.ts từ openapi.json
```

Chạy backend để phát triển:

```powershell
cd <thư mục PVehicle-AI>
.\.venv\Scripts\python.exe -m uvicorn src.api.main:app --reload
```

---

## 8. Việc còn lại

- [ ] Trang nhận diện: tải ảnh, vẽ khung bao, danh sách dự đoán
- [ ] Trang tư vấn: form nhu cầu, kết quả, trạng thái rỗng
- [ ] Trang danh mục: bảng/lưới, bộ lọc, phân trang
- [ ] Trang chi tiết xe: thông số + xe tương tự
- [ ] Component dùng chung: `car-card`, `confidence-bar`, `empty-state`
- [ ] Kiểm thử `ApiService` và các store
- [ ] Kiểm tra WCAG 2.2 AA đầy đủ
- [ ] Quyết định về phiên bản TypeScript (mục 5)
