/**
 * Theme Service
 * Manages application theme with signals-based reactivity
 * Supports light, dark, and corporate themes with system preference detection
 */

import { Injectable, signal, computed, effect } from '@angular/core';
import { ThemeConfig } from '@shared/models/core.interface';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'app-theme-config';
  private readonly THEME_CLASS_PREFIX = 'theme-';

  // Signal for theme configuration
  private readonly _themeConfig = signal<ThemeConfig>(this.getInitialThemeConfig());

  // Public readonly signals
  readonly themeConfig = this._themeConfig.asReadonly();
  
  readonly currentTheme = computed(() => {
    const config = this._themeConfig();
    if (config.mode === 'auto') {
      return config.systemPreference;
    }
    return config.variant;
  });

  readonly isDark = computed(() => {
    return this.currentTheme() === 'dark';
  });

  readonly isCorporate = computed(() => {
    return this.currentTheme() === 'corporate';
  });

  readonly isLight = computed(() => {
    return this.currentTheme() === 'light';
  });

  constructor() {
    // Effect to apply theme when it changes
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.saveThemeConfig();
    });

    // Listen to system theme changes
    this.watchSystemTheme();
    
    // Check for reduced motion preference
    this.detectReducedMotion();
  }

  /**
   * Set theme mode
   */
  setTheme(mode: 'auto' | 'light' | 'dark' | 'corporate'): void {
    const config = this._themeConfig();
    
    if (mode === 'auto') {
      this._themeConfig.set({
        ...config,
        mode: 'auto',
        variant: config.systemPreference
      });
    } else {
      this._themeConfig.set({
        ...config,
        mode: mode,
        variant: mode as 'light' | 'dark' | 'corporate'
      });
    }
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const currentTheme = this.currentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Set specific theme variant
   */
  setVariant(variant: 'light' | 'dark' | 'corporate'): void {
    this._themeConfig.update(config => ({
      ...config,
      mode: variant,
      variant
    }));
  }

  /**
   * Get initial theme configuration
   */
  private getInitialThemeConfig(): ThemeConfig {
    const systemPreference = this.detectSystemTheme();
    const reducedMotion = this.detectReducedMotion();
    
    // Try to load from localStorage
    const stored = this.loadThemeConfig();
    if (stored) {
      return {
        mode: stored.mode || 'auto',
        variant: stored.variant || systemPreference,
        systemPreference,
        reducedMotion
      };
    }

    // Default configuration
    return {
      mode: 'auto',
      variant: systemPreference,
      systemPreference,
      reducedMotion
    };
  }

  /**
   * Detect system theme preference
   */
  private detectSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') {
      return 'light';
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  /**
   * Watch for system theme changes
   */
  private watchSystemTheme(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handler = (e: MediaQueryListEvent) => {
      const systemPreference = e.matches ? 'dark' : 'light';
      this._themeConfig.update(config => ({
        ...config,
        systemPreference,
        variant: config.mode === 'auto' ? systemPreference : config.variant
      }));
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }
  }

  /**
   * Detect reduced motion preference
   */
  private detectReducedMotion(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: 'light' | 'dark' | 'corporate'): void {
    if (typeof document === 'undefined') {
      return;
    }

    const body = document.body;
    
    // Remove all theme classes
    body.classList.remove(
      `${this.THEME_CLASS_PREFIX}light`,
      `${this.THEME_CLASS_PREFIX}dark`,
      `${this.THEME_CLASS_PREFIX}corporate`
    );

    // Add new theme class
    body.classList.add(`${this.THEME_CLASS_PREFIX}${theme}`);

    // Set data attribute for CSS
    body.setAttribute('data-theme', theme);

    // Update meta theme-color
    this.updateMetaThemeColor(theme);
  }

  /**
   * Update meta theme-color for mobile browsers
   */
  private updateMetaThemeColor(theme: 'light' | 'dark' | 'corporate'): void {
    if (typeof document === 'undefined') {
      return;
    }

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    // Set color based on theme
    const colors = {
      light: '#ffffff',
      dark: '#0f172a',
      corporate: '#1e40af'
    };

    metaThemeColor.setAttribute('content', colors[theme]);
  }

  /**
   * Save theme configuration to localStorage
   */
  private saveThemeConfig(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const config = this._themeConfig();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        mode: config.mode,
        variant: config.variant
      }));
    } catch (error) {
      console.warn('Failed to save theme configuration:', error);
    }
  }

  /**
   * Load theme configuration from localStorage
   */
  private loadThemeConfig(): Partial<ThemeConfig> | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load theme configuration:', error);
    }

    return null;
  }

  /**
   * Reset theme to system default
   */
  resetTheme(): void {
    this.setTheme('auto');
  }

  /**
   * Get available theme options
   */
  getThemeOptions(): Array<{ value: string; label: string; icon: string }> {
    return [
      { value: 'light', label: 'Light', icon: 'sun' },
      { value: 'dark', label: 'Dark', icon: 'moon' },
      { value: 'corporate', label: 'Corporate', icon: 'business' },
      { value: 'auto', label: 'Auto', icon: 'brightness_auto' }
    ];
  }
}
