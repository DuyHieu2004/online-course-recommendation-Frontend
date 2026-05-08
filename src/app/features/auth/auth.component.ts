import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HeaderComponent],
  template: `
    <app-header />
    <div class="auth-overlay" (click)="closeModal($event)">
      <div class="auth-modal" (click)="$event.stopPropagation()">
        <button class="close-btn" routerLink="/home">×</button>
        <div class="auth-tabs">
          <button class="auth-tab" [class.active]="activeTab() === 'login'" (click)="activeTab.set('login')">Đăng nhập</button>
          <button class="auth-tab" [class.active]="activeTab() === 'register'" (click)="activeTab.set('register')">Đăng ký</button>
        </div>

        <div *ngIf="errorMessage()" class="alert alert-error">{{ errorMessage() }}</div>
        <div *ngIf="successMessage()" class="alert alert-success">{{ successMessage() }}</div>

        <div *ngIf="activeTab() === 'login'" class="auth-form">
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-input" placeholder="name@email.com"
                   [(ngModel)]="loginEmail" (keydown.enter)="onLogin()">
          </div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <div class="password-wrapper">
              <input [type]="showLoginPassword() ? 'text' : 'password'" class="form-input" placeholder="Mật khẩu"
                     [(ngModel)]="loginPassword" (keydown.enter)="onLogin()">
              <i class="fa-solid" 
                 [ngClass]="showLoginPassword() ? 'fa-eye' : 'fa-eye-slash'"
                 (click)="showLoginPassword.update(v => !v)"></i>
            </div>
          </div>
          <div class="forgot-link">
            <a href="#" (click)="onForgotPassword($event)">Quên mật khẩu?</a>
          </div>
          <button class="btn btn-primary btn-lg" style="width:100%"
                  [disabled]="loading()" (click)="onLogin()">
            {{ loading() ? '⏳ Đang xử lý...' : 'Đăng nhập' }}
          </button>
          <div class="divider"><span>hoặc</span></div>
          <button class="btn social-btn google-btn">Tiếp tục với Google</button>
          <button class="btn social-btn facebook-btn">Tiếp tục với Facebook</button>
        </div>

        <div *ngIf="activeTab() === 'register'" class="auth-form">
          <div class="role-select">
            <strong>Tôi muốn đăng ký với tư cách</strong>
            <div class="role-options">
              <div class="role-option" [class.active]="selectedRole() === 'student'" (click)="selectedRole.set('student')">
                <span class="role-icon">👨‍🎓<i class="fa-solid fa-graduation-cap"></i></span>
                <span>Học viên</span>
              </div>
              <div class="role-option" [class.active]="selectedRole() === 'instructor'" (click)="selectedRole.set('instructor')">
                <span class="role-icon"><i class="fa-solid fa-chalkboard-user"></i></span>
                <span>Giảng viên</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Họ và tên</label>
            <input type="text" class="form-input" placeholder="Họ và tên" [(ngModel)]="registerName">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-input" placeholder="Email" [(ngModel)]="registerEmail">
          </div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <div class="password-wrapper">
              <input [type]="showRegisterPassword() ? 'text' : 'password'" class="form-input" placeholder="Mật khẩu" [(ngModel)]="registerPassword">
              <i class="fa-solid" 
                 [ngClass]="showRegisterPassword() ? 'fa-eye' : 'fa-eye-slash'"
                 (click)="showRegisterPassword.update(v => !v)"></i>
            </div>
          </div>
          <div class="form-group">
            <label>Xác nhận mật khẩu</label>
            <div class="password-wrapper">
              <input [type]="showConfirmPassword() ? 'text' : 'password'" class="form-input" placeholder="Xác nhận mật khẩu" [(ngModel)]="registerConfirmPassword">
              <i class="fa-solid" 
                 [ngClass]="showConfirmPassword() ? 'fa-eye' : 'fa-eye-slash'"
                 (click)="showConfirmPassword.update(v => !v)"></i>
            </div>
          </div>
          <div class="form-group" *ngIf="selectedRole() === 'instructor'">
            <label>Hồ sơ ứng tuyển (CV, Bằng cấp...)</label>
            <input type="file" class="form-input" accept=".pdf,image/*" (change)="onFileSelected($event)" style="padding-top: 10px;">
            <small style="color: var(--gray-400); display: block; margin-top: 4px;">Vui lòng tải lên tài liệu xác minh chuyên môn để ban quản trị phê duyệt.</small>
          </div>
          <button class="btn btn-primary btn-lg" style="width:100%"
                  [disabled]="loading()" (click)="onRegister()">
            {{ loading() ? '⏳ Đang xử lý...' : 'Tạo tài khoản' }}
          </button>
          <div class="divider"><span>hoặc</span></div>
          <button class="btn social-btn google-btn">G  Đăng ký với Google</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(3px);
    }
    .auth-modal {
      background: var(--white);
      border-radius: var(--radius-lg);
      width: 420px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 28px;
      position: relative;
      box-shadow: var(--shadow-lg);
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .close-btn {
      position: absolute;
      top: 12px;
      right: 16px;
      background: none;
      font-size: 24px;
      color: var(--gray-400);
      cursor: pointer;
    }
    .auth-tabs {
      display: flex;
      border-bottom: 2px solid var(--gray-200);
      margin-bottom: 20px;
    }
    .auth-tab {
      flex: 1;
      padding: 12px;
      background: none;
      font-size: 15px;
      font-weight: 600;
      color: var(--gray-400);
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: var(--transition);
    }
    .auth-tab.active {
      color: var(--gray-800);
      border-bottom-color: var(--primary);
    }
    .form-group { margin-bottom: 14px; }
    .form-group label {
      font-size: 13px;
      font-weight: 500;
      color: var(--gray-600);
      margin-bottom: 4px;
      display: block;
    }
    .forgot-link {
      text-align: right;
      margin-bottom: 16px;
    }
    .forgot-link a {
      font-size: 13px;
      color: var(--primary);
    }
    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 16px 0;
      color: var(--gray-400);
      font-size: 13px;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--gray-200);
    }
    .social-btn {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--gray-300);
      background: var(--white);
      font-weight: 600;
      color: var(--gray-700);
      border-radius: var(--radius-sm);
      margin-bottom: 8px;
      transition: var(--transition);
    }
    .social-btn:hover {
      background: var(--gray-50);
    }
    .facebook-btn {
      background: #1877F2 !important;
      color: var(--white) !important;
      border-color: #1877F2 !important;
    }
    .role-select {
      margin-bottom: 16px;
    }
    .role-select strong {
      font-size: 14px;
      display: block;
      margin-bottom: 10px;
    }
    .role-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .role-option {
      border: 2px solid var(--gray-200);
      border-radius: var(--radius-md);
      padding: 16px;
      text-align: center;
      cursor: pointer;
      transition: var(--transition);
    }
    .role-option.active {
      border-color: var(--primary);
      background: var(--primary-bg);
    }
    .role-icon {
      font-size: 28px;
      display: block;
      margin-bottom: 4px;
    }
    .alert {
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      margin-bottom: 16px;
      font-size: 14px;
    }
    .alert-error {
      background: #FEE2E2;
      color: #DC2626;
      border: 1px solid #FECACA;
    }
    .alert-success {
      background: #D1FAE5;
      color: #059669;
      border: 1px solid #A7F3D0;
    }
    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .password-wrapper .form-input {
      width: 100%;
      padding-right: 40px; /* Chừa khoảng trống bên phải để chữ không bị đè lên icon */
    }
    
    .password-wrapper i {
      position: absolute;
      right: 12px;
      color: var(--gray-400);
      cursor: pointer;
      font-size: 16px;
      transition: color 0.2s ease;
    }
    
    .password-wrapper i:hover {
      color: var(--gray-700);
    }
  `]
})


