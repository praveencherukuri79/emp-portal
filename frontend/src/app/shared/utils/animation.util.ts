/**
 * Animation Utility
 * Animation helpers and easing functions
 */

export type EasingFunction = (t: number) => number;

export class AnimationUtil {
  /**
   * Easing functions
   */
  static easing = {
    linear: (t: number): number => t,
    
    easeInQuad: (t: number): number => t * t,
    easeOutQuad: (t: number): number => t * (2 - t),
    easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    
    easeInCubic: (t: number): number => t * t * t,
    easeOutCubic: (t: number): number => (--t) * t * t + 1,
    easeInOutCubic: (t: number): number => 
      t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    
    easeInQuart: (t: number): number => t * t * t * t,
    easeOutQuart: (t: number): number => 1 - (--t) * t * t * t,
    easeInOutQuart: (t: number): number => 
      t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    
    easeInQuint: (t: number): number => t * t * t * t * t,
    easeOutQuint: (t: number): number => 1 + (--t) * t * t * t * t,
    easeInOutQuint: (t: number): number => 
      t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
    
    easeInSine: (t: number): number => 1 - Math.cos((t * Math.PI) / 2),
    easeOutSine: (t: number): number => Math.sin((t * Math.PI) / 2),
    easeInOutSine: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2,
    
    easeInExpo: (t: number): number => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
    easeOutExpo: (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    easeInOutExpo: (t: number): number => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      return t < 0.5 
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;
    },
    
    easeInCirc: (t: number): number => 1 - Math.sqrt(1 - Math.pow(t, 2)),
    easeOutCirc: (t: number): number => Math.sqrt(1 - Math.pow(t - 1, 2)),
    easeInOutCirc: (t: number): number => 
      t < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
    
    easeInBack: (t: number): number => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return c3 * t * t * t - c1 * t * t;
    },
    easeOutBack: (t: number): number => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    easeInOutBack: (t: number): number => {
      const c1 = 1.70158;
      const c2 = c1 * 1.525;
      return t < 0.5
        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },
    
    easeInElastic: (t: number): number => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0
        ? 0
        : t === 1
        ? 1
        : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
    easeOutElastic: (t: number): number => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0
        ? 0
        : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    easeInOutElastic: (t: number): number => {
      const c5 = (2 * Math.PI) / 4.5;
      return t === 0
        ? 0
        : t === 1
        ? 1
        : t < 0.5
        ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    },
    
