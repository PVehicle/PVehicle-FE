# Trang chủ (landing page)

Trang giới thiệu ở `/`, dùng GSAP + ScrollTrigger cho hiệu ứng cuộn.

---

## 1. Các file đã thêm

```text
src/app/core/
├── gsap.ts                        # Đăng ký plugin một lần
└── reveal-on-scroll.directive.ts  # Directive hiện dần khi cuộn

src/app/features/home/
├── home.page.ts                   # Ghép 4 section
├── hero.component.ts              # Hero + text reveal + nền động
└── contact-form.component.ts      # Form liên hệ
```

Bố cục: **Hero → Giới thiệu → Cách hoạt động → Tính năng → Liên hệ → Footer**

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
| Mọi section | `appReveal` — fade-in + slide-up khi cuộn tới |
| Danh sách bước/thẻ | `revealChildren` — hiện lần lượt, cách nhau 0,12s |
| Thẻ tính năng | Hover: nhấc lên 5px, phóng 1.5%, icon xoay nhẹ, mũi tên trượt |

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

**Không có.** GSAP nằm gọn trong chunk `home-page` nhờ lazy loading:

| Chunk | Kích thước (nén) |
| :--- | ---: |
| Initial | 83,5 kB |
| `home-page` (có GSAP) | 49,8 kB |
| `recognition-page` | 7,0 kB |
| `catalog-page` | 3,5 kB |

Ba trang công cụ không tải GSAP.

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
| Nội dung trong bundle | Đã xác nhận 4 section nằm trong chunk `home-page` |
| GSAP trong bundle | ScrollTrigger nằm đúng chunk `home-page` |

Test đã thêm/sửa:

- `contact-form.component.spec.ts` — 3 test: nút bị vô hiệu khi thiếu
  trường, bật khi đủ, coi khoảng trắng là chưa điền
- `app.spec.ts` — cập nhật từ 3 lên 4 mục điều hướng

---

## 8. Việc còn lại

- [ ] Xem trên màn hình thật, cả chủ đề sáng và tối
- [ ] Bật "giảm chuyển động" trong hệ điều hành để kiểm tra nhánh reduced
- [ ] Thay `mailto:` bằng endpoint thật khi backend có
- [ ] Cân nhắc ảnh minh họa cho Hero (hiện chỉ có chữ và nền động)
