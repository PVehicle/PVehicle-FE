# Trang chủ (landing page dạng trình chiếu)

Trang giới thiệu ở `/`, mỗi phần chiếm trọn màn hình và tự bắt sang phần kế
khi cuộn — như một bộ slide. Kèm hiệu ứng chuyển trang cho toàn ứng dụng.

---

## 1. Các file đã thêm

```text
src/app/core/
├── gsap.ts                          # Đăng ký plugin một lần
├── page-transition.service.ts       # Chuyển trang (toàn app)
├── count-up.directive.ts            # Số đếm tăng dần
└── reveal-on-scroll.directive.ts    # Hiện dần khi cuộn (xem ghi chú)

src/app/core/
└── tilt.directive.ts                # Thẻ nghiêng theo con trỏ

src/app/features/home/
├── home.page.ts                     # 5 slide
├── slide-deck.directive.ts          # Biến các section thành slide
├── hero.component.ts                # Hero + text reveal + nền động
├── particle-field.component.ts      # Canvas hạt bay nối đường
├── pipeline-stage.component.ts      # Hoạt hình 3 bước xử lý
└── contact-form.component.ts        # Form liên hệ
```

Năm slide: **Hero → Về hệ thống → Cách hoạt động → Tính năng → Liên hệ**

> **Ghi chú về `reveal-on-scroll.directive.ts`:** trang chủ đã chuyển sang
> chế độ trình chiếu nên không dùng directive này nữa. Vẫn giữ lại vì ba
> trang công cụ không phải slide — chúng sẽ cần nó khi muốn nội dung hiện
> dần lúc cuộn.

---

## 2. Skill GSAP đã cài

Cài từ repo chính thức của GreenSock:
`https://github.com/greensock/gsap-skills`

Đã copy 8 skill vào `~/.claude/skills/`: `gsap-core`, `gsap-timeline`,
`gsap-scrolltrigger`, `gsap-frameworks`, `gsap-plugins`, `gsap-utils`,
`gsap-performance`, `gsap-react`.

> **Lưu ý:** skill được nạp lúc Claude Code khởi động. Phải khởi động lại
> Claude Code thì chúng mới xuất hiện trong danh sách skill.

Cách cài chính thức khác (gõ trong Claude Code):

```
/plugin marketplace add greensock/gsap-skills
```

### GSAP giờ miễn phí toàn bộ

Sau khi Webflow mua lại GSAP, **mọi plugin trước đây thuộc Club GSAP đều
miễn phí**, kể cả dùng thương mại. `SplitText` (dùng cho text reveal) nằm
sẵn trong package `gsap` công khai — không cần `.npmrc`, token hay
registry riêng.

Đã xác nhận: `node_modules/gsap/SplitText.js` và `ScrollTrigger.js` có sẵn
kèm TypeScript types.

---

## 3. Nguyên tắc dùng GSAP trong Angular

Skill `gsap-frameworks` không có mục Angular riêng (chỉ có Vue, Svelte,
React), nhưng nguyên tắc chung áp thẳng được: **tạo lúc mounted, revert lúc
destroyed**.

### 3.1. `gsap.context()` + `DestroyRef`

```typescript
const ctx = gsap.context(() => {
  // Mọi tween và ScrollTrigger tạo ở đây đều được theo dõi.
}, rootElement);          // ← scope: selector chỉ tìm trong subtree này

this.destroyRef.onDestroy(() => ctx.revert());
```

Hai điều `context` giải quyết:

- **Scope selector** — `.card` chỉ khớp trong component này, không đụng
  phần còn lại của trang. Skill nói rõ đây là lỗi hay gặp.
- **Dọn một lần** — `revert()` hủy cả tween lẫn ScrollTrigger và trả lại
  style gốc. Thiếu bước này thì ScrollTrigger chạy trên DOM đã gỡ, gây rò
  rỉ bộ nhớ.

### 3.2. `registerPlugin` gọi một lần

[`core/gsap.ts`](../src/app/core/gsap.ts) bọc `registerPlugin` trong một cờ
`registered`, nên gọi bao nhiêu lần cũng chỉ đăng ký một lượt.

### 3.3. `gsap.matchMedia()` cho reduced-motion

Thay vì tự đọc `matchMedia` rồi rẽ nhánh, dùng API sẵn có của GSAP:

```typescript
mm.add('(prefers-reduced-motion: reduce)', () => {
  gsap.set(element, { opacity: 1 });   // hiện ngay, không chuyển động
});

mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.from(targets, { opacity: 0, y: 28, scrollTrigger: {...} });
});
```

GSAP tự chọn nhánh đúng và tự dọn khi điều kiện đổi.

### 3.4. `SplitText` phải `revert()`

