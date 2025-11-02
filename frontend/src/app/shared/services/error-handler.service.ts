import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private snackBar = inject(MatSnackBar);

  getMessage(error: any, fallback: string = 'Something went wrong. Please try again.'): string {
    return (
      error?.error?.message ||
      error?.message ||
      (typeof error === 'string' ? error : null) ||
      fallback
    );
  }

  show(error: any, duration = 5000): void {
    const message = this.getMessage(error);
    this.snackBar.open(message, 'Close', { duration, panelClass: ['error-snackbar'] });
  }

  info(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Close', { duration });
  }
}
