import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentService } from '@core/services/document.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentCategory } from '@shared/models/enums';

export interface DocumentUploadData {
  file: File;
  category: string;
  description: string;
}

@Component({
  selector: 'app-document-upload-dialog',
  templateUrl: './document-upload-dialog.component.html',
  styleUrls: ['./document-upload-dialog.component.scss']
})
export class DocumentUploadDialogComponent {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;
  
  categories = [
    { value: DocumentCategory.CONTRACT, label: 'Contract', icon: 'description', color: '#FF6B6B' },
    { value: DocumentCategory.CERTIFICATION, label: 'Certificate', icon: 'verified', color: '#4ECDC4' },
    { value: DocumentCategory.ID, label: 'ID', icon: 'badge', color: '#95E1D3' },
    { value: DocumentCategory.TAX, label: 'Tax', icon: 'receipt', color: '#FFE66D' },
    { value: DocumentCategory.OTHER, label: 'Other', icon: 'folder', color: '#9B9B9B' }
  ];

  acceptedFormats = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.jpg', '.jpeg', '.png', '.gif'
  ];

  maxSizeMB = 10;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DocumentUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private documentService: DocumentService,
    private snackBar: MatSnackBar
  ) {
    this.uploadForm = this.fb.group({
      category: [DocumentCategory.CONTRACT, Validators.required],
      description: ['']
    });
  }

  selectCategory(category: string): void {
    this.uploadForm.patchValue({ category });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > this.maxSizeMB) {
      alert(`File size exceeds ${this.maxSizeMB}MB limit`);
      return;
    }

    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.acceptedFormats.includes(fileExt)) {
      alert('File format not supported');
      return;
    }

    this.selectedFile = file;
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  getFileColor(): string {
    const ext = this.selectedFile?.name.split('.').pop()?.toLowerCase();
    const colorMap: { [key: string]: string } = {
      'pdf': '#FF0000',
      'doc': '#2B579A',
      'docx': '#2B579A',
      'xls': '#217346',
      'xlsx': '#217346',
      'jpg': '#4285F4',
      'jpeg': '#4285F4',
      'png': '#4285F4',
      'gif': '#4285F4'
    };
    return colorMap[ext || ''] || '#757575';
  }

  get fileIcon(): string {
    if (!this.selectedFile) return 'insert_drive_file';
    
    const ext = this.selectedFile.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'picture_as_pdf';
      case 'doc':
      case 'docx': return 'description';
      case 'xls':
      case 'xlsx': return 'table_chart';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'image';
      default: return 'insert_drive_file';
    }
  }

  get fileSizeFormatted(): string {
    if (!this.selectedFile) return '';
    
    const bytes = this.selectedFile.size;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.selectedFile) {
      this.isSubmitting = true;
      
      const category = this.uploadForm.get('category')?.value;
      const description = this.uploadForm.get('description')?.value || '';
      
      this.documentService.uploadDocument(this.selectedFile, category, description).subscribe({
        next: (response) => {
          this.snackBar.open('Document uploaded successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error uploading document:', error);
          this.snackBar.open('Failed to upload document. Please try again.', 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }
}