`SplitText` chèn thêm thẻ `div` để tách dòng. Không hoàn nguyên thì DOM giữ
lại các thẻ đó và **trình đọc màn hình đọc sai** — mỗi dòng thành một khối
riêng thay vì một câu liền mạch.

Callback của `mm.add()` trả về hàm dọn, GSAP gọi khi context bị revert:

```typescript
return () => split.revert();
```

---

## 4. Hiệu ứng đã làm

| Vị trí | Hiệu ứng |
| :--- | :--- |
| Hero — tiêu đề | `SplitText` tách dòng, mỗi dòng trôi lên từ khung cắt |
| Hero — các phần còn lại | Timeline nối tiếp: badge → tiêu đề → mô tả → nút → số liệu |
| Hero — nền | Hai khối sáng trôi chậm ngược hướng, lặp vô hạn |
| Hero — gợi ý cuộn | Con lăn chuột nhấp nháy đi xuống |
| Mỗi slide | Nội dung trôi lên khi vào, mờ dần khi bị cuộn qua |
| Cuộn giữa slide | `snap` — tự bắt sang slide gần nhất khi dừng cuộn |
| Số liệu | `appCountUp` — đếm tăng dần từ 0 tới giá trị thật |
| Thẻ tính năng | Hover: nhấc lên 6px, phóng 2%, icon xoay, mũi tên trượt |
| Chuyển trang | Ba lớp màn che lệch pha, cạnh chéo, trang mới trôi lên |
| Hero — nền | Canvas hạt bay nối nhau, hút theo con trỏ chuột |
| Hero — xe | SVG xe chạy ngang, bánh quay, vạch tốc độ lướt |
| Cách hoạt động | Hoạt hình SVG 3 bước, chạy theo tay cuộn |
| Thẻ tính năng | Nghiêng 3D theo vị trí con trỏ |

### Hoạt hình 3 bước xử lý

`pipeline-stage.component.ts` diễn lại toàn bộ quy trình bằng SVG:

1. Tia quét chạy dọc bức ảnh, khung bao vẽ dần quanh xe kèm nhãn `car 0.62`
2. Hai hộp mô hình trượt vào từ hai bên, viền sáng lên lần lượt
3. Khung bao mờ đi, thẻ kết quả hiện lên với tên xe và thông số

Timeline gắn `scrub: 0.8` nên **chạy theo tay cuộn** — kéo lên kéo xuống
đều xem lại được từng bước, không phải hoạt hình tự phát rồi thôi.

### Canvas hạt bay

`particle-field.component.ts` vẽ bằng canvas 2D chứ không phải DOM: một
trăm phần tử DOM chuyển động liên tục buộc trình duyệt tính lại bố cục mỗi
khung hình, còn canvas chỉ là một thẻ.

Chi tiết đáng lưu ý:

- **Mật độ theo diện tích** — số hạt tính từ `width × height`, giới hạn 90
  hạt để không làm nóng máy trên màn hình lớn
- **`devicePixelRatio` chặn ở 2** — màn 3x trở lên vẽ rất tốn mà mắt thường
  gần như không phân biệt được
- **Dừng hẳn khi tab bị ẩn** (`visibilitychange`) — không đốt pin ở tab nền
- **Con trỏ hút hạt** trong bán kính 170px, tạo cảm giác dàn hạt phản ứng

### Nghiêng thẻ theo con trỏ

`tilt.directive.ts` dùng `gsap.quickTo()` thay vì `gsap.to()` — hàm này tạo
sẵn tween và chỉ cập nhật giá trị đích, phù hợp cho sự kiện bắn liên tục
như `pointermove`.

Điều kiện bật: `(hover: hover) and (pointer: fine)` — màn hình cảm ứng
không có hover nên hiệu ứng vô nghĩa ở đó.

### Chế độ trình chiếu

`slide-deck.directive.ts` biến 5 section thành slide chiếm trọn màn hình:

```typescript
snap: {
  snapTo: 1 / (slides.length - 1),   // 5 slide → mốc 0, .25, .5, .75, 1
  duration: { min: 0.25, max: 0.6 },
  delay: 0.08,
  ease: 'power2.inOut',
}
```

**Chỉ bật khi màn hình đủ cao** (`min-height: 34.01rem`) và người dùng
không yêu cầu giảm chuyển động. Màn hình thấp mà ép `100vh` thì nội dung
bị cắt — lúc đó directive gỡ lớp `deck-active` và trang về cuộn thường.

Dùng `100dvh` bên cạnh `100vh` để trên mobile không bị thanh địa chỉ của
trình duyệt che mất.

Chấm chỉ báo ở cạnh phải ẩn dưới 48rem — màn hình hẹp thì nội dung đã
chiếm hết bề ngang.

### `toggleActions: 'play none none reverse'`

Chạy khi cuộn tới, **lùi lại khi cuộn ngược lên** — quay lại vẫn thấy hiệu
ứng thay vì nội dung đứng im.

