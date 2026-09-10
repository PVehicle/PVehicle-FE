# Trang danh mục xe

Danh mục 216 dòng xe, có bộ lọc và phân trang, kèm trang chi tiết từng xe.

Đường dẫn: `/danh-muc` và `/danh-muc/:className`

---

## 1. Các file đã thêm

```text
src/app/core/
└── filters.store.ts                # Giá trị lọc từ /cars/filters (dùng chung)

src/app/features/catalog/
├── catalog.page.ts                 # Lưới xe + phân trang
├── catalog.store.ts                # Danh sách, bộ lọc, phân trang
├── catalog-filters.component.ts    # Form lọc
├── car-detail.page.ts              # Chi tiết một dòng xe
└── car-detail.store.ts             # Thông số + xe tương tự
```

`filters.store.ts` đặt ở `core/` vì trang Tư vấn cũng cần `price_min`/
`price_max` cho slider ngân sách — nạp một lần, dùng cho cả hai trang.

---

## 2. Kiểm chứng với backend thật

Khác hai feature trước, lần này backend đã chạy ở `localhost:8000` nên gọi
được API thật.

| Kiểm tra | Kết quả |
| :--- | :--- |
| `/ready` | `car_count: 216`, `class_count: 196`, `models_loaded: true` |
| `/cars?limit=2` | `total: 216`, dữ liệu khớp schema |
| `/cars/filters` | 9 kiểu dáng, 3 phân khúc, giá 240 – 19026.9 |
| Lọc `brand=toyota` (chữ thường) | 11 xe — xác nhận không phân biệt hoa thường |
| `/cars/{class_name}` có dấu cách | HTTP 200 |
| `/cars/{class_name}/similar` | Trả `score` giảm dần |
| CORS từ dev server | `access-control-allow-origin: *` |
| Header `X-Request-ID` | Có trong `access-control-expose-headers` |

---

## 3. Phát hiện quan trọng: `class_name` không có năm

**README ghi ví dụ `Tesla Model S Sedan 2012` — gọi thật trả HTTP 404.**

Dữ liệu thật:

```text
"AM General Hummer SUV"        ← không có năm
"Toyota Camry Sedan"           ← không có năm
"Dodge Durango SUV 2007"       ← có năm
```

**185/200 xe không có năm ở cuối tên.** Chỉ một số ít có, thường là khi cần
phân biệt các đời khác nhau của cùng một dòng (`Ford F-150 Regular Cab 2012`
và `Ford F-150 Regular Cab 2007`).

Điều này **không làm vỡ code** vì frontend luôn dùng `class_name` nguyên bản
lấy từ API, không tự ghép tên. Ví dụ sai trong `openapi.json` đã được sửa,
và `README.md` đã bổ sung ghi chú về điều này.

### Ký tự đặc biệt trong tên

24/200 xe có ký tự ngoài chữ và số:

```text
"Bugatti Veyron 16.4 Convertible"                    ← dấu chấm
"Acura TL Type-S"                                    ← gạch ngang
"Bentley Continental Supersports Conv. Convertible"  ← dấu chấm
"Ford F-450 Super Duty Crew Cab"                     ← gạch ngang
```

Đã gọi thử cả bốn tên trên với `encodeURIComponent()` — **tất cả trả HTTP
200**. Không có tên nào chứa dấu `/` (ký tự này mới thực sự gây vỡ route).

---

## 3b. Đính chính: lỗi 422 trả `detail` dạng chuỗi

Tài liệu [khoi-tao-du-an.md](khoi-tao-du-an.md) mục 3.1 nói backend trả
`detail` theo hai dạng — chuỗi cho lỗi nghiệp vụ, **mảng** cho lỗi 422.
Điều đó dựa trên schema `HTTPValidationError` trong `openapi.json`.

**Gọi thật cho kết quả khác:**

```bash
GET /api/v1/cars?limit=999
→ 422 {"detail":"Du lieu gui len khong hop le. limit: Input should be
       less than or equal to 200","request_id":"76dc1509a088"}
```

Backend có handler tùy chỉnh, gộp lỗi validation thành **một chuỗi tiếng
Việt** kèm `request_id`. Đã thử ba trường hợp (vượt max, sai kiểu, số âm) —
đều trả chuỗi.

