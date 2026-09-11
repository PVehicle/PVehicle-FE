import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  inject,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { SplitText, gsap, registerGsap } from '../../core/gsap';
import { ParticleFieldComponent } from './particle-field.component';

/**
 * Phan mo dau cua trang chu.
 *
 * Tieu de hien ra tung dong bang SplitText, nen co cac khoi sang troi nhe.
 */
@Component({
  selector: 'app-hero',
  imports: [RouterLink, ParticleFieldComponent],
  template: `
    <section #root class="hero">
      <div class="bg" aria-hidden="true">
        <span class="orb orb-1"></span>
        <span class="orb orb-2"></span>
        <span class="orb orb-3"></span>
        <span class="grid-lines"></span>
        <app-particle-field />

        <!-- Xe chay ngang o duoi, ve bang SVG de net o moi do phan giai -->
        <svg class="car-track" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <g class="car">
            <path
              class="car-body"
              d="M18 74h104v-13l-9-22a13 13 0 0 0-12-8H51a13 13 0 0 0-12 8l-9 22v13Z" />
            <path class="car-glass" d="M46 52h48l7 17H39l7-17Z" />
            <circle class="car-wheel" cx="42" cy="80" r="9" />
            <circle class="car-wheel" cx="98" cy="80" r="9" />
          </g>
          <g class="speed-lines">
            <line x1="0" y1="46" x2="70" y2="46" />
            <line x1="0" y1="62" x2="110" y2="62" />
            <line x1="0" y1="78" x2="55" y2="78" />
          </g>
        </svg>
      </div>

      <div class="content">
        <p #badge class="badge">
          <span class="dot" aria-hidden="true"></span>
          Nhận diện 216 dòng xe bằng AI
        </p>

        <h1 #title class="title">
          Chụp một tấm ảnh,<br />
          biết ngay <span class="app-gradient-text">đó là xe gì</span>
        </h1>

        <p #lede class="lede">
          Tải ảnh ô tô lên và nhận về dòng xe, thông số kỹ thuật cùng những
          mẫu tương tự. Hai mô hình chạy song song cho kết quả trong khoảng
          135 mili giây.
        </p>

        <div #actions class="actions">
          <a routerLink="/nhan-dien" class="app-btn app-btn--primary btn-lg">
            <span>Nhận diện xe ngay</span>
            <span class="btn-arrow" aria-hidden="true">→</span>
          </a>
          <a routerLink="/danh-muc" class="app-btn app-btn--ghost btn-lg">
            Xem danh mục
          </a>
        </div>

        <dl #stats class="stats">
          <div>
            <dt>Độ chính xác Top-5</dt>
            <dd>95,3%</dd>
          </div>
          <div>
            <dt>Dòng xe</dt>
            <dd>216</dd>
          </div>
          <div>
            <dt>Thời gian xử lý</dt>
            <dd>~135ms</dd>
          </div>
        </dl>
      </div>

      <span #scrollHint class="scroll-hint" aria-hidden="true">
        <span class="mouse"><span class="wheel"></span></span>
      </span>
    </section>
  `,
  styles: `
    .hero {
      position: relative;
      display: grid;
      place-items: center;
      min-height: min(88vh, 46rem);
      padding: 4rem 1.25rem 5rem;
      overflow: hidden;
      text-align: center;
    }

    // --- Nen chuyen dong ------------------------------------------------

    .bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.85;
    }

    .orb-1 {
      top: -18%;
      left: -6%;
      width: 38rem;
      height: 38rem;
      background: color-mix(in srgb, var(--mat-sys-primary) 60%, transparent);
    }

    .orb-2 {
      right: -10%;
      top: 10%;
      width: 32rem;
      height: 32rem;
      background: color-mix(in srgb, var(--mat-sys-tertiary) 52%, transparent);
    }

    // Khoi thu ba o duoi giup phan chan trang khong bi toi hoan toan.
    .orb-3 {
      left: 30%;
      bottom: -22%;
      width: 34rem;
      height: 34rem;
      background: color-mix(in srgb, var(--mat-sys-primary) 38%, transparent);
    }

    // Luoi mo dan ve phia duoi, tao cam giac chieu sau.
    .grid-lines {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(
          to right,
          color-mix(in srgb, var(--mat-sys-on-surface) 6%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          to bottom,
          color-mix(in srgb, var(--mat-sys-on-surface) 6%, transparent) 1px,
          transparent 1px
        );
      background-size: 4rem 4rem;
      opacity: 1.6;
      mask-image: radial-gradient(ellipse 65% 55% at 50% 42%, #000, transparent);
    }

    // Mau hat, doc bang getComputedStyle trong component canvas.
    app-particle-field {
      --particle-color: color-mix(
        in srgb,
        var(--mat-sys-primary) 75%,
        var(--mat-sys-on-surface)
      );
    }

    // --- Noi dung --------------------------------------------------------

    .content {
      position: relative;
      max-width: 52rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 1.5rem;
      padding: 0.4rem 1rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--app-radius-pill);
      background: color-mix(in srgb, var(--mat-sys-surface) 60%, transparent);
      backdrop-filter: blur(8px);
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-label-large);
    }

    .dot {
      width: 0.45rem;
      height: 0.45rem;
      border-radius: 50%;
      background: var(--mat-sys-primary);
      animation: hero-blink 2s ease-in-out infinite;
    }

    @keyframes hero-blink {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.3;
      }
    }

    .title {
      margin: 0 0 1.25rem;
      font-family: var(--app-font-display);
      font-size: clamp(2.35rem, 6.5vw, 4.5rem);
      line-height: 1.06;
      font-weight: 700;
      letter-spacing: -0.035em;
    }


    // --- Noi dung --------------------------------------------------------

    .content {
      position: relative;
      max-width: 52rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 1.5rem;
      padding: 0.4rem 1rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--app-radius-pill);
      background: color-mix(in srgb, var(--mat-sys-surface) 60%, transparent);
      backdrop-filter: blur(8px);
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-label-large);
    }

    .dot {
      width: 0.45rem;
      height: 0.45rem;
      border-radius: 50%;
      background: var(--mat-sys-primary);
      animation: hero-blink 2s ease-in-out infinite;
    }

    @keyframes hero-blink {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.3;
      }
    }

    .title {
      margin: 0 0 1.25rem;
      font-family: var(--app-font-display);
      font-size: clamp(2.35rem, 6.5vw, 4.5rem);
      line-height: 1.06;
      font-weight: 700;
      letter-spacing: -0.035em;
    }

    // SplitText cat chu thanh nhieu the; phai cho phep chu tran ra ngoai
    // khung dong, neu khong phan duoi cua chu bi cat mat.
    .title .app-gradient-text {
      display: inline-block;
      padding-bottom: 0.06em;
    }

    // SplitText boc tung ky tu vao mot the rieng, khien
    // background-clip: text tren the cha khong con chu nao de cat - ket
    // qua la mot khoi mau dac, chu bien mat. Phai cho chinh cac the ky tu
    // mang chuyen sac. Class nay do charsClass khai bao, SplitText
    // khong tu them neu khong noi ro.
    .title .app-gradient-text .hero-char {
      background-image: inherit;
      background-size: inherit;
      background-position: inherit;
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
    }

    .lede {
      max-width: 40rem;
      margin: 0 auto 2rem;
      color: var(--mat-sys-on-surface-variant);
      font-size: clamp(1rem, 2vw, 1.15rem);
      line-height: 1.7;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 3rem;
    }

    .btn-lg {
      padding: 0.85rem 1.85rem;
      font-family: var(--app-font-display);
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
    }

    .btn-arrow {
      transition: transform var(--app-duration) var(--app-spring);
    }

    .btn-lg:hover .btn-arrow {
      transform: translateX(5px);
    }

    // --- So lieu ---------------------------------------------------------

    .stats {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 2.5rem;
      margin: 0;
    }

    .stats div {
      display: flex;
      flex-direction: column-reverse;
      gap: 0.2rem;
    }

    .stats dt {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-label-medium);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stats dd {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }

    // --- Goi y cuon xuong -------------------------------------------------

    .scroll-hint {
      position: absolute;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
    }

    .mouse {
      display: block;
      width: 1.4rem;
      height: 2.2rem;
      border: 2px solid var(--mat-sys-outline);
      border-radius: var(--app-radius-pill);
    }

    .wheel {
      display: block;
      width: 3px;
      height: 0.5rem;
      margin: 0.35rem auto 0;
      border-radius: 2px;
      background: var(--mat-sys-on-surface-variant);
      animation: hero-wheel 1.8s ease-in-out infinite;
    }

    @keyframes hero-wheel {
      0% {
        opacity: 0;
        transform: translateY(0);
      }
      35% {
        opacity: 1;
      }
      70%,
      100% {
        opacity: 0;
        transform: translateY(0.55rem);
      }
    }

    @media (max-width: 30rem) {
      .stats {
        gap: 1.5rem;
      }

      .stats dd {
        font-size: 1.35rem;
      }
    }
  `,
})
export class HeroComponent implements OnInit {
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly title = viewChild.required<ElementRef<HTMLElement>>('title');

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    registerGsap();

