import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CountUpDirective } from '../../core/count-up.directive';
import { ContactFormComponent } from './contact-form.component';
import { HeroComponent } from './hero.component';
import { SlideDeckDirective } from './slide-deck.directive';

interface Feature {
  icon: string;
  title: string;
  description: string;
  link: string;
  linkLabel: string;
}

/** Ba chuc nang chinh, moi cai dan sang mot trang cong cu. */
const FEATURES: Feature[] = [
  {
    icon: 'camera',
    title: 'Nhận diện từ ảnh',
    description:
      'Tải ảnh lên, hệ thống khoanh vùng từng chiếc xe rồi cho biết đó là dòng nào kèm độ tin cậy.',
    link: '/nhan-dien',
    linkLabel: 'Thử nhận diện',
  },
  {
    icon: 'compass',
    title: 'Tư vấn theo nhu cầu',
    description:
      'Cho biết ngân sách, số chỗ và kiểu dáng. Kết quả chỉ gồm xe thỏa mãn đủ điều kiện.',
    link: '/tu-van',
    linkLabel: 'Nhận gợi ý',
  },
  {
    icon: 'grid',
    title: 'Tra cứu danh mục',
    description:
      'Toàn bộ 216 dòng xe với giá, mức tiêu hao, số chỗ và phân khúc.',
    link: '/danh-muc',
    linkLabel: 'Mở danh mục',
  },
];

interface Step {
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Khoanh vùng xe',
    description:
      'YOLOv8n tìm vị trí từng chiếc xe trong ảnh và cắt riêng ra. Không tìm thấy xe nào thì phân loại toàn bộ bức ảnh.',
  },
  {
    number: '02',
    title: 'Phân loại song song',
    description:
      'Hai mô hình cùng chạy: một cho 196 dòng xe quốc tế, một cho 20 dòng xe Việt Nam. Kết quả đáng tin hơn được chọn.',
  },
  {
    number: '03',
    title: 'Trả về thông số',
    description:
      'Ghép kết quả với bảng thông số để trả về giá, mức tiêu hao, số chỗ cùng danh sách xe tương tự.',
  },
];

/** Nhan cho cac cham chi bao slide o canh phai. */
const SLIDE_LABELS = [
  'Giới thiệu',
  'Về hệ thống',
  'Cách hoạt động',
  'Tính năng',
  'Liên hệ',
];

