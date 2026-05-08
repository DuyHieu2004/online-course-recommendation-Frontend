import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-instructor-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="instructor-layout">
      <aside class="instructor-sidebar">
        <div class="sidebar-brand">
          <a routerLink="/" class="brand-link">
            <span class="brand-icon">E</span>
            <span class="brand-text">EduLearn</span>
          </a>
          <span class="brand-badge">Giảng viên</span>
        </div>

        <div class="sidebar-section-label">ĐIỀU KHIỂN</div>
        <nav class="instructor-nav">
          <ng-container *ngIf="authService.currentUser()?.status !== 'Chờ duyệt'; else pendingMenu">
            <a routerLink="/instructor/dashboard" routerLinkActive="active" class="nav-item">
              <span class="nav-icon"><i class="fa-solid fa-chart-pie"></i></span>
              <span class="nav-text">Tổng quan</span>
            </a>
            <a routerLink="/instructor/courses" routerLinkActive="active" class="nav-item">
              <span class="nav-icon"><i class="fa-solid fa-book"></i></span>
              <span class="nav-text">Khóa học của tôi</span>
            </a>
            <a routerLink="/instructor/courses/create" routerLinkActive="active" class="nav-item">
              <span class="nav-icon"><i class="fa-solid fa-plus-circle"></i></span>
              <span class="nav-text">Tạo khóa học mới</span>
            </a>
            <a routerLink="/instructor/students" routerLinkActive="active" class="nav-item">
              <span class="nav-icon"><i class="fa-solid fa-users"></i></span>
              <span class="nav-text">Học viên</span>
            </a>
            <a routerLink="/instructor/revenue" routerLinkActive="active" class="nav-item">
              <span class="nav-icon"><i class="fa-solid fa-coins"></i></span>
              <span class="nav-text">Doanh thu</span>
            </a>
            <a routerLink="/instructor/reports" routerLinkActive="active" class="nav-item">
              <span class="nav-icon"><i class="fa-solid fa-chart-column"></i></span>
              <span class="nav-text">Báo cáo</span>
            </a>
          </ng-container>
          <ng-template #pendingMenu>
            <div style="padding: 12px; color: #DC3545; font-size: 13px; text-align: center;">
              Tài khoản đang chờ duyệt. Vui lòng vào Cài đặt để cập nhật Hồ sơ Bằng Cấp.
            </div>
          </ng-template>
        </nav>

        <div class="sidebar-section-label">TÙY CHỌN</div>
        <nav class="instructor-nav">
          <a routerLink="/instructor/settings" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><i class="fa-solid fa-gear"></i></span>
            <span class="nav-text">Cài đặt</span>
          </a>
        </nav>

        <div class="sidebar-bottom">
          <div class="sidebar-user-card">
            <div class="sidebar-user-avatar" 
                 [style.background-image]="authService.currentUser()?.avatar ? 'url(' + authService.currentUser()?.avatar + ')' : ''" 
                 [class.no-avt]="!authService.currentUser()?.avatar">
              {{ !authService.currentUser()?.avatar ? (authService.currentUser()?.userName?.charAt(0)?.toUpperCase() || 'GV') : '' }}
            </div>
            <div class="sidebar-user-info">
              <span class="sidebar-user-name">{{ authService.currentUser()?.userName || 'Giảng viên' }}</span>
              <span class="sidebar-user-role" [style.color]="authService.currentUser()?.status === 'Chờ duyệt' ? '#DC3545' : ''">Giảng viên {{ authService.currentUser()?.status === 'Chờ duyệt' ? '(Chờ duyệt)' : '' }}</span>
            </div>
            <button class="sidebar-logout" title="Đăng xuất" (click)="logout()">
              <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </aside>

      <div class="instructor-main">
        <header class="instructor-topbar">
          <div class="topbar-left">
            <div class="topbar-search">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Tìm kiếm nội dung...">
            </div>
          </div>
          <div class="topbar-right">
            </div>
        </header>

        <main class="instructor-content">
          <ng-content></ng-content>
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* Khai báo biến màu chung cho Layout */
    :host {
      --white: #ffffff;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-400: #9ca3af;
      --gray-500: #6b7280;
      --gray-700: #374151;
      --gray-800: #1f2937;
      --primary: #ea580c; /* Cam chủ đạo */
      --primary-light: #fff7ed; /* Cam nhạt */
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    /* ===== Layout ===== */
    .instructor-layout {
      display: flex;
      min-height: 100vh;
      background: #F4F6F8; /* Nền xám rất nhạt cho phần main content */
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* ===== Sidebar (Đã đổi sang Light Mode) ===== */
    .instructor-sidebar {
      width: 260px;
      background: var(--white);
      border-right: 1px solid var(--gray-200);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 50;
      overflow-y: auto;
    }

    .sidebar-brand {
      padding: 24px 20px 16px;
      border-bottom: 1px solid var(--gray-100);
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--gray-800);
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 8px;
      text-decoration: none;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      font-size: 18px;
      font-weight: 900;
      color: white;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
    }

    .brand-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      color: var(--primary);
      background: var(--primary-light);
      padding: 4px 12px;
      border-radius: 20px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .sidebar-section-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--gray-400);
      letter-spacing: 1px;
      padding: 24px 24px 8px;
      text-transform: uppercase;
    }

    /* ===== Nav Items ===== */
    .instructor-nav {
      display: flex;
      flex-direction: column;
      padding: 0 12px;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 10px;
      color: var(--gray-500);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      position: relative;
    }

    .nav-item:hover {
      color: var(--gray-800);
      background: var(--gray-50);
    }

    /* Trạng thái Active - Màu cam rực rỡ */
    .nav-item.active {
      color: var(--primary);
      background: var(--primary-light);
    }

    .nav-item.active .nav-icon {
      color: var(--primary);
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background: var(--primary);
      border-radius: 0 4px 4px 0;
    }

    .nav-icon {
      width: 20px;
      text-align: center;
      font-size: 16px;
      transition: color 0.2s ease;
    }

    .nav-text {
      flex: 1;
    }

    /* ===== Sidebar Bottom User Card ===== */
    .sidebar-bottom {
      margin-top: auto;
      padding: 16px 16px 24px;
    }

    .sidebar-user-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      background: var(--white);
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-sm);
    }

    .sidebar-user-avatar {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background-size: cover;
      background-position: center;
      flex-shrink: 0;
    }
    .sidebar-user-avatar.no-avt {
      background: var(--gray-100);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-700);
      font-weight: 700;
      font-size: 14px;
    }

    .sidebar-user-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .sidebar-user-name {
      color: var(--gray-800);
      font-weight: 700;
      font-size: 13px;
    }

    .sidebar-user-role {
      color: var(--gray-500);
      font-size: 12px;
      margin-top: 2px;
    }

    .sidebar-logout {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: var(--gray-50);
      color: var(--gray-500);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      border: 1px solid transparent;
    }

    .sidebar-logout:hover {
      background: #fee2e2;
      color: #ef4444;
      border-color: #fca5a5;
    }

    /* ===== Main Area & Top Bar ===== */
    .instructor-main {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
    }

    .instructor-topbar {
      height: 68px;
      background: var(--white);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .topbar-search {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: 10px;
      padding: 10px 16px;
      width: 320px;
      transition: all 0.2s ease;
    }

    .topbar-search:focus-within {
      border-color: var(--primary);
      background: var(--white);
      box-shadow: 0 0 0 3px var(--primary-light);
    }

    .topbar-search i {
      color: var(--gray-400);
      font-size: 14px;
    }

    .topbar-search input {
      border: none;
      background: transparent;
      font-size: 14px;
      color: var(--gray-700);
      width: 100%;
      outline: none;
    }

    .instructor-content {
      flex: 1;
      padding: 28px;
    }
  `]
})
export class InstructorLayoutComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}