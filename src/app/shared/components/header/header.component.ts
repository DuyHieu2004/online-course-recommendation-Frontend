import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header" [class.authenticated]="authService.isLoggedIn()">
      <div class="header-inner">
        <a routerLink="/" class="logo">
          <span class="logo-icon">E</span>
          <span class="logo-text">EduLearn</span>
        </a>

        <nav class="nav">
          <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Trang chủ</a>
          <a routerLink="/course" routerLinkActive="active">Khóa học</a>
          <a routerLink="/ai-recommendations" routerLinkActive="active">AI Gợi ý</a>
          <a *ngIf="authService.isLoggedIn()" routerLink="/dashboard" routerLinkActive="active">Học tập của tôi</a>
        </nav>

        <div class="header-right">
          <button class="icon-action-btn cart-btn" routerLink="/cart" title="Giỏ hàng" aria-label="Giỏ hàng">
            <i class="fa-solid fa-cart-shopping"></i>
            <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
          </button>

          <ng-container *ngIf="!authService.isLoggedIn()">
            <a routerLink="/login" class="btn btn-join">Tham gia ngay</a>
          </ng-container>

          <ng-container *ngIf="authService.isLoggedIn()">
            <div class="user-menu-pill" [routerLink]="getProfileLink()">
              <div class="avatar-wrapper">
                <img *ngIf="authService.currentUser()?.avatar" [src]="authService.currentUser()?.avatar" class="user-avatar" alt="Avatar">
                <div *ngIf="!authService.currentUser()?.avatar" class="avatar-gradient">{{ getInitials() }}</div>
              </div>
              <div class="user-info">
                <span class="user-name">{{ authService.userName() || 'Học viên' }}</span>
                <span class="user-link">{{ getProfileText() }} <i class="fa-solid fa-chevron-right"></i></span>
              </div>
            </div>
            
            <button class="icon-action-btn logout-btn" (click)="logout()" title="Đăng xuất" aria-label="Đăng xuất">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </ng-container>
        </div>
      </div>
    </header>
  `,
  styles: [`
    /* Thiết lập biến màu chuẩn EduLearn */
    :host {
      --clr-brand: #ea580c; /* Cam chủ đạo */
      --clr-brand-light: #fff7ed;
      --clr-brand-hover: #f97316;
      --clr-text-main: #1f2937;
      --clr-text-muted: #6b7280;
      --clr-bg-light: #f3f4f6;
      --clr-border: #e5e7eb;
      --clr-white: #ffffff;
    }

    /* ===== Header Layout ===== */
    .header {
      background: var(--clr-white);
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid var(--clr-border);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); /* Đổ bóng cực mềm */
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .header-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      height: 72px; /* Tăng chiều cao lên chút cho thoáng */
      gap: 48px;
    }

    /* ===== Logo ===== */
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--clr-text-main);
      font-size: 22px;
      font-weight: 800;
      text-decoration: none;
      letter-spacing: -0.5px;
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--clr-brand) 0%, var(--clr-brand-hover) 100%);
      color: var(--clr-white);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      font-size: 18px;
      font-weight: 900;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
    }

    /* ===== Navigation ===== */
    .nav {
      display: flex;
      gap: 36px;
      height: 100%;
    }

    .nav a {
      color: var(--clr-text-muted);
      font-weight: 600;
      font-size: 15px;
      text-decoration: none;
      display: flex;
      align-items: center;
      position: relative;
      transition: color 0.2s ease;
    }

    .nav a:hover {
      color: var(--clr-brand);
    }

    /* Gạch chân màu cam khi Active */
    .nav a.active {
      color: var(--clr-brand);
    }
    .nav a.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 3px;
      background: var(--clr-brand);
      border-radius: 3px 3px 0 0;
    }

    /* ===== Header Right & Actions ===== */
    .header-right {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    /* Nút Tham Gia (Guest) */
    .btn-join {
      background: var(--clr-brand-light);
      color: var(--clr-brand);
      border: 1px solid transparent;
      padding: 10px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-join:hover {
      background: var(--clr-brand);
      color: var(--clr-white);
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.2);
      transform: translateY(-1px);
    }

    /* Nút Icon Tròn (Giỏ hàng, Đăng xuất) */
    .icon-action-btn {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--clr-white);
      border: 1px solid var(--clr-border);
      color: var(--clr-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    
    .icon-action-btn:hover {
      background: var(--clr-bg-light);
      color: var(--clr-text-main);
      border-color: #d1d5db;
    }

    .icon-action-btn.logout-btn:hover {
      background: #fee2e2;
      color: #ef4444;
      border-color: #fca5a5;
    }

    /* Giỏ hàng Badge */
    .cart-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #ef4444; /* Đỏ rực rỡ để gây chú ý */
      color: var(--clr-white);
      font-size: 11px;
      font-weight: 800;
      height: 20px;
      min-width: 20px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
      border: 2px solid var(--clr-white); /* Viền trắng tách biệt với icon */
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
    }

    /* ===== User Profile Pill ===== */
    .user-menu-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 16px 6px 6px;
      border-radius: 50px;
      background: var(--clr-white);
      border: 1px solid var(--clr-border);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .user-menu-pill:hover {
      background: var(--clr-bg-light);
      border-color: #d1d5db;
    }
    
    .avatar-wrapper {
      width: 36px;
      height: 36px;
      position: relative;
    }
    
    .user-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .avatar-gradient {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--clr-brand) 0%, #fb923c 100%);
      color: var(--clr-white);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14px;
    }
    
    .user-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .user-name {
      color: var(--clr-text-main);
      font-weight: 700;
      font-size: 14px;
      line-height: 1.2;
    }
    
    .user-link {
      color: var(--clr-text-muted);
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 2px;
    }
    
    .user-menu-pill:hover .user-link {
      color: var(--clr-brand);
    }
    
    .user-link i {
      font-size: 10px;
      transition: transform 0.2s ease;
    }
    
    .user-menu-pill:hover .user-link i {
      transform: translateX(2px);
    }
  `]
})
// Phần export class HeaderComponent của bạn giữ nguyên nhé!

export class HeaderComponent {
  authService = inject(AuthService);
  dataService = inject(DataService);

  get cartCount() {
    return this.dataService.cartItems().length;
  }

  getInitials() {
    const name = this.authService.userName() || 'HV';
    return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  }

  getProfileLink() {
    const role = this.authService.userRole();
    if (role === 'Admin') return '/admin/dashboard';
    if (role === 'GiaoVien') return '/instructor/dashboard';
    return '/student/settings';
  }

  getProfileText() {
    const role = this.authService.userRole();
    if (role === 'Admin') return 'Trang quản trị';
    if (role === 'GiaoVien') return 'Trang giảng viên';
    return 'Cài đặt cá nhân';
  }

  logout() {
    this.authService.logout();
  }
}