Skill cảnh báo: không dùng `scrub` chung với `toggleActions` trên cùng một
trigger.

---

## 5. Form liên hệ dùng `mailto:`

**Backend không có endpoint nhận góp ý** — spec chỉ có 8 endpoint về nhận
diện và tra cứu xe.

Nên form mở sẵn ứng dụng thư của người dùng với nội dung đã điền, thay vì
gửi lên máy chủ.

**Vì sao không hiện "đã gửi thành công":** làm vậy là hứa hẹn sai — người
dùng sẽ chờ hồi âm không bao giờ đến. Giao diện nói rõ nút sẽ mở ứng dụng
thư, và nếu không mở được thì hiện địa chỉ email để gửi tay.

Khi backend có endpoint thật, chỉ cần thay phần `onSubmit()`.

---

## 6. Ảnh hưởng tới các trang khác

Chuyển trang là tính năng **toàn app**, nên `PageTransitionService` chạy ở
tầng `App`. Nếu import GSAP tĩnh ở đó, cả thư viện bị kéo vào bundle đầu
vào — đo được **+44 kB nén** (83,5 → 127,7 kB).

Cách xử lý: **nạp GSAP động** sau khi ứng dụng đã hiển thị.

```typescript
private async loadGsap(): Promise<void> {
  const module = await import('./gsap');
  module.registerGsap();
  this.gsapModule = module;
}
```

Đánh đổi: **lần chuyển trang đầu tiên có thể chưa có hiệu ứng** nếu người
dùng bấm ngay khi trang vừa tải. Các lần sau đầy đủ. Đổi lại lần hiển thị
đầu không bị chậm — đây là thứ người dùng cảm nhận rõ hơn.

Kết quả đo được:

| Chunk | Kích thước (nén) |
| :--- | ---: |
| Initial | **84,0 kB** — bằng mức trước khi thêm chuyển trang |
| `gsap` (chunk riêng) | 43,5 kB |
| `home-page` | 6,9 kB |
| `recognition-page` | 7,0 kB |
| `catalog-page` | 3,5 kB |

Người dùng không vào trang chủ vẫn tải GSAP (vì chuyển trang cần nó), nhưng
tải **sau** khi trang đã hiện, không chặn.

### Thay đổi điều hướng

- `/` giờ là trang chủ, **không còn redirect** sang `/nhan-dien`
- Thêm mục "Trang chủ" vào đầu thanh điều hướng
- Logo dẫn về `/`
- Route `**` giờ về `/` thay vì `/nhan-dien`

Mục "Trang chủ" dùng `[routerLinkActiveOptions]="{ exact: true }"` — không
có nó thì mục này luôn sáng, vì `/` khớp tiền tố mọi đường dẫn.

---

## 7. Kiểm chứng

| Việc | Kết quả |
| :--- | :--- |
| Build development | Thành công |
| Build production | Thành công, không cảnh báo budget |
| Kiểm thử | **53/53 pass** (trước: 50) |
| Nội dung trong bundle | 5 slide, particle field, pipeline, tilt đều trong `home-page` |
| GSAP trong bundle | Tách thành lazy chunk `gsap` riêng |
| Initial không phình | **84,1 kB** — thêm nhiều hiệu ứng vẫn không đổi |

Test đã thêm/sửa:

- `contact-form.component.spec.ts` — 3 test: nút bị vô hiệu khi thiếu
  trường, bật khi đủ, coi khoảng trắng là chưa điền
- `app.spec.ts` — cập nhật từ 3 lên 4 mục điều hướng

### Lỗi đã gặp: `matchMedia` trong jsdom

`PageTransitionService.init()` gọi thẳng `view.matchMedia(...)` làm 2 test
vỡ với `TypeError: view?.matchMedia is not a function`.

Đây là **lỗi thật trong code**, không phải lỗi test — jsdom không cài đặt
API này, và môi trường không phải trình duyệt cũng vậy. Đã thêm kiểm tra
`typeof view?.matchMedia === 'function'` trước khi gọi.

Cùng loại lỗi đã gặp ở `app.ts` trước đây — cần nhớ khi viết code chạm vào
API trình duyệt.

---

## 8. Việc còn lại

- [ ] Xem trên màn hình thật, cả chủ đề sáng và tối
- [ ] Bật "giảm chuyển động" trong hệ điều hành để kiểm tra nhánh reduced
- [ ] Thay `mailto:` bằng endpoint thật khi backend có
- [ ] Cân nhắc ảnh minh họa cho Hero (hiện chỉ có chữ và nền động)
- [ ] Thử trên mobile thật: `snap` có thể khó chịu trên màn hình cảm ứng
- [ ] Làm chấm chỉ báo sáng theo slide đang xem (hiện chỉ sáng khi hover)
