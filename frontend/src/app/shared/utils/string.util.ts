/**
 * String Utility
 * String manipulation and formatting functions
 */

export class StringUtil {
  /**
   * Convert string to kebab-case
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Convert string to camelCase
   */
  static toCamelCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
  }

  /**
   * Convert string to PascalCase
   */
  static toPascalCase(str: string): string {
    const camelCase = this.toCamelCase(str);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }

  /**
   * Convert string to snake_case
   */
  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  /**
   * Capitalize first letter of string
   */
  static capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Capitalize first letter of each word
   */
  static capitalizeWords(str: string): string {
    return str
      .split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  }

  /**
   * Truncate string to specified length
   */
  static truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Truncate string to word boundary
   */
  static truncateWords(str: string, maxWords: number, suffix: string = '...'): string {
    const words = str.split(' ');
    if (words.length <= maxWords) return str;
    return words.slice(0, maxWords).join(' ') + suffix;
  }

  /**
   * Get initials from name
   */
  static getInitials(name: string, maxInitials: number = 2): string {
    if (!name) return '';
    
    const words = name.trim().split(/\s+/);
    const initials = words
      .slice(0, maxInitials)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    
    return initials;
  }

  /**
   * Slugify string (URL-friendly)
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Remove HTML tags from string
   */
  static stripHtml(str: string): string {
    return str.replace(/<[^>]*>/g, '');
  }

  /**
   * Escape HTML special characters
   */
  static escapeHtml(str: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return str.replace(/[&<>"']/g, char => map[char]);
  }

  /**
   * Unescape HTML special characters
   */
  static unescapeHtml(str: string): string {
    const map: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'"
    };
    
    return str.replace(/&(amp|lt|gt|quot|#039);/g, entity => map[entity]);
  }

  /**
   * Check if string is empty or whitespace
   */
  static isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0;
  }

  /**
   * Check if string is not empty
   */
  static isNotEmpty(str: string | null | undefined): boolean {
    return !this.isEmpty(str);
  }

  /**
   * Reverse string
   */
  static reverse(str: string): string {
    return str.split('').reverse().join('');
  }

  /**
   * Count words in string
   */
  static wordCount(str: string): number {
    return str.trim().split(/\s+/).length;
  }

  /**
   * Count characters (excluding whitespace)
   */
  static characterCount(str: string, excludeSpaces: boolean = false): number {
    if (excludeSpaces) {
      return str.replace(/\s/g, '').length;
    }
    return str.length;
  }

  /**
   * Repeat string n times
   */
  static repeat(str: string, times: number): string {
    return str.repeat(times);
  }

  /**
   * Pad string to specified length
   */
  static pad(str: string, length: number, char: string = ' ', direction: 'left' | 'right' | 'both' = 'right'): string {
    const padding = char.repeat(Math.max(0, length - str.length));
    
    switch (direction) {
      case 'left':
        return padding + str;
      case 'right':
        return str + padding;
      case 'both':
        const leftPad = char.repeat(Math.floor((length - str.length) / 2));
        const rightPad = char.repeat(Math.ceil((length - str.length) / 2));
        return leftPad + str + rightPad;
      default:
        return str;
    }
  }

  /**
   * Check if string contains substring (case-insensitive option)
   */
  static contains(str: string, searchString: string, caseInsensitive: boolean = false): boolean {
    if (caseInsensitive) {
      return str.toLowerCase().includes(searchString.toLowerCase());
    }
    return str.includes(searchString);
  }

  /**
   * Check if string starts with substring (case-insensitive option)
   */
  static startsWith(str: string, searchString: string, caseInsensitive: boolean = false): boolean {
    if (caseInsensitive) {
      return str.toLowerCase().startsWith(searchString.toLowerCase());
    }
    return str.startsWith(searchString);
  }

  /**
   * Check if string ends with substring (case-insensitive option)
   */
  static endsWith(str: string, searchString: string, caseInsensitive: boolean = false): boolean {
    if (caseInsensitive) {
      return str.toLowerCase().endsWith(searchString.toLowerCase());
    }
    return str.endsWith(searchString);
  }

  /**
   * Format number with thousand separators
   */
  static formatNumber(num: number, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale).format(num);
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount);
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }

  /**
   * Generate random string
   */
  static random(length: number = 10, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Mask string (useful for sensitive data)
   */
  static mask(str: string, visibleChars: number = 4, maskChar: string = '*'): string {
    if (str.length <= visibleChars) return str;
    
    const visible = str.slice(-visibleChars);
    const masked = maskChar.repeat(str.length - visibleChars);
    
    return masked + visible;
  }

  /**
   * Extract email from string
   */
  static extractEmail(str: string): string | null {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const match = str.match(emailRegex);
    return match ? match[0] : null;
  }

  /**
   * Extract URLs from string
   */
  static extractUrls(str: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return str.match(urlRegex) || [];
  }

  /**
   * Highlight search term in string
   */
  static highlight(str: string, searchTerm: string, highlightClass: string = 'highlight'): string {
    if (!searchTerm) return str;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return str.replace(regex, `<span class="${highlightClass}">$1</span>`);
  }
}
