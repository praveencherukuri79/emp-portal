/**
 * Responsive Utility
 * Device detection and viewport utilities
 */

export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  LARGE_DESKTOP = 'large-desktop'
}

export enum Breakpoint {
  MOBILE = 480,
  TABLET = 768,
  DESKTOP = 1024,
  LARGE_DESKTOP = 1440
}

export class ResponsiveUtil {
  /**
   * Get current device type based on viewport width
   */
  static getDeviceType(): DeviceType {
    const width = window.innerWidth;
    
    if (width < Breakpoint.MOBILE) {
      return DeviceType.MOBILE;
    } else if (width < Breakpoint.TABLET) {
      return DeviceType.TABLET;
    } else if (width < Breakpoint.LARGE_DESKTOP) {
      return DeviceType.DESKTOP;
    } else {
      return DeviceType.LARGE_DESKTOP;
    }
  }

  /**
   * Check if current device is mobile
   */
  static isMobile(): boolean {
    return window.innerWidth < Breakpoint.TABLET;
  }

  /**
   * Check if current device is tablet
   */
  static isTablet(): boolean {
    const width = window.innerWidth;
    return width >= Breakpoint.TABLET && width < Breakpoint.DESKTOP;
  }

  /**
   * Check if current device is desktop
   */
  static isDesktop(): boolean {
    return window.innerWidth >= Breakpoint.DESKTOP;
  }

  /**
   * Check if current device is large desktop
   */
  static isLargeDesktop(): boolean {
    return window.innerWidth >= Breakpoint.LARGE_DESKTOP;
  }

  /**
   * Get viewport dimensions
   */
  static getViewportDimensions(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  /**
   * Check if viewport width is at least the specified breakpoint
   */
  static isBreakpointUp(minBreakpoint: Breakpoint): boolean {
    return window.innerWidth >= minBreakpoint;
  }

  /**
   * Check if viewport width is at most the specified breakpoint
   */
  static isBreakpointDown(maxBreakpoint: Breakpoint): boolean {
    return window.innerWidth <= maxBreakpoint;
  }

  /**
   * Check if viewport width is between two breakpoints
   */
  static isBreakpointBetween(minBreakpoint: Breakpoint, maxBreakpoint: Breakpoint): boolean {
    const width = window.innerWidth;
    return width >= minBreakpoint && width <= maxBreakpoint;
  }

  /**
   * Add resize event listener with debouncing
   */
  static addResizeListener(
    callback: () => void,
    debounceMs: number = 250
  ): () => void {
    let timeoutId: number;
    
    const debouncedCallback = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(callback, debounceMs);
    };
    
    window.addEventListener('resize', debouncedCallback);
    
    // Return cleanup function
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedCallback);
    };
  }

  /**
   * Get orientation (portrait or landscape)
   */
  static getOrientation(): 'portrait' | 'landscape' {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  /**
   * Check if device is in portrait mode
   */
  static isPortrait(): boolean {
    return this.getOrientation() === 'portrait';
  }

  /**
   * Check if device is in landscape mode
   */
  static isLandscape(): boolean {
    return this.getOrientation() === 'landscape';
  }

  /**
   * Check if device supports touch
   */
  static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Get device pixel ratio
   */
  static getPixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  /**
   * Check if device is retina display
   */
  static isRetina(): boolean {
    return this.getPixelRatio() > 1;
  }
}
