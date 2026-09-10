# Trang nhận diện xe

Trang cho phép người dùng tải ảnh ô tô lên, nhận về dòng xe kèm thông số
kỹ thuật và các xe tương tự.

Đường dẫn: `/nhan-dien`

---

## 1. Các file đã thêm

```text
src/app/core/
└── image-validation.ts             # Kiểm tra ảnh bằng magic bytes

src/app/features/recognition/
├── recognition.page.ts             # Ghép toàn bộ trang
├── recognition.store.ts            # Trạng thái luồng nhận diện
├── image-upload.component.ts       # Kéo thả / chọn file / dán URL
├── detection-overlay.component.ts  # Vẽ khung bao trên ảnh
└── prediction-list.component.ts    # Top-5 + thông số + xe tương tự

src/app/shared/
├── car-card.component.ts           # Thẻ thông số xe (dùng chung 3 trang)
├── confidence-bar.component.ts     # Thanh xác suất
└── empty-state.component.ts        # Trạng thái rỗng
```

---

## 2. Luồng hoạt động

```text
Chọn ảnh (kéo thả / file / URL)
      ↓
validateImageFile()  ← kiểm tra magic bytes, kích thước
      ↓ hợp lệ
Tạo object URL để xem trước
      ↓ bấm "Nhận diện"
POST /api/v1/recognize?top_k=5&include_similar=true&similar_count=3
      ↓
Vẽ khung bao + hiện top-5 + thông số + xe tương tự
```

---

## 3. Các quyết định kỹ thuật

### 3.1. Vẽ khung bao bằng `viewBox` thay vì nhân hệ số tỉ lệ

Tọa độ `box` tính theo **ảnh gốc**, còn ảnh hiển thị thường bị thu nhỏ.

Mẫu trong `README.md` tính hệ số `scale` một lần trong `onLoad()` rồi nhân
tay vào từng tọa độ. Cách đó **lệch khung khi cửa sổ đổi kích thước**, vì
`onLoad` không chạy lại.

Cách đã dùng: đặt `viewBox="0 0 naturalWidth naturalHeight"` trên thẻ
`<svg>` rồi ghi tọa độ nguyên bản. Trình duyệt tự quy đổi, đúng ở mọi kích
thước cửa sổ, không cần theo dõi resize.

`vector-effect: non-scaling-stroke` giữ nét viền không bị kéo giãn theo
`viewBox`.

### 3.2. Kiểm tra ảnh bằng magic bytes

`file.type` do trình duyệt đoán từ đuôi file — đổi tên `tai-lieu.pdf`
thành `anh.jpg` là `type` thành `image/jpeg`. Backend kiểm tra chữ ký byte
đầu file nên frontend làm tương tự để báo lỗi sớm.

`detectImageFormat()` đọc 12 byte đầu, nhận dạng JPEG/PNG/BMP/GIF/WEBP.

Điểm cần lưu ý: **WEBP và WAV đều bắt đầu bằng `RIFF`**. Phải kiểm tra
thêm 4 byte `WEBP` ở vị trí thứ 8, nếu không file âm thanh sẽ lọt qua. Có
test riêng chặn trường hợp này.

Thứ tự kiểm tra: rỗng → quá lớn → sai định dạng. File vừa quá lớn vừa sai
định dạng thì báo lỗi kích thước, vì đó là thông tin rõ ràng hơn.

### 3.3. Thu hồi object URL

`URL.createObjectURL()` giữ blob trong bộ nhớ tới khi được thu hồi. Store
gọi `revokePreview()` mỗi lần chọn ảnh mới và khi `reset()`, tránh rò rỉ
khi người dùng thử nhiều ảnh liên tiếp.

### 3.4. Xử lý `box: null`

Khi YOLOv8 không khoanh được vùng xe, backend phân loại toàn bộ ảnh và trả
`box: null`. Overlay bỏ qua xe đó (không vẽ khung), `prediction-list` hiện
ghi chú "Không khoanh được vùng xe, hệ thống phân loại toàn bộ ảnh".

### 3.5. Ảnh nhiều xe

