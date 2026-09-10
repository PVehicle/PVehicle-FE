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
      padding: 2rem 1rem;
      text-align: center;
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
    }
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();

  /** Goi y cu the de nguoi dung biet lam gi tiep. */
  readonly hints = input<string[]>([]);
}
