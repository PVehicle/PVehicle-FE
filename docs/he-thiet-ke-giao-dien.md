# Hệ thiết kế giao diện

Tài liệu về design tokens, animation và các lớp dùng chung áp cho cả ba
trang.

---

## 1. Vì sao làm

Giao diện ban đầu quá trần trụi: chữ trắng trên nền đen, không có phân cấp
thị giác, vùng thả ảnh chỉ là ô gạch nét đứt trống, và các nút trông như
link chứ không phải nút bấm được.

Thay vì sửa riêng từng trang, em dựng một hệ tokens dùng chung trong
`src/styles.scss` rồi áp nhất quán — sau này thêm trang mới chỉ việc dùng
lại.

---

## 2. Design tokens

Khai báo trên `:root` trong [`src/styles.scss`](../src/styles.scss).

| Nhóm | Token | Dùng cho |
| :--- | :--- | :--- |
| Bo góc | `--app-radius-sm/md/lg/pill` | 0.5 / 0.75 / 1.25rem / viên thuốc |
| Đổ bóng | `--app-shadow-sm/md/lg` | Độ sâu tăng dần |
| Chuyển động | `--app-ease` | Thành phần xuất hiện |
| | `--app-spring` | Phản hồi khi người dùng tương tác |
| Thời lượng | `--app-duration-fast/`(mặc định)`/-slow` | 140 / 240 / 420ms |
| Nền | `--app-gradient` | Khu vực cần nổi bật |

**Vì sao hai đường cong khác nhau:** `--app-ease` mượt đều, hợp với thứ
đang xuất hiện. `--app-spring` có độ nảy nhẹ (`cubic-bezier` vượt quá 1),
tạo cảm giác vật thể phản hồi lại thao tác — chỉ dùng cho hover, active.

Toàn bộ màu vẫn lấy từ biến hệ thống của Angular Material
(`--mat-sys-*`) nên tự đúng ở cả chủ đề sáng và tối. Không viết cứng mã màu
nào.

---

## 3. Lớp dùng chung

| Lớp | Công dụng |
| :--- | :--- |
| `.app-btn` | Nút cơ bản, có hover nhấc lên và active thu nhỏ |
| `.app-btn--primary` | Nút hành động chính, nền màu chủ đạo |
| `.app-btn--ghost` | Nút phụ, viền mảnh nền trong suốt |
| `.app-spinner` | Vòng xoay nhỏ đặt trong nút khi đang xử lý |
| `.app-skeleton` | Khối xám có vệt sáng chạy, thay nội dung chưa tải xong |
| `.app-panel` | Khung nội dung có nền và viền nhẹ |
| `.app-enter` | Thành phần trôi lên khi xuất hiện |
| `.app-stagger` | Con của nó hiện lần lượt, mỗi cái trễ 40ms |

`.app-stagger` chỉ tạo độ trễ cho **12 phần tử đầu**. Sau đó tổng trễ đã là
480ms — thêm nữa chỉ khiến người dùng phải chờ.

---

## 4. Animation

| Keyframes | Dùng ở đâu |
| :--- | :--- |
| `app-fade-in-up` | Tiêu đề, thông báo, khối kết quả |
| `app-fade-in` | Header, vùng nội dung chính |
| `app-pop-in` | Ảnh xem trước, nút "Xóa bộ lọc", icon chủ đề |
| `app-shimmer` | Vệt sáng chạy trên skeleton |
| `app-spin` | Spinner, quầng sáng vùng thả ảnh |
| `app-pulse-ring` | Vùng thả ảnh khi đang kéo file vào |
| `bar-grow` | Thanh xác suất chạy từ 0 tới giá trị thật |
| `box-march` | Viền đứt chạy quanh khung bao đang chọn |

---

## 5. Thay đổi theo từng phần

### Header

- Kính mờ (`backdrop-filter`) — nội dung cuộn phía dưới vẫn thoáng thấy
- Logo có icon ô tô, hover thì nghiêng và phóng nhẹ
- Tab đang chọn có thanh gạch dưới **trượt ra từ giữa**
- Nút chủ đề đổi icon mặt trời/mặt trăng theo trạng thái
- Màn hình dưới 32rem: ẩn tên thương hiệu và chữ trên nút, chỉ còn icon

### Nền trang

Thêm hai vùng sáng tỏa (`radial-gradient`) ở góc trên trái và phải qua
`body::before`, tạo chiều sâu thay vì một mảng màu phẳng.

Đặt `z-index: -1` và `pointer-events: none` nên không cản thao tác.

### Vùng thả ảnh

Đây là phần thay đổi nhiều nhất:

- Nền chuyển sắc thay vì trong suốt
- Icon mũi tên tải lên trong vòng tròn, nhấc lên khi hover
- Dòng gợi ý định dạng và giới hạn dung lượng
- Nút "Chọn ảnh từ máy" giờ là nút thật, nền màu chủ đạo
- **Khi kéo file vào:** viền chuyển liền nét, khối phóng nhẹ, có nhịp đập,
  và một quầng sáng hình nón quay quanh

### Thẻ xe

- Hover: nhấc lên 3px, viền sáng, đổ bóng
- Vạch màu dọc bên trái trượt ra khi hover
- Nhãn thông số viết hoa, giãn chữ nhẹ cho dễ quét
- Điểm phù hợp thành huy hiệu bo tròn có nền

### Trạng thái tải

Thay dòng chữ "Đang tải..." bằng **skeleton**: trang danh mục hiện 6 ô xám
đúng kích thước thẻ thật, trang nhận diện hiện các dòng giả.

Người dùng thấy ngay bố cục sắp có gì thay vì nhìn màn hình trống.

---

## 6. Khả năng tiếp cận

**Tôn trọng `prefers-reduced-motion`.** Người bật tùy chọn giảm chuyển động
trong hệ điều hành sẽ thấy mọi animation rút còn 0.01ms — giao diện vẫn
đầy đủ, chỉ không chuyển động. Đây là quy tắc bắt buộc: animation gây khó
chịu thật với người nhạy cảm tiền đình.

**Viền focus rõ hơn:** `outline-offset` tăng lên 3px và có bo góc.

**Màu không phải tín hiệu duy nhất.** Thanh xác suất đổi màu theo mức nhưng
luôn kèm số phần trăm.

**Mọi icon trang trí đều có `aria-hidden="true"`** để trình đọc màn hình bỏ
qua, không đọc thừa.

**Link "Bỏ qua điều hướng"** giờ hiện ra rõ ràng khi nhấn Tab — trước đây
nó chỉ đổi `position` mà không có nền, khó nhìn.

---

## 7. Kiểm chứng

| Việc | Kết quả |
| :--- | :--- |
| Build development | Thành công |
| Build production | Thành công, không cảnh báo budget |
| Kiểm thử | **50/50 pass** — không test nào vỡ |

Test `app.spec.ts` kiểm tra nhãn ba tab điều hướng vẫn pass dù template đã
bọc thêm `<span>`, vì `textContent` không đổi.

---

## 8. Việc còn lại

- [ ] Xem lại trên màn hình thật ở chủ đề sáng (đã kiểm tra kỹ chủ đề tối)
- [ ] Đo tương phản màu bằng công cụ để xác nhận đạt WCAG 2.2 AA
- [ ] Áp hệ này cho trang Tư vấn khi làm xong
