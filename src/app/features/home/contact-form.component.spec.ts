import { TestBed } from '@angular/core/testing';

import { ContactFormComponent } from './contact-form.component';

/** Dien mot truong roi phat su kien `input` nhu nguoi dung go. */
function type(root: HTMLElement, selector: string, value: string): void {
  const field = root.querySelector(selector) as
    | HTMLInputElement
    | HTMLTextAreaElement;
  field.value = value;
  field.dispatchEvent(new Event('input'));
}

describe('ContactFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactFormComponent],
    }).compileComponents();
  });

  it('vo hieu hoa nut gui khi chua dien du', async () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const button = root.querySelector('button[type="submit"]');
    expect(button?.hasAttribute('disabled')).toBe(true);

    type(root, '#contact-name', 'Phát');
    type(root, '#contact-email', 'phat@example.com');
    await fixture.whenStable();

    // Van con thieu noi dung.
    expect(
      root.querySelector('button[type="submit"]')?.hasAttribute('disabled'),
    ).toBe(true);
  });

  it('bat nut gui khi da dien du ba truong', async () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    type(root, '#contact-name', 'Phát');
    type(root, '#contact-email', 'phat@example.com');
    type(root, '#contact-message', 'Kết quả nhận diện chưa đúng với xe A.');
    await fixture.whenStable();

    expect(
      root.querySelector('button[type="submit"]')?.hasAttribute('disabled'),
    ).toBe(false);
  });

  it('coi khoang trang la chua dien', async () => {
    const fixture = TestBed.createComponent(ContactFormComponent);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    type(root, '#contact-name', '   ');
    type(root, '#contact-email', 'phat@example.com');
    type(root, '#contact-message', 'Nội dung');
    await fixture.whenStable();

    expect(
      root.querySelector('button[type="submit"]')?.hasAttribute('disabled'),
    ).toBe(true);
  });
});