export class AuthComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  activeTab = signal<'login' | 'register'>('login');
  selectedRole = signal<'student' | 'instructor'>('student');
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Login fields
  loginEmail = '';
  loginPassword = '';

  // Register fields
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';

  showLoginPassword = signal(false);
  showRegisterPassword = signal(false);
  showConfirmPassword = signal(false);

  selectedFile: File | null = null;

  closeModal(event: MouseEvent) {
    this.router.navigate(['/home']);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onLogin() {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage.set('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    this.loading.set(true);
    this.authService.login(this.loginEmail.trim(), this.loginPassword.trim()).subscribe({
      next: (res) => {
        this.authService.handleLoginSuccess(res);
        this.loading.set(false);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    });
  }

  onRegister() {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.registerName || !this.registerEmail || !this.registerPassword) {
      this.errorMessage.set('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.errorMessage.set('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (this.selectedRole() === 'instructor' && !this.selectedFile) {
      this.errorMessage.set('Giảng viên bắt buộc phải tải lên hồ sơ/bằng cấp ứng tuyển.');
      return;
    }

    this.loading.set(true);
    this.authService.register(
      this.registerName,
      this.registerEmail,
      this.registerPassword,
      this.selectedRole(),
      this.selectedFile
    ).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (this.selectedRole() === 'instructor') {
          this.successMessage.set(res.message + ' Hồ sơ đã được gửi để duyệt. Bạn sẽ không thể đăng nhập cho đến khi Admin cấp quyền.');
        } else {
          this.successMessage.set(res.message + ' Hãy đăng nhập.');
          this.activeTab.set('login');
          this.loginEmail = this.registerEmail;
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    });
  }

  onForgotPassword(event: Event) {
    event.preventDefault();
    if (!this.loginEmail) {
      this.errorMessage.set('Vui lòng nhập email của bạn trước.');
      return;
    }

    this.loading.set(true);
    this.authService.forgotPassword(this.loginEmail).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMessage.set(res.message);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Có lỗi xảy ra.');
      }
    });
  }
}
