import { Component, input } from '@angular/core';

/**
 * Trang thai rong dung chung.
 *
 * Danh sach rong khong phai loi - vi du khi khong co xe nao thoa man dieu
 * kien loc. Component nhan `hints` de goi y nguoi dung lam gi tiep theo.
 */
@Component({
  selector: 'app-empty-state',
  host: { class: 'empty-state' },
  template: `
    <div role="status">
      <span class="icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26">
          <circle
            cx="11" cy="11" r="6.5"
            fill="none" stroke="currentColor" stroke-width="1.6" />
          <path
            d="m16 16 4 4"
            stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </span>
      <p class="title">{{ title() }}</p>

      @if (hints().length > 0) {
        <ul class="hints">
          @for (hint of hints(); track hint) {
            <li>{{ hint }}</li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 3rem 1rem;
      text-align: center;
      animation: app-fade-in-up var(--app-duration-slow) var(--app-ease) both;
    }

    .icon {
      display: grid;
      place-items: center;
      width: 3.25rem;
      height: 3.25rem;
      margin: 0 auto 1rem;
      border-radius: 50%;
      background: var(--mat-sys-surface-container-high);
      color: var(--mat-sys-on-surface-variant);
    }

    .title {
      margin: 0;
      font: var(--mat-sys-title-medium);
    }

    .hints {
      display: inline-block;
      margin: 1rem 0 0;
      padding-left: 1.25rem;
      text-align: left;
      color: var(--mat-sys-on-surface-variant);
      line-height: 1.7;
    }
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();

  /** Goi y cu the de nguoi dung biet lam gi tiep. */
  readonly hints = input<string[]>([]);
}