/** Trang chu dang trinh chieu - moi phan chiem tron man hinh. */
@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    HeroComponent,
    ContactFormComponent,
    SlideDeckDirective,
    CountUpDirective,
  ],
  template: `
    <nav class="slide-nav" aria-label="Các phần của trang">
      @for (label of slideLabels; track label; let i = $index) {
        <a
          class="slide-dot"
          [href]="'#slide-' + i"
          [attr.aria-label]="label"
          [title]="label">
          <span class="dot-line" aria-hidden="true"></span>
        </a>
      }
    </nav>

    <div class="deck" appSlideDeck>
      <!-- 1. Hero -->
      <section class="slide" id="slide-0">
        <div class="slide-inner">
          <app-hero />
        </div>
      </section>

      <!-- 2. Gioi thieu -->
      <section class="slide" id="slide-1">
        <div class="slide-inner narrow">
          <p class="eyebrow">Về hệ thống</p>
          <h2>Nhận diện xe không cần biết gì về xe</h2>
          <p class="body">
            PVehicle-AI được xây để trả lời một câu hỏi đơn giản: chiếc xe
            trong ảnh này là xe gì. Toàn bộ mô hình chạy bằng ONNX Runtime
            trên CPU, không cần card đồ họa.
          </p>

          <dl class="metrics">
            <div>
              <dd>
                <span appCountUp [countTo]="83" [decimals]="0">83</span>%
              </dd>
              <dt>Top-1 xe quốc tế</dt>
            </div>
            <div>
              <dd>
                <span appCountUp [countTo]="95.3" [decimals]="1">95,3</span>%
              </dd>
              <dt>Top-5 xe quốc tế</dt>
            </div>
            <div>
              <dd>
                <span appCountUp [countTo]="216" [decimals]="0">216</span>
              </dd>
              <dt>Dòng xe trong danh mục</dt>
            </div>
          </dl>
        </div>
      </section>

      <!-- 3. Cach hoat dong -->
      <section class="slide alt" id="slide-2">
        <div class="slide-inner">
          <p class="eyebrow">Cách hoạt động</p>
          <h2>Ba bước, khoảng 135 mili giây</h2>

          <ol class="steps">
            @for (step of steps; track step.number) {
              <li class="step">
                <span class="step-number" aria-hidden="true">
                  {{ step.number }}
                </span>
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
              </li>
            }
          </ol>
        </div>
      </section>

      <!-- 4. Tinh nang -->
      <section class="slide" id="slide-3">
        <div class="slide-inner">
          <p class="eyebrow">Tính năng</p>
          <h2>Ba công cụ, một bảng dữ liệu</h2>

          <div class="features">
            @for (feature of features; track feature.title) {
              <article class="feature">
                <span class="feature-icon" aria-hidden="true">
                  @switch (feature.icon) {
                    @case ('camera') {
                      <svg viewBox="0 0 24 24" width="22" height="22">
                        <path
                          fill="none" stroke="currentColor" stroke-width="1.6"
                          stroke-linejoin="round"
                          d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
                        <circle
                          cx="12" cy="13" r="3.4"
                          fill="none" stroke="currentColor"
                          stroke-width="1.6" />
                      </svg>
                    }
                    @case ('compass') {
                      <svg viewBox="0 0 24 24" width="22" height="22">
                        <circle
                          cx="12" cy="12" r="8.4"
                          fill="none" stroke="currentColor"
                          stroke-width="1.6" />
                        <path
                          fill="currentColor"
                          d="m15 9-2.2 4.8L8 16l2.2-4.8L15 9Z" />
                      </svg>
                    }
                    @default {
                      <svg viewBox="0 0 24 24" width="22" height="22">
                        <g fill="none" stroke="currentColor" stroke-width="1.6">
                          <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" />
                          <rect
                            x="13.5" y="4" width="6.5" height="6.5" rx="1.4" />
                          <rect
                            x="4" y="13.5" width="6.5" height="6.5" rx="1.4" />
                          <rect
                            x="13.5" y="13.5" width="6.5" height="6.5"
                            rx="1.4" />
                        </g>
                      </svg>
                    }
                  }
                </span>

                <h3>{{ feature.title }}</h3>
                <p>{{ feature.description }}</p>

                <a class="feature-link" [routerLink]="feature.link">
                  {{ feature.linkLabel }}
                  <span aria-hidden="true">→</span>
                </a>
              </article>
            }
          </div>
        </div>
      </section>

      <!-- 5. Lien he -->
      <section class="slide alt" id="slide-4">
        <div class="slide-inner narrow">
          <p class="eyebrow">Liên hệ</p>
          <h2>Có câu hỏi hoặc góp ý?</h2>
          <p class="body">
            Hệ thống vẫn đang được hoàn thiện. Nếu bạn thấy kết quả nhận
            diện chưa đúng, hãy cho chúng tôi biết.
          </p>

          <app-contact-form />

          <p class="footnote">
            Giá và mức tiêu hao của xe quốc tế là số liệu mô phỏng, không
            phải giá thị trường.
          </p>
        </div>
      </section>
    </div>
  `,
  styles: `
    // --- Cham chi bao slide ----------------------------------------------

    .slide-nav {
      position: fixed;
      top: 50%;
      right: 1.25rem;
      z-index: 15;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transform: translateY(-50%);
    }

    .slide-dot {
      display: grid;
      place-items: center;
      width: 1.5rem;
      height: 1.5rem;
    }

    .dot-line {
      width: 1.5rem;
      height: 2px;
      border-radius: 2px;
      background: var(--mat-sys-outline-variant);
      transform-origin: right;
      transform: scaleX(0.55);
      transition:
        transform var(--app-duration) var(--app-spring),
        background-color var(--app-duration) var(--app-ease);
    }

    .slide-dot:hover .dot-line {
      background: var(--mat-sys-primary);
      transform: scaleX(1);
    }

    // --- Bo cuc slide -----------------------------------------------------

    .slide {
      display: grid;
      place-items: center;
      padding: 4rem 1.25rem;
    }

    // Chi ep chieu cao khi che do trinh chieu bat - man hinh thap thi thoi.
    .deck-active .slide {
      min-height: 100vh;
      min-height: 100dvh;
    }

    .slide.alt {
      background: var(--mat-sys-surface-container-low);
      border-block: 1px solid var(--mat-sys-outline-variant);
    }

    // Slide dau khong can dem tren vi Hero da tu can giua.
    #slide-0 {
      padding: 0;
    }

    .slide-inner {
      width: 100%;
      max-width: 68rem;
    }

    .slide-inner.narrow {
      max-width: 46rem;
    }

    // --- Chu chung --------------------------------------------------------

    .eyebrow {
      margin: 0 0 0.6rem;
      color: var(--mat-sys-primary);
      font: var(--mat-sys-label-large);
      font-weight: 650;
      text-transform: uppercase;
      letter-spacing: 0.09em;
    }

    h2 {
      margin: 0 0 1.5rem;
      font-size: clamp(1.75rem, 4vw, 2.75rem);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.025em;
    }

    .body {
      margin: 0 0 1.5rem;
      color: var(--mat-sys-on-surface-variant);
      font-size: 1.05rem;
      line-height: 1.75;
    }

    .footnote {
      margin: 1.5rem 0 0;
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
      text-align: center;
    }

    // --- So lieu ----------------------------------------------------------

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
      gap: 1.5rem;
      margin: 2.5rem 0 0;
      padding-top: 2rem;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    .metrics div {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .metrics dd {
      margin: 0;
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 750;
      letter-spacing: -0.03em;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .metrics dt {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-label-medium);
    }

    // --- Cac buoc ---------------------------------------------------------

    .steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
      gap: 1.5rem;
      margin: 2rem 0 0;
      padding: 0;
      list-style: none;
    }

    .step {
      padding-top: 1.25rem;
      border-top: 2px solid var(--mat-sys-outline-variant);
      transition: border-color var(--app-duration) var(--app-ease);
    }

    .step:hover {
      border-top-color: var(--mat-sys-primary);
    }

    .step-number {
      display: block;
      margin-bottom: 0.6rem;
      color: var(--mat-sys-primary);
      font-size: 1.75rem;
      font-weight: 750;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }

    .step h3 {
      margin: 0 0 0.5rem;
      font: var(--mat-sys-title-small);
      font-weight: 650;
    }

    .step p {
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
      line-height: 1.7;
    }

    // --- Tinh nang --------------------------------------------------------

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
      gap: 1.25rem;
      margin-top: 2rem;
    }

    .feature {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      padding: 1.75rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--app-radius-lg);
      background: var(--mat-sys-surface-container-low);
      transition:
        transform var(--app-duration) var(--app-spring),
        border-color var(--app-duration) var(--app-ease),
        box-shadow var(--app-duration) var(--app-ease);
    }

    .feature:hover {
      transform: translateY(-6px) scale(1.02);
      border-color: color-mix(in srgb, var(--mat-sys-primary) 50%, transparent);
      box-shadow: var(--app-shadow-lg);
    }

    .feature-icon {
      display: grid;
      place-items: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: var(--app-radius-md);
      background: color-mix(in srgb, var(--mat-sys-primary) 14%, transparent);
      color: var(--mat-sys-primary);
      transition: transform var(--app-duration) var(--app-spring);
    }

    .feature:hover .feature-icon {
      transform: scale(1.12) rotate(-8deg);
    }

    .feature h3 {
      margin: 0;
      font: var(--mat-sys-title-medium);
      font-weight: 650;
    }

    .feature p {
      flex: 1;
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
      line-height: 1.7;
    }

    .feature-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      margin-top: 0.5rem;
      color: var(--mat-sys-primary);
      font: var(--mat-sys-label-large);
      text-decoration: none;
    }

    .feature-link span {
      transition: transform var(--app-duration) var(--app-spring);
    }

    .feature:hover .feature-link span {
      transform: translateX(5px);
    }

    // Man hinh hep: an cham chi bao, noi dung da chiem het be ngang.
    @media (max-width: 48rem) {
      .slide-nav {
        display: none;
      }
    }

    @media (max-width: 32rem) {
      .slide {
        padding: 3rem 1rem;
      }
    }
  `,
})
export class HomePage {
  protected readonly features = FEATURES;
  protected readonly steps = STEPS;
  protected readonly slideLabels = SLIDE_LABELS;
}