    easeInBounce: (t: number): number => 1 - this.easing.easeOutBounce(1 - t),
    easeOutBounce: (t: number): number => {
      const n1 = 7.5625;
      const d1 = 2.75;
      
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    },
    easeInOutBounce: (t: number): number =>
      t < 0.5
        ? (1 - this.easing.easeOutBounce(1 - 2 * t)) / 2
        : (1 + this.easing.easeOutBounce(2 * t - 1)) / 2
  };

  /**
   * Animate a value from start to end
   */
  static animate(
    from: number,
    to: number,
    duration: number,
    onUpdate: (value: number) => void,
    easing: EasingFunction = this.easing.easeOutQuad,
    onComplete?: () => void
  ): () => void {
    const startTime = performance.now();
    let animationId: number;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const currentValue = from + (to - from) * easedProgress;

      onUpdate(currentValue);

      if (progress < 1) {
        animationId = requestAnimationFrame(step);
      } else {
        onComplete?.();
      }
    };

    animationId = requestAnimationFrame(step);

    // Return cancel function
    return () => cancelAnimationFrame(animationId);
  }

  /**
   * Animate scroll to position
   */
  static scrollTo(
    targetPosition: number,
    duration: number = 500,
    easing: EasingFunction = this.easing.easeInOutQuad
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPosition = window.pageYOffset;
      
      this.animate(
        startPosition,
        targetPosition,
        duration,
        (value) => window.scrollTo(0, value),
        easing,
        () => resolve()
      );
    });
  }

  /**
   * Fade in element
   */
  static fadeIn(
    element: HTMLElement,
    duration: number = 300,
    easing: EasingFunction = this.easing.easeOutQuad
  ): Promise<void> {
    return new Promise((resolve) => {
      element.style.opacity = '0';
      element.style.display = 'block';

      this.animate(
        0,
        1,
        duration,
        (value) => {
          element.style.opacity = value.toString();
        },
        easing,
        () => resolve()
      );
    });
  }

  /**
   * Fade out element
   */
  static fadeOut(
    element: HTMLElement,
    duration: number = 300,
    easing: EasingFunction = this.easing.easeOutQuad
  ): Promise<void> {
    return new Promise((resolve) => {
      this.animate(
        1,
        0,
        duration,
        (value) => {
          element.style.opacity = value.toString();
        },
        easing,
        () => {
          element.style.display = 'none';
          resolve();
        }
      );
    });
  }

  /**
   * Slide down element
   */
  static slideDown(
    element: HTMLElement,
    duration: number = 300,
    easing: EasingFunction = this.easing.easeOutQuad
  ): Promise<void> {
    return new Promise((resolve) => {
      element.style.display = 'block';
      const height = element.scrollHeight;
      element.style.height = '0px';
      element.style.overflow = 'hidden';

      this.animate(
        0,
        height,
        duration,
        (value) => {
          element.style.height = `${value}px`;
        },
        easing,
        () => {
          element.style.height = '';
          element.style.overflow = '';
          resolve();
        }
      );
    });
  }

  /**
   * Slide up element
   */
  static slideUp(
    element: HTMLElement,
    duration: number = 300,
    easing: EasingFunction = this.easing.easeOutQuad
  ): Promise<void> {
    return new Promise((resolve) => {
      const height = element.scrollHeight;
      element.style.height = `${height}px`;
      element.style.overflow = 'hidden';

      this.animate(
        height,
        0,
        duration,
        (value) => {
          element.style.height = `${value}px`;
        },
        easing,
        () => {
          element.style.display = 'none';
          element.style.height = '';
          element.style.overflow = '';
          resolve();
        }
      );
    });
  }

  /**
   * Counter animation
   */
  static countTo(
    element: HTMLElement,
    targetValue: number,
    duration: number = 1000,
    formatFn?: (value: number) => string,
    easing: EasingFunction = this.easing.easeOutQuad
  ): () => void {
    const startValue = parseFloat(element.textContent || '0');

    return this.animate(
      startValue,
      targetValue,
      duration,
      (value) => {
        const formattedValue = formatFn ? formatFn(value) : Math.round(value).toString();
        element.textContent = formattedValue;
      },
      easing
    );
  }

  /**
   * Parallax effect
   */
  static parallax(
    element: HTMLElement,
    speed: number = 0.5
  ): () => void {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const offset = element.offsetTop;
      const distance = scrolled - offset;
      const translate = distance * speed;

      element.style.transform = `translateY(${translate}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }

  /**
   * Stagger animation for multiple elements
   */
  static stagger(
    elements: HTMLElement[],
    animationFn: (element: HTMLElement, index: number) => Promise<void>,
    delayBetween: number = 100
  ): Promise<void> {
    return new Promise(async (resolve) => {
      for (let i = 0; i < elements.length; i++) {
        await new Promise(r => setTimeout(r, delayBetween * i));
        await animationFn(elements[i], i);
      }
      resolve();
    });
  }

  /**
   * Request animation frame with fallback
   */
  static requestAnimFrame(): (callback: FrameRequestCallback) => number {
    return (
      window.requestAnimationFrame ||
      function (callback: FrameRequestCallback) {
        return window.setTimeout(callback, 1000 / 60);
      }
    );
  }

  /**
   * Cancel animation frame with fallback
   */
  static cancelAnimFrame(): (id: number) => void {
    return (
      window.cancelAnimationFrame ||
      function (id: number) {
        clearTimeout(id);
      }
    );
  }
}