    // `gsap.context` gioi han selector trong subtree cua component va theo
    // doi moi tween tao ra ben trong de `revert()` don sach mot lan.
    const ctx = gsap.context(() => {
      // `matchMedia` cho phep khai bao rieng nhanh giam chuyen dong -
      // GSAP tu chon nhanh dung theo cai dat he dieu hanh.
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        // Chi hien ra, khong chuyen dong.
        gsap.set('.badge, .title, .lede, .actions, .stats', { opacity: 1 });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Tach tieu de thanh dong VA ky tu: dong de cat khung, ky tu de
        // hien lan luot tao cam giac chu duoc go ra.
        const split = new SplitText(this.title().nativeElement, {
          type: 'lines,chars',
          linesClass: 'hero-line',
          charsClass: 'hero-char',
        });

        split.lines.forEach((line) => {
          gsap.set(line, { overflow: 'hidden' });
        });

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.from('.badge', {
          opacity: 0,
          y: 16,
          scale: 0.92,
          duration: 0.5,
          ease: 'back.out(1.8)',
        })
          // Tung ky tu bat len, hoi nghieng va xoay nhe theo truc X.
          .from(
            split.chars,
            {
              opacity: 0,
              yPercent: 130,
              rotateX: -75,
              duration: 0.85,
              stagger: { each: 0.018, from: 'start' },
            },
            '-=0.2',
          )
          .from('.lede', { opacity: 0, y: 20, duration: 0.7 }, '-=0.5')
          .from(
            '.actions .app-btn',
            { opacity: 0, y: 22, scale: 0.94, duration: 0.55, stagger: 0.1 },
            '-=0.45',
          )
          .from(
            '.stats div',
            { opacity: 0, y: 18, duration: 0.5, stagger: 0.1 },
            '-=0.3',
          )
          .from('.scroll-hint', { opacity: 0, duration: 0.6 }, '-=0.2');

        // Hai khoi sang troi cham theo huong nguoc nhau.
        gsap.to('.orb-1', {
          x: 60,
          y: 40,
          duration: 14,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
        gsap.to('.orb-2', {
          x: -50,
          y: -30,
          duration: 18,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });

        // Xe chay tu trai qua phai roi lap lai.
        gsap.fromTo(
          '.car',
          { x: -160 },
          {
            x: 1260,
            duration: 9,
            ease: 'none',
            repeat: -1,
            delay: 1.2,
            repeatDelay: 2.5,
          },
        );

        // Banh xe quay quanh tam cua chinh no.
        gsap.to('.car-wheel', {
          rotation: 360,
          transformOrigin: 'center',
          duration: 0.9,
          ease: 'none',
          repeat: -1,
        });

        // Vach toc do chay nhanh hon xe, tao cam giac gio luot.
        gsap.fromTo(
          '.speed-lines line',
          { x: -140, opacity: 0 },
          {
            x: 1240,
            opacity: 0.7,
            duration: 1.6,
            ease: 'power1.in',
            repeat: -1,
            stagger: 0.18,
            repeatDelay: 1.4,
          },
        );

        // Parallax: nen troi cham hon noi dung khi cuon xuong.
        gsap.to('.bg', {
          yPercent: 22,
          ease: 'none',
          scrollTrigger: {
            trigger: this.root().nativeElement,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });

        gsap.to('.content', {
          yPercent: -12,
          opacity: 0.3,
          ease: 'none',
          scrollTrigger: {
            trigger: this.root().nativeElement,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });

        // SplitText phai duoc hoan nguyen, neu khong DOM giu lai cac the
        // tach dong/ky tu va trinh doc man hinh se doc sai.
        return () => split.revert();
      });
    }, this.root().nativeElement);

    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
