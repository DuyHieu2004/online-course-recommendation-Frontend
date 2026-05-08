import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  message: string;
  token: string;
  role: string;
  userId: number;
  userName: string;
  status?: string;
}

export interface UserInfo {
  userId: number;
  userName: string;
  role: string;
  status?: string;
  avatar?: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<UserInfo | null>(this.loadUserFromStorage());
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly userRole = computed(() => this.currentUser()?.role ?? '');
  readonly userName = computed(() => this.currentUser()?.userName ?? '');

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      matKhau: password
    });
  }

  handleLoginSuccess(response: LoginResponse) {
    const user: UserInfo = {
      userId: response.userId,
      userName: response.userName,
      role: response.role,
      status: response.status,
      token: response.token
    };
    localStorage.setItem('auth_token', response.token);
    this.updateLocalUser(user);
  }

  updateLocalUser(user: UserInfo) {
    localStorage.setItem('auth_user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  register(ten: string, email: string, matKhau: string, role?: string, file?: File | null) {
    const formData = new FormData();
    formData.append('ten', ten);
    formData.append('email', email);
    formData.append('matKhau', matKhau);
    if (role) {
      formData.append('vaiTro', role);
    }
    if (file) {
      formData.append('file', file);
    }
    
    return this.http.post<{ message: string; userId: number }>(`${this.apiUrl}/register`, formData);
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  changePassword(matKhauCu: string, matKhauMoi: string) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, {
      matKhauCu,
      matKhauMoi
    });
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.currentUser.set(null);
    this.router.navigate(['/home']);
  }

  private loadUserFromStorage(): UserInfo | null {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