`openapi.json` khai báo schema mặc định của FastAPI, không phản ánh handler
thật. **README đúng, spec mới là chỗ gây hiểu nhầm.**

Code không phải sửa: `readDetail()` xử lý cả hai dạng, nhánh mảng nay thành
dự phòng. Đã thêm test khóa hành vi thật này lại.

---

## 4. Các quyết định kỹ thuật

### 4.1. `car-detail.page` dùng `effect()` thay vì `ngOnInit()`

Bấm vào một xe tương tự sẽ đổi route param `:className` nhưng Angular
**dùng lại component** thay vì tạo mới — `ngOnInit()` không chạy lại, trang
sẽ đứng im ở xe cũ.

`effect()` theo dõi signal `className()` nên bắt được mọi lần đổi param.

### 4.2. `Promise.allSettled` cho trang chi tiết

Trang gọi hai endpoint: thông số xe và xe tương tự. Hai lời gọi không phụ
thuộc nhau nên chạy song song.

Dùng `allSettled` chứ không phải `all`: **xe tương tự lỗi thì vẫn hiện được
thông số**. Nếu dùng `all`, một lỗi phụ sẽ làm hỏng cả trang.

Ngược lại, thông số lỗi thì dừng hẳn — không có gì để hiển thị.

### 4.3. Đổi bộ lọc thì về trang đầu

Đang ở trang 5 mà lọc lại còn 11 xe (1 trang) thì `offset: 80` sẽ trả danh
sách rỗng — người dùng tưởng không có kết quả. `setFilters()` luôn đặt
`offset: 0`.

### 4.4. Ô "Hãng xe" để người dùng tự gõ

`/cars/filters` trả về `body_styles` và `segments` nhưng **không trả danh
sách hãng**. Nên hai trường kia là `<select>`, còn hãng là `<input
type="search">`.

Backend so sánh không phân biệt hoa thường nên gõ `toyota` hay `Toyota` đều
được — đã kiểm chứng.

### 4.5. Danh sách rỗng không phải lỗi

`isEmpty()` phân biệt rõ với `error()`. Khi rỗng, gợi ý hiển thị khác nhau
tùy có đang lọc hay không:

- Có lọc → "Thử bỏ bớt một điều kiện lọc", "Kiểm tra chính tả tên hãng"
- Không lọc → "Danh mục hiện chưa có dữ liệu, thử tải lại trang"

---

## 5. Vấn đề đã gặp

### 5.1. Matcher trong test quá rộng

Hai test `car-detail.store.spec.ts` báo `found 2 requests`. Nguyên nhân:
`expectOne((req) => req.url.includes('Tesla'))` khớp **cả** request thông số
lẫn request `/similar`, vì cả hai URL đều chứa chuỗi đó.

Sửa bằng `endsWith('/cars/<tên đã mã hóa>')` để chốt đúng một request. Lỗi
ở test, không phải ở code.

---

## 6. Khả năng tiếp cận

| Hạng mục | Cách làm |
| :--- | :--- |
| Thẻ xe | Bọc trong `<a>` kèm `aria-label` mô tả rõ |
| Phân trang | `<nav aria-label>`, số trang có `aria-live="polite"` |
| Trạng thái tải | `role="status"` |
| Lỗi | `role="alert"` |
| Form lọc | Mỗi trường có `<label for>` liên kết đúng |
| Danh sách | Dùng `<ul>/<li>` để trình đọc màn hình đếm được |

---

## 7. Kiểm chứng

| Việc | Kết quả |
| :--- | :--- |
| Build development | Thành công |
| Kiểm thử | **50/50 pass** (trước feature này: 36) |
| API thật | 8 endpoint gọi thử, xem mục 2 |

Test đã thêm:

- `catalog.store.spec.ts` — 9 test: phân trang, chặn vượt biên, gửi đúng
  tham số lọc, xóa lọc, danh sách rỗng, lỗi 503
- `car-detail.store.spec.ts` — 4 test: nạp song song, mã hóa tên có dấu
  chấm, xe tương tự lỗi vẫn hiện thông số, 404
- `error.interceptor.spec.ts` — thêm 1 test khóa dạng lỗi 422 thật

---

## 8. Việc còn lại

- [ ] Đồng bộ bộ lọc lên query param của URL (chia sẻ link giữ nguyên bộ lọc)
- [ ] Kiểm tra bằng trình đọc màn hình
