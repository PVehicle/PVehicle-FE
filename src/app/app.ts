import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { HealthStore } from './core/health.store';

type Theme = 'light' | 'dark';

/** Khoa luu lua chon chu de cua nguoi dung giua cac lan truy cap. */
const THEME_STORAGE_KEY = 'pvehicle-theme';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly health = inject(HealthStore);

  protected readonly theme = signal<Theme>(readStoredTheme());

  ngOnInit(): void {
    this.applyTheme(this.theme());
    // Biet som backend da nap mo hinh chua de con vo hieu hoa tab nhan dien.
    void this.health.check();
  }

  protected toggleTheme(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.applyTheme(next);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Trinh duyet chan luu tru (che do rieng tu) - bo qua, khong the
      // ghi nho lua chon nhung giao dien van chay binh thuong.
    }
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.dataset['theme'] = theme;
  }
}

/**
 * Doc chu de da luu; neu chua co thi bam theo cai dat he dieu hanh.
 */
function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Khong doc duoc luu tru - roi xuong lua chon cua he dieu hanh.
  }

  // `matchMedia` khong ton tai trong jsdom va mot so moi truong khong phai
  // trinh duyet - thieu no thi mac dinh chu de sang.
  const prefers_dark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefers_dark ? 'dark' : 'light';
}
