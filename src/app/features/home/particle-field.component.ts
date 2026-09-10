import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  inject,
  viewChild,
} from '@angular/core';

/** So hat tren mot trieu pixel man hinh - giu mat do deu tren moi kich co. */
const DENSITY = 55;

/** Toi da bao nhieu hat, tranh lam nong may tren man hinh lon. */
const MAX_PARTICLES = 90;

/** Hai hat gan hon khoang nay (pixel) thi noi bang mot duong mo. */
const LINK_DISTANCE = 140;

/** Ban kinh chuot hut cac hat lai gan. */
const POINTER_RADIUS = 170;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

/**
 * Nen hat bay noi voi nhau bang cac duong mo.
 *
 * Ve bang canvas 2D thay vi DOM: mot tram phan tu DOM chuyen dong lien tuc
 * se lam trinh duyet phai tinh lai bo cuc moi khung hinh, con canvas chi
 * la mot the duy nhat.
 *
 * Tu dung han khi nguoi dung yeu cau giam chuyen dong hoac khi tab bi an.
 */
@Component({
  selector: 'app-particle-field',
  template: `<canvas #canvas aria-hidden="true"></canvas>`,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class ParticleFieldComponent implements OnInit {
  private readonly canvasRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private readonly destroyRef = inject(DestroyRef);

  private particles: Particle[] = [];
  private frame = 0;
  private pointerX = -9999;
  private pointerY = -9999;

  ngOnInit(): void {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');

    if (ctx === null) {
      return;
    }

    // Trinh duyet cu hoac moi truong khong ho tro thi bo qua hoan toan.
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      return;
    }

    const resize = (): void => this.resize(canvas);
    const onPointerMove = (event: PointerEvent): void => {
      const rect = canvas.getBoundingClientRect();
      this.pointerX = event.clientX - rect.left;
      this.pointerY = event.clientY - rect.top;
    };
    const onPointerLeave = (): void => {
      this.pointerX = -9999;
      this.pointerY = -9999;
    };
    const onVisibility = (): void => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start(canvas, ctx);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);

    this.start(canvas, ctx);

    this.destroyRef.onDestroy(() => {
      this.stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    });
  }

  /** Dat lai kich thuoc canvas theo o chua va tao lai dan hat. */
  private resize(canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect();
    // Gioi han ty le pixel o 2: man hinh 3x tro len ve rat ton ma mat
    // thuong gan nhu khong phan biet duoc.
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));

    const context = canvas.getContext('2d');
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);

    this.seed(rect.width, rect.height);
  }

  /** Rai hat ngau nhien tren toan bo dien tich. */
  private seed(width: number, height: number): void {
    const area = (width * height) / 1_000_000;
    const count = Math.min(MAX_PARTICLES, Math.round(area * DENSITY) + 18);

    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      radius: Math.random() * 1.6 + 0.7,
    }));
  }

  private start(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
  ): void {
    if (this.frame !== 0) {
      return;
    }

    // Lay mau chu dao tu bien he thong de hat doi mau theo chu de sang/toi.
    const accent = getComputedStyle(canvas)
      .getPropertyValue('--particle-color')
      .trim();

    const draw = (): void => {
      this.step(canvas, ctx, accent || '#7cc0ff');
      this.frame = requestAnimationFrame(draw);
    };

    this.frame = requestAnimationFrame(draw);
  }

  private stop(): void {
    if (this.frame !== 0) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
  }

  /** Ve mot khung hinh: di chuyen hat, noi duong, ve cham. */
  private step(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    color: string,
  ): void {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    for (const particle of this.particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Cham bien thi doi chieu, giu hat luon trong khung.
      if (particle.x < 0 || particle.x > width) {
        particle.vx *= -1;
      }
      if (particle.y < 0 || particle.y > height) {
        particle.vy *= -1;
      }

      // Chuot keo hat lai gan, tao cam giac dan hat co phan ung.
      const dx = this.pointerX - particle.x;
      const dy = this.pointerY - particle.y;
      const distance = Math.hypot(dx, dy);

      if (distance < POINTER_RADIUS && distance > 0.5) {
        const pull = (1 - distance / POINTER_RADIUS) * 0.35;
        particle.x += (dx / distance) * pull;
        particle.y += (dy / distance) * pull;
      }
    }

    // Noi cac cap hat o gan nhau. Vong lap bat dau tu `i + 1` de moi cap
    // chi xet mot lan.
    ctx.lineWidth = 1;
    for (let i = 0; i < this.particles.length; i += 1) {
      const a = this.particles[i];

      for (let j = i + 1; j < this.particles.length; j += 1) {
        const b = this.particles[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);

        if (distance < LINK_DISTANCE) {
          ctx.globalAlpha = (1 - distance / LINK_DISTANCE) * 0.22;
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 0.7;
    ctx.fillStyle = color;
    for (const particle of this.particles) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}