Ảnh đường phố thường có 3-5 xe. Khi `vehicles.length > 1`, trang hiện dãy
nút chọn xe (`role="tablist"`). Bấm vào khung bao trên ảnh cũng chọn xe
tương ứng — khung đang chọn được tô đậm.

### 3.6. Cảnh báo độ tin cậy

- `is_confident: false` → hiện cảnh báo `role="alert"`, nói rõ kết quả chỉ
  mang tính tham khảo
- `likely_not_a_car: true` → cảnh báo riêng ở đầu khu vực kết quả

`confidence-bar` đổi màu theo 3 mức (≥0.5 / ≥0.15 / thấp hơn), nhưng **màu
không phải tín hiệu duy nhất** — luôn có số phần trăm đi kèm, đúng WCAG.

### 3.7. Dán URL ảnh

Backend không nhận URL nên frontend tự `fetch()` rồi gửi blob.

Bước này **thường hỏng vì CORS** — máy chủ chứa ảnh phải cho phép truy cập
từ trình duyệt. Component bắt lỗi và báo rõ nguyên nhân thay vì để im lặng.

### 3.8. `isDevMode()` thay cho `import.meta.env`

`processing_ms` chỉ hữu ích khi gỡ lỗi. Angular esbuild **không expose**
`import.meta.env` như Vite — dùng `isDevMode()` của `@angular/core`.

---

## 4. Vấn đề đã gặp

### 4.1. Backtick trong comment SCSS làm vỡ template literal

Comment `// \`vector-effect\` giu net vien...` nằm trong khối `styles: \`...\``
khiến backtick kết thúc chuỗi sớm, sinh ra 3 lỗi biên dịch liên hoàn
(TS1135, NG2012).

**Quy tắc:** không dùng backtick trong comment nằm bên trong `template:` hoặc
`styles:`. Comment TypeScript thường (ngoài template literal) thì vẫn dùng
được bình thường.

### 4.2. Tên biến template trùng tên thuộc tính

`viewChild.required(...)` đặt tên `picker` cùng lúc template có `#picker`.
Angular ưu tiên phân giải `picker` thành `HTMLInputElement` nên gọi
`picker()` báo "not callable".

Đã đổi biến template thành `#pickerEl` và bọc thao tác trong phương thức
`openPicker()`.

---

## 5. Khả năng tiếp cận

| Hạng mục | Cách làm |
| :--- | :--- |
| Cảnh báo | `role="alert"` cho lỗi và cảnh báo độ tin cậy |
| Trạng thái tải | `role="status"` để không cắt ngang trình đọc màn hình |
| Thanh xác suất | `role="meter"` kèm `aria-valuenow`, `aria-label` |
| Chọn xe | `role="tablist"` / `role="tab"` kèm `aria-selected` |
| Input file | Ẩn bằng `clip-path`, thao tác qua nút có nhãn rõ |
| Màu sắc | Không dùng màu làm tín hiệu duy nhất |

---

## 6. Kiểm chứng

| Việc | Kết quả |
| :--- | :--- |
| Build development | Thành công |
| Build production | Thành công, 284 kB initial |
| Kiểm thử | **36/36 pass** (trước feature này: 18) |

Test đã thêm:

- `image-validation.spec.ts` — 10 test: nhận dạng 5 định dạng, chặn PDF đội
  lốt `.jpg`, chặn WAV giả WEBP, giới hạn kích thước
- `recognition.store.spec.ts` — 8 test: chọn ảnh, tham số request, chọn xe,
  `box: null`, lỗi 413, `likely_not_a_car`

**Chưa kiểm chứng end-to-end với backend thật** — backend `localhost:8000`
chưa chạy lúc phát triển. Toàn bộ test dùng `HttpTestingController` với dữ
liệu giả theo đúng `openapi.json`.

---

## 7. Việc còn lại của trang này

- [ ] Thử với backend thật, đối chiếu khung bao trên ảnh nhiều xe
- [ ] Kiểm tra bằng trình đọc màn hình
- [ ] Cân nhắc nén ảnh phía client trước khi gửi (ảnh 4000×3000 tốn băng thông)
