import { Component, computed, signal } from '@angular/core';

/** Dia chi nhan gop y - doi thanh hom thu that khi trien khai. */
const CONTACT_EMAIL = 'sw@mfast.vn';

interface ContactDraft {
  name: string;
  email: string;
  message: string;
}

const EMPTY_DRAFT: ContactDraft = { name: '', email: '', message: '' };

/**
 * Form lien he.
 *
 * Backend PVehicle-AI khong co endpoint nhan gop y (chi co 8 endpoint ve
 * nhan dien va tra cuu xe), nen form nay mo san ung dung thu dien tu cua
 * nguoi dung qua `mailto:` thay vi gui len may chu.
 *
 * Lam vay de khong hua hen sai: neu chi hien "da gui thanh cong" ma khong
 * gui di dau ca thi nguoi dung se cho hoi am khong bao gio den.
 */
@Component({
  selector: 'app-contact-form',
  template: `
    <form class="form" (submit)="onSubmit($event)">
      <div class="row">
        <div class="field">
          <label for="contact-name">Tên của bạn</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autocomplete="name"
            [value]="draft().name"
            (input)="onInput('name', $event)" />
        </div>

        <div class="field">
          <label for="contact-email">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="ban@example.com"
            [value]="draft().email"
            (input)="onInput('email', $event)" />
        </div>
      </div>

      <div class="field">
        <label for="contact-message">Nội dung</label>
        <textarea
          id="contact-message"
          name="message"
          rows="5"
          placeholder="Góp ý, câu hỏi hoặc đề xuất hợp tác..."
          [value]="draft().message"
          (input)="onInput('message', $event)"></textarea>
      </div>

      <div class="footer">
        <p class="note">
          Nút bên cạnh sẽ mở ứng dụng thư của bạn với nội dung đã điền sẵn.
        </p>
        <button
          type="submit"
          class="app-btn app-btn--primary"
          [disabled]="!canSubmit()">
          Gửi liên hệ
        </button>
      </div>

      @if (error(); as message) {
        <p class="error" role="alert">{{ message }}</p>
      }

      @if (opened()) {
        <p class="success" role="status">
          Đã mở ứng dụng thư. Nếu không thấy gì, bạn gửi trực tiếp tới
          <a [href]="'mailto:' + email">{{ email }}</a>
          nhé.
        </p>
      }
    </form>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.75rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--app-radius-lg);
      background: var(--mat-sys-surface-container-low);
    }

    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    label {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-label-medium);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    input,
    textarea {
      padding: 0.7rem 0.9rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--app-radius-md);
      background: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface);
      font: var(--mat-sys-body-medium);
      resize: vertical;
      transition:
        border-color var(--app-duration-fast) var(--app-ease),
        box-shadow var(--app-duration-fast) var(--app-ease);
    }

    input:hover,
    textarea:hover {
      border-color: color-mix(in srgb, var(--mat-sys-primary) 50%, transparent);
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: var(--mat-sys-primary);
      box-shadow: 0 0 0 3px
        color-mix(in srgb, var(--mat-sys-primary) 18%, transparent);
    }

    .footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .note {
      flex: 1;
      min-width: 14rem;
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }

    .error,
    .success {
      margin: 0;
      padding: 0.75rem 1rem;
      border-radius: var(--app-radius-md);
      font: var(--mat-sys-body-small);
      animation: app-fade-in-up var(--app-duration) var(--app-ease) both;
    }

    .error {
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
    }

    .success {
      background: color-mix(in srgb, var(--mat-sys-primary) 14%, transparent);
      color: var(--mat-sys-on-surface);
    }

    .success a {
      color: var(--mat-sys-primary);
    }
  `,
})
export class ContactFormComponent {
  protected readonly email = CONTACT_EMAIL;

  protected readonly draft = signal<ContactDraft>(EMPTY_DRAFT);
  protected readonly error = signal<string | null>(null);
  protected readonly opened = signal(false);

  protected readonly canSubmit = computed(() => {
    const { name, email, message } = this.draft();
    return (
      name.trim() !== '' && email.trim() !== '' && message.trim() !== ''
    );
  });

  protected onInput(field: keyof ContactDraft, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement)
      .value;
    this.draft.update((current) => ({ ...current, [field]: value }));
    this.error.set(null);
    this.opened.set(false);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    const { name, email, message } = this.draft();
    if (!this.canSubmit()) {
      this.error.set('Vui lòng điền đủ tên, email và nội dung.');
      return;
    }

    // Kiem tra so bo - trinh duyet da chan phan lon dia chi sai qua
    // `type="email"`, day chi de bat truong hop nguoi dung go thieu.
    if (!email.includes('@')) {
      this.error.set('Địa chỉ email chưa hợp lệ.');
      return;
    }

    const subject = encodeURIComponent(`[PVehicle] Liên hệ từ ${name.trim()}`);
    const body = encodeURIComponent(
      `${message.trim()}\n\n---\nNgười gửi: ${name.trim()}\nEmail: ${email.trim()}`,
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    this.opened.set(true);
  }
}
