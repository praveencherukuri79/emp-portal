import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DocumentService } from '@core/services/document.service';
import { Document as DocType } from '@shared/types';
import { DocumentUploadDialogComponent } from '@shared/components/document-upload-dialog/document-upload-dialog.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

interface DocumentStats {
  totalDocuments: number;
  totalSize: number;
  byCategory: { category: string; count: number }[];
}

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'category', 'size', 'uploadedAt', 'signatureStatus', 'actions'];
  dataSource: MatTableDataSource<any>;
  stats: DocumentStats | null = null;
  loading = false;
  
  // Filters
  categoryFilter = '';
  searchText = '';

  private destroy$ = new Subject<void>();

  constructor(
    private documentService: DocumentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.dataSource = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    this.loadDocuments();
    this.loadStats();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom filter predicate
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      return data.originalName.toLowerCase().includes(searchStr) ||
             (data.description && data.description.toLowerCase().includes(searchStr)) ||
             data.category.toLowerCase().includes(searchStr);
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStats(): void {
    this.http.get<DocumentStats>(`${environment.apiUrl}/documents/stats`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Failed to load document stats:', error);
        }
      });
  }

  loadDocuments(): void {
    this.loading = true;
    
    this.documentService.getDocuments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (documents) => {
          this.dataSource.data = Array.isArray(documents) ? documents : [];
          this.loading = false;
          
          // Apply category filter if set
          if (this.categoryFilter) {
            this.dataSource.data = this.dataSource.data.filter(
              (doc: any) => doc.category === this.categoryFilter
            );
          }
        },
        error: (error) => {
          console.error('Failed to load documents:', error);
          this.dataSource.data = [];
          this.loading = false;
          this.snackBar.open('Failed to load documents', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  applyFilters(): void {
    this.loadDocuments();
  }

  applySearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchText = filterValue.trim().toLowerCase();
    this.dataSource.filter = this.searchText;
  }

  refreshData(): void {
    this.loadDocuments();
    this.loadStats();
  }

  uploadDocument(): void {
    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshData();
      }
    });
  }

  viewDocument(doc: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: doc.originalName,
        message: `
          <div class="document-details">
            <p><strong>Category:</strong> ${this.getCategoryLabel(doc.category)}</p>
            <p><strong>Size:</strong> ${this.formatFileSize(doc.size)}</p>
            <p><strong>Uploaded:</strong> ${this.formatDate(doc.createdAt)}</p>
            ${doc.description ? `<p><strong>Description:</strong> ${doc.description}</p>` : ''}
            ${doc.isSignatureRequired ? `<p><strong>Signature Status:</strong> ${this.getSignatureStatusLabel(doc.signatureStatus)}</p>` : ''}
          </div>
        `,
        confirmText: 'Download',
        cancelText: 'Close',
        type: 'info'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.downloadDocument(doc);
      }
    });
  }

  downloadDocument(doc: any): void {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/documents/${doc._id}/download`, {
      responseType: 'blob'
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = doc.originalName;
          link.click();
          window.URL.revokeObjectURL(url);
          this.loading = false;
          this.snackBar.open('Document downloaded successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.loading = false;
          const errorMessage = error?.error?.message || 'Failed to download document';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  deleteDocument(doc: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Document',
        message: `Are you sure you want to delete "${doc.originalName}"? This action cannot be undone.`,
        confirmText: 'Yes, Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loading = true;
        this.documentService.deleteDocument(doc._id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loading = false;
              this.snackBar.open('Document deleted successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this.refreshData();
            },
            error: (error) => {
              this.loading = false;
              const errorMessage = error?.error?.message || 'Failed to delete document';
              this.snackBar.open(errorMessage, 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      visa: 'Visa Documents',
      identification: 'Identification',
      contract: 'Contracts',
      payslip: 'Payslips',
      tax: 'Tax Documents',
      certification: 'Certifications',
      other: 'Other'
    };
    return labels[category] || category;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      visa: 'flight',
      identification: 'badge',
      contract: 'gavel',
      payslip: 'payments',
      tax: 'account_balance',
      certification: 'workspace_premium',
      other: 'description'
    };
    return icons[category] || 'description';
  }

  getSignatureStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Pending Signature',
      signed: 'Signed',
      declined: 'Declined',
      none: 'No Signature'
    };
    return labels[status] || status;
  }

  getFileIcon(filename: string): string {
    const ext = this.getFileExtension(filename);
    const icons: { [key: string]: string } = {
      pdf: 'picture_as_pdf',
      doc: 'description',
      docx: 'description',
      xls: 'table_chart',
      xlsx: 'table_chart',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image'
    };
    return icons[ext] || 'insert_drive_file';
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getCategoryCount(): number {
    if (!this.stats || !this.stats.byCategory) return 0;
    return this.stats.byCategory.length;
  }
}
