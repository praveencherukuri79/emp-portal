import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { User } from '@shared/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
  user: Partial<User>;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  refreshToken(): Observable<any> {
    const token = localStorage.getItem('refreshToken');
    if (!token) {
      return new Observable(observer => {
        observer.error({ error: { message: 'No refresh token available' } });
      });
    }
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/refresh-token`, { refreshToken: token })
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem('accessToken', authResult.accessToken);
    localStorage.setItem('refreshToken', authResult.refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(authResult.user));
    
    this.currentUserSubject.next(authResult.user);
    this.isAuthenticatedSubject.next(true);
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('currentUser');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.logout();
      }
    } else {
      // Initialize demo employer user for development
      this.initializeDemoUser();
    }
  }

  private initializeDemoUser(): void {
    const demoUser: User = {
      id: 'demo-employer-001',
      firstName: 'Praveen',
      lastName: 'Cherukuri',
      email: 'praveen.cherukuri@company.com',
      role: 'employer',
      department: 'Management',
      position: 'CEO',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const demoToken = 'demo-jwt-token-employer';
    const demoRefreshToken = 'demo-refresh-token-employer';

    localStorage.setItem('accessToken', demoToken);
    localStorage.setItem('refreshToken', demoRefreshToken);
    localStorage.setItem('currentUser', JSON.stringify(demoUser));
    
    this.currentUserSubject.next(demoUser);
    this.isAuthenticatedSubject.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}