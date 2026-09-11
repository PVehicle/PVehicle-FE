import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  inject,
  viewChild,
} from '@angular/core';

import { gsap, registerGsap } from '../../core/gsap';

/**
 * Minh hoa ba buoc xu ly bang mot doan hoat hinh SVG.
 *
 * Timeline gan vao ScrollTrigger `scrub`, nen no chay theo tay cuon cua
 * nguoi dung thay vi tu phat - keo len keo xuong deu thay duoc tung buoc.
 */
@Component({
  selector: 'app-pipeline-stage',
  template: `
    <div #root class="stage">
      <svg viewBox="0 0 420 260" class="scene" aria-hidden="true">
        <!-- Khung anh -->
        <rect
          class="frame"
          x="20" y="20" width="380" height="220" rx="14"
          fill="none" stroke-width="2" />

        <!-- Chiec xe trong anh -->
        <g class="vehicle">
          <path
            class="v-body"
            d="M120 168h180v-26l-16-40a22 22 0 0 0-20-13h-88a22 22 0 0 0-20 13l-16 40v26Z" />
          <path class="v-glass" d="M168 122h84l12 30H156l12-30Z" />
          <circle class="v-wheel" cx="158" cy="180" r="15" />
          <circle class="v-wheel" cx="262" cy="180" r="15" />
        </g>

        <!-- Buoc 1: tia quet chay doc buc anh -->
        <rect class="scanline" x="20" y="20" width="380" height="3" />

        <!-- Buoc 1: khung bao ve dan quanh xe -->
        <rect
          class="bbox"
          x="108" y="104" width="204" height="94" rx="6"
          fill="none" stroke-width="3" />
        <text class="bbox-tag" x="112" y="98">car 0.62</text>

        <!-- Buoc 2: hai mo hinh chay song song -->
        <g class="models">
          <g class="model model-a">
            <rect x="44" y="60" width="118" height="34" rx="8" />
            <text x="103" y="82">196 dòng quốc tế</text>
          </g>
          <g class="model model-b">
            <rect x="258" y="60" width="118" height="34" rx="8" />
            <text x="317" y="82">20 dòng Việt Nam</text>
          </g>
        </g>

        <!-- Buoc 3: the ket qua -->
        <g class="result">
          <rect x="86" y="166" width="248" height="66" rx="12" />
          <text class="r-title" x="210" y="193">Honda Odyssey Minivan</text>
          <text class="r-meta" x="210" y="215">709 triệu · 7 chỗ · 10,0 L</text>
        </g>
      </svg>

      <!-- Nhan buoc, doi theo tien do cuon -->
      <ol class="labels">
        <li class="label label-1">
          <span class="num">01</span> Khoanh vùng xe
        </li>
        <li class="label label-2">
          <span class="num">02</span> Phân loại song song
        </li>
        <li class="label label-3">
          <span class="num">03</span> Trả về thông số
        </li>
      </ol>
    </div>
  `,
  styles: `
    .stage {
      display: grid;
      gap: 1.25rem;
    }

    .scene {
      width: 100%;
      max-width: 34rem;
      margin: 0 auto;
      overflow: visible;
    }

    .frame {
      stroke: var(--mat-sys-outline-variant);
    }

    // --- Chiec xe ---------------------------------------------------------

    .v-body {
      fill: color-mix(in srgb, var(--mat-sys-primary) 55%, transparent);
    }

    .v-glass {
      fill: var(--mat-sys-surface);
    }

    .v-wheel {
      fill: var(--mat-sys-on-surface);
    }

    // --- Buoc 1 -----------------------------------------------------------

    .scanline {
      fill: var(--mat-sys-primary);
      opacity: 0;
    }

    .bbox {
      stroke: var(--mat-sys-primary);
      stroke-dasharray: 600;
      stroke-dashoffset: 600;
    }

    .bbox-tag {
      fill: var(--mat-sys-primary);
      font-size: 13px;
      font-weight: 650;
      opacity: 0;
    }

    // --- Buoc 2 -----------------------------------------------------------

    .model rect {
      fill: var(--mat-sys-surface-container-high);
      stroke: var(--mat-sys-outline-variant);
    }

    .model text {
      fill: var(--mat-sys-on-surface);
      font-size: 12px;
      text-anchor: middle;
    }

    .models {
      opacity: 0;
    }

    // --- Buoc 3 -----------------------------------------------------------

    .result {
      opacity: 0;
    }

    .result rect {
      fill: var(--mat-sys-surface-container-high);
      stroke: var(--mat-sys-primary);
    }

    .r-title {
      fill: var(--mat-sys-on-surface);
      font-size: 15px;
      font-weight: 650;
      text-anchor: middle;
    }

    .r-meta {
      fill: var(--mat-sys-on-surface-variant);
      font-size: 12px;
      text-anchor: middle;
    }

    // --- Nhan buoc --------------------------------------------------------

    .labels {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .label {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.4rem 0.9rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--app-radius-pill);
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-label-medium);
      opacity: 0.4;
      transition:
        opacity var(--app-duration) var(--app-ease),
        border-color var(--app-duration) var(--app-ease),
        color var(--app-duration) var(--app-ease);
    }

    .label.on {
      opacity: 1;
      border-color: var(--mat-sys-primary);
      color: var(--mat-sys-on-surface);
    }

    .num {
      color: var(--mat-sys-primary);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class PipelineStageComponent implements OnInit {
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    registerGsap();

    const element = this.root().nativeElement;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        // Hien thang trang thai cuoi, khong dien hoat hinh.
        gsap.set('.bbox', { strokeDashoffset: 0 });
        gsap.set('.bbox-tag, .result', { opacity: 1 });
        element.querySelectorAll('.label').forEach((label) => {
          label.classList.add('on');
        });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const setStep = (step: number): void => {
          element.querySelectorAll('.label').forEach((label, index) => {
            label.classList.toggle('on', index === step);
          });
        };

        const tl = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: element,
            start: 'top 72%',
            end: 'bottom 42%',
            // `scrub` gan tien do timeline vao vi tri cuon.
            scrub: 0.8,
          },
        });

        // Buoc 1: tia quet chay xuong roi khung bao ve dan.
        tl.add(() => setStep(0))
          .fromTo(
            '.scanline',
            { y: 0, opacity: 0.9 },
            { y: 217, duration: 1.1, ease: 'none' },
          )
          .to('.scanline', { opacity: 0, duration: 0.2 }, '-=0.15')
          .to('.bbox', { strokeDashoffset: 0, duration: 0.9 }, '-=0.5')
          .to('.bbox-tag', { opacity: 1, duration: 0.3 }, '-=0.3')

          // Buoc 2: hai mo hinh truot vao tu hai ben.
          .add(() => setStep(1))
          .to('.models', { opacity: 1, duration: 0.25 })
          .from(
            '.model-a',
            { x: -40, opacity: 0, duration: 0.5 },
            '<',
          )
          .from('.model-b', { x: 40, opacity: 0, duration: 0.5 }, '<')
          .to(
            '.model rect',
            {
              stroke: 'var(--mat-sys-primary)',
              duration: 0.4,
              stagger: 0.12,
            },
            '-=0.2',
          )

          // Buoc 3: khung bao va mo hinh mo di, the ket qua hien len.
          .add(() => setStep(2))
          .to('.models, .bbox, .bbox-tag', { opacity: 0, duration: 0.4 })
          .to('.vehicle', { opacity: 0.12, scale: 0.9, transformOrigin: 'center top', duration: 0.4 }, '<')
          .fromTo(
            '.result',
            { opacity: 0, y: 18, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6 },
            '-=0.2',
          );
      });
    }, element);

    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
