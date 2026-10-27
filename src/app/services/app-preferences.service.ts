import { Injectable } from '@angular/core';

const REFRESH_INTERVAL_KEY = 'empresariotec.dashboard.refresh-seconds';
const NOTIFICATIONS_ENABLED_KEY = 'empresariotec.notifications.enabled';
const THEME_KEY = 'empresariotec.appearance.theme';
const DEFAULT_REFRESH_INTERVAL_SECONDS = 1;
const ALLOWED_REFRESH_INTERVALS = [1, 2, 5, 10];

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class AppPreferencesService {
  getTheme(): AppTheme {
    return this.readPreference(THEME_KEY) === 'dark' ? 'dark' : 'light';
  }

  setTheme(theme: AppTheme): void {
    if (theme !== 'light' && theme !== 'dark') {
      throw new RangeError('El tema debe ser claro u oscuro.');
    }
    this.writePreference(THEME_KEY, theme);
    this.applyTheme();
  }

  applyTheme(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('theme-dark', this.getTheme() === 'dark');
    }
  }

  getRefreshIntervalSeconds(): number {
    const storedValue = this.readPreference(REFRESH_INTERVAL_KEY);
    const parsedValue = Number(storedValue);
    return ALLOWED_REFRESH_INTERVALS.includes(parsedValue)
      ? parsedValue
      : DEFAULT_REFRESH_INTERVAL_SECONDS;
  }

  setRefreshIntervalSeconds(seconds: number): void {
    if (!ALLOWED_REFRESH_INTERVALS.includes(seconds)) {
      throw new RangeError('El intervalo debe ser 1, 2, 5 o 10 segundos.');
    }
    this.writePreference(REFRESH_INTERVAL_KEY, String(seconds));
  }

  notificationsEnabled(): boolean {
    return this.readPreference(NOTIFICATIONS_ENABLED_KEY) === 'true';
  }

  setNotificationsEnabled(enabled: boolean): void {
    this.writePreference(NOTIFICATIONS_ENABLED_KEY, String(enabled));
  }

  notificationPermission(): NotificationPermission | 'unsupported' {
    return typeof Notification === 'undefined'
      ? 'unsupported'
      : Notification.permission;
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof Notification === 'undefined') {
      throw new Error('Este navegador no admite notificaciones del sistema.');
    }
    return Notification.requestPermission();
  }

  private readPreference(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`No se pudo leer la preferencia ${key}:`, error);
      return null;
    }
  }

  private writePreference(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`No se pudo guardar la preferencia ${key}:`, error);
      throw new Error('El navegador no permitió guardar esta preferencia.');
    }
  }
}
