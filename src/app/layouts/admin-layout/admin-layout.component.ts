import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-brand">
          <a routerLink="/" class="brand-link">
            <span class="brand-icon">E</span>
            <span class="brand-text">EduLearn</span>
          </a>
          <span class="brand-badge">Admin Panel</span>
        </div>

        <div class="sidebar-section-label">MENU CHÍNH</div>
        <nav class="admin-nav">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><i class="fa-solid fa-chart-pie"></i></span>
            <span class="nav-text">Tổng quan</span>
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><i class="fa-solid fa-users"></i></span>
            <span class="nav-text">Người dùng</span>
          </a>
          <a routerLink="/admin/categories" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><i class="fa-solid fa-folder-open"></i></span>
            <span class="nav-text">Thể loại</span>
          </a>
          <a routerLink="/admin/courses/approvals" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><i class="fa-solid fa-clipboard-check"></i></span>
            <span class="nav-text">Duyệt khóa học</span>
          </a>
          <a routerLink="/admin/promotions" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><i class="fa-solid fa-gift"></i></span>
            <span class="nav-text">Khuyến mãi</span>
          </a>
        </nav>

        <div class="sidebar-section-label">HỆ THỐNG</div>
        <nav class="admin-nav">
          <a routerLink="/admin/reports" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><i class="fa-solid fa-chart-line"></i></span>
            <span class="nav-text">Báo cáo</span>
          </a>
          <a routerLink="/admin/settings" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><i class="fa-solid fa-gear"></i></span>
            <span class="nav-text">Cài đặt</span>
          </a>
        </nav>

        <div class="sidebar-bottom">
          <div class="sidebar-user-card">
            <div class="sidebar-user-avatar">AD</div>
            <div class="sidebar-user-info">
              <span class="sidebar-user-name">Admin</span>
              <span class="sidebar-user-role">Quản trị viên</span>
            </div>
            <button class="sidebar-logout" title="Đăng xuất" (click)="logout()">
              <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Area -->
      <div class="admin-main">
        <!-- Top Bar -->
        <header class="admin-topbar">
          <div class="topbar-left">
            <div class="topbar-search">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Tìm kiếm...">
            </div>
          </div>
          <div class="topbar-right">
          </div>
        </header>

        <!-- Content -->
        <main class="admin-content">
          <ng-content></ng-content>
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Layout ===== */
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: #F0F2F5;
    }

    /* ===== Sidebar ===== */
    .admin-sidebar {
      width: 260px;
      background: var(--white);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 50;
      overflow-y: auto;
      border-right: 1px solid var(--gray-200);
      box-shadow: 2px 0 10px rgba(0,0,0,0.02);
    }

    .sidebar-brand {
      padding: 24px 20px 20px;
      border-bottom: 1px solid var(--gray-100);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #0f172a;
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 4px;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      font-size: 18px;
      font-weight: 900;
      color: white;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
    }

    .brand-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      color: var(--primary);
      background: var(--primary-bg);
      padding: 4px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-left: 45px;
    }

    .sidebar-section-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--gray-400);
      letter-spacing: 1px;
      padding: 16px 24px 8px;
      text-transform: uppercase;
    }

    /* ===== Nav Items ===== */
    .admin-nav {
      display: flex;
      flex-direction: column;
      padding: 0 16px;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      color: var(--gray-600);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .nav-item:hover {
      color: var(--gray-800);
      background: var(--gray-50);
    }

    .nav-item.active {
      color: var(--primary);
      background: var(--primary-bg);
    }

    .nav-item.active .nav-icon {
      color: var(--primary);
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: -16px;
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
      color: var(--gray-400);
      transition: color 0.2s ease;
    }

    .nav-text {
      flex: 1;
    }

    /* ===== Sidebar Bottom User Card ===== */
    .sidebar-bottom {
      margin-top: auto;
      padding: 20px 16px;
      border-top: 1px solid var(--gray-100);
    }

    .sidebar-user-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      background: var(--white);
      border: 1px solid var(--gray-200);
      box-shadow: 0 2px 5px rgba(0,0,0,0.02);
    }

    .sidebar-user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--primary-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      font-weight: 800;
      font-size: 13px;
      flex-shrink: 0;
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
    }

    .sidebar-logout {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--white);
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
      background: var(--danger-light);
      color: var(--danger);
      border-color: var(--danger-light);
    }

    /* ===== Main Area ===== */
    .admin-main {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
    }

    /* ===== Top Bar ===== */
    .admin-topbar {
      height: 64px;
      background: var(--white);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      position: sticky;
      top: 0;
      z-index: 40;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .topbar-left {
      display: flex;
      align-items: center;
    }

    .topbar-search {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: 10px;
      padding: 9px 16px;
      width: 300px;
      transition: all 0.25s ease;
    }

    .topbar-search:focus-within {
      border-color: var(--primary);
      background: var(--white);
      box-shadow: 0 0 0 3px rgba(91, 99, 211, 0.1);
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
    }

    .topbar-search input::placeholder {
      color: var(--gray-400);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .topbar-icon-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: transparent;
      border: none;
      color: var(--gray-500);
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .topbar-icon-btn:hover {
      background: var(--gray-100);
      color: var(--primary);
    }

    .notif-dot {
      position: absolute;
      top: 9px;
      right: 10px;
      width: 8px;
      height: 8px;
      background: var(--danger);
      border-radius: 50%;
      border: 2px solid var(--white);
    }

    .topbar-divider {
      width: 1px;
      height: 28px;
      background: var(--gray-200);
      margin: 0 10px;
    }

    .topbar-user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px 6px 6px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .topbar-user:hover {
      background: var(--gray-100);
    }

    .topbar-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 13px;
    }

    .topbar-username {
      font-weight: 700;
      font-size: 14px;
      color: var(--gray-800);
    }

    /* ===== Content ===== */
    .admin-content {
      flex: 1;
      padding: 28px;
    }
  `]
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
