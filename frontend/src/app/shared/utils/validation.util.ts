import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ValidationUtil {
  /**
   * Password strength validator
   */
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]+/.test(value);
      const hasLowerCase = /[a-z]+/.test(value);
      const hasNumeric = /[0-9]+/.test(value);
      const hasSpecial = /[\W]+/.test(value);
      const isMinLength = value.length >= 8;

      const errors: any = {};
      
      if (!hasUpperCase) errors.missingUppercase = true;
      if (!hasLowerCase) errors.missingLowercase = true;
      if (!hasNumeric) errors.missingNumeric = true;
      if (!hasSpecial) errors.missingSpecial = true;
      if (!isMinLength) errors.minLength = true;

      return Object.keys(errors).length ? errors : null;
    };
  }

  /**
   * Password confirmation validator
   */
  static passwordMatch(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.parent?.get(passwordField)?.value;
      const confirmPassword = control.value;
      
      if (!password || !confirmPassword) return null;
      
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  /**
   * File type validator
   */
  static allowedFileTypes(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value as File;
      if (!file) return null;

      const fileType = file.type;
      const isValid = allowedTypes.some(type => {
        if (type.includes('*')) {
          const baseType = type.split('/')[0];
          return fileType.startsWith(baseType);
        }
        return fileType === type;
      });

      return isValid ? null : { invalidFileType: { allowedTypes, actualType: fileType } };
    };
  }

  /**
   * File size validator (size in MB)
   */
  static maxFileSize(maxSizeMB: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value as File;
      if (!file) return null;

      const fileSizeMB = file.size / (1024 * 1024);
      return fileSizeMB <= maxSizeMB ? null : { 
        maxFileSize: { 
          maxSize: maxSizeMB, 
          actualSize: Math.round(fileSizeMB * 100) / 100 
        } 
      };
    };
  }

  /**
   * Future date validator
   */
  static futureDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate >= today ? null : { pastDate: true };
    };
  }

  /**
   * Time range validator
   */
  static timeRange(startTimeField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startTime = control.parent?.get(startTimeField)?.value;
      const endTime = control.value;
      
      if (!startTime || !endTime) return null;
      
      return endTime > startTime ? null : { invalidTimeRange: true };
    };
  }

  /**
   * Get error message for common validation errors
   */
  static getErrorMessage(errors: ValidationErrors, fieldName: string): string {
    if (errors['required']) {
      return `${fieldName} is required`;
    }
    
    if (errors['email']) {
      return 'Please enter a valid email address';
    }
    
    if (errors['minlength']) {
      return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    
    if (errors['maxlength']) {
      return `${fieldName} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    }
    
    if (errors['pattern']) {
      return `${fieldName} format is invalid`;
    }
    
    if (errors['min']) {
      return `${fieldName} must be at least ${errors['min'].min}`;
    }
    
    if (errors['max']) {
      return `${fieldName} cannot exceed ${errors['max'].max}`;
    }
    
    if (errors['passwordMismatch']) {
      return 'Passwords do not match';
    }
    
    if (errors['pastDate']) {
      return 'Please select a future date';
    }
    
    if (errors['invalidTimeRange']) {
      return 'End time must be after start time';
    }
    
    if (errors['invalidFileType']) {
      return `Invalid file type. Allowed: ${errors['invalidFileType'].allowedTypes.join(', ')}`;
    }
    
    if (errors['maxFileSize']) {
      return `File size (${errors['maxFileSize'].actualSize}MB) exceeds limit of ${errors['maxFileSize'].maxSize}MB`;
    }

    return `${fieldName} is invalid`;
  }
}