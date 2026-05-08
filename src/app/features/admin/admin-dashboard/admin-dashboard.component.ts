import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminLayoutComponent } from '../../../layouts/admin-layout/admin-layout.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1>Tổng quan hệ thống</h1>
          <p class="page-subtitle">
            <i class="fa-regular fa-clock"></i>
            Cập nhật lần cuối: 18/03/2026 • <span class="live-dot"></span> Thời gian thực
          </p>
        </div>
        <div class="page-header-right">
          <button class="header-action-btn">
            <i class="fa-solid fa-download"></i> Xuất báo cáo
          </button>
          <button class="header-action-btn primary">
            <i class="fa-solid fa-plus"></i> Thêm mới
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div *ngFor="let stat of statsCards; let i = index"
             class="stat-card"
             [ngClass]="'stat-' + stat.theme">
          <div class="stat-icon-wrapper" [ngClass]="'icon-' + stat.theme">
            <i [class]="stat.icon"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value">{{ stat.value }}</span>
            <div class="stat-trend" [ngClass]="stat.trendUp ? 'trend-up' : 'trend-down'">
              <i [class]="stat.trendUp ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"></i>
              <span>{{ stat.trend }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="dashboard-grid">
        <!-- Left: Pending Courses -->
        <div class="dashboard-card pending-section">
          <div class="card-header">
            <div class="card-title">
              <div class="card-title-icon blue">
                <i class="fa-solid fa-clipboard-list"></i>
              </div>
              <div>
                <h2>Khóa học chờ duyệt</h2>
                <span class="card-title-count">{{ totalPendingCount }} yêu cầu</span>
              </div>
            </div>
            <a class="see-all-link" (click)="goToApprovals()">
              Xem tất cả <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
          <div class="pending-list">
            <div *ngFor="let item of pendingCourses; let i = index"
                 class="pending-item"
                 [style.animation-delay]="(i * 0.1) + 's'">
              <div class="pending-item-top">
                <div class="pending-meta">
                  <h3 class="pending-name">{{ item.name }}</h3>
                  <div class="pending-details">
                    <span class="pending-detail-item">
                      <i class="fa-solid fa-user"></i> {{ item.instructor }}
                    </span>
                    <span class="pending-detail-item">
                      <i class="fa-solid fa-tag"></i> {{ item.category }}
                    </span>
                    <span class="pending-detail-item price">
                      <i class="fa-solid fa-coins"></i> {{ item.price }}
                    </span>
                    <span class="pending-detail-item">
                      <i class="fa-regular fa-calendar"></i> {{ item.date }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="pending-actions">
                <button class="action-btn approve" (click)="approveCourse(item)" [disabled]="item._saving">
                  <i [class]="item._saving ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-check'"></i> Duyệt
                </button>
                <button class="action-btn reject" (click)="rejectCourse(item)" [disabled]="item._saving">
                  <i class="fa-solid fa-xmark"></i> Từ chối
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: New Instructors -->
        <div class="dashboard-card instructors-section">
          <div class="card-header">
            <div class="card-title">
              <div class="card-title-icon green">
                <i class="fa-solid fa-chalkboard-user"></i>
              </div>
              <div>
                <h2>Giảng viên mới</h2>
                <span class="card-title-count">{{ newInstructors.length }} đăng ký</span>
              </div>
            </div>
          </div>
          <div class="instructor-list">
            <div *ngFor="let inst of newInstructors; let i = index"
                 class="instructor-item"
                 [style.animation-delay]="(i * 0.1) + 's'">
              <div class="instructor-avatar" [style.background]="inst.gradient">
                {{ inst.initials }}
              </div>
              <div class="instructor-info">
                <strong>{{ inst.name }}</strong>
                <span class="instructor-email">{{ inst.email }}</span>
                <span class="instructor-date">
                  <i class="fa-regular fa-calendar"></i> {{ inst.date }}
                </span>
              </div>
              <div class="instructor-actions">
                <button class="inst-action-btn approve" title="Duyệt">
                  <i class="fa-solid fa-check"></i>
                </button>
                <button class="inst-action-btn reject" title="Từ chối">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div class="toast" *ngIf="toastMessage" [class.error]="toastType === 'error'" (click)="toastMessage = ''">
        <i [class]="toastType === 'error' ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-circle-check'"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    /* ===== Page Header ===== */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
    }

    h1 {
      font-size: 26px;
      font-weight: 800;
      color: var(--gray-800);
      margin-bottom: 6px;
      letter-spacing: -0.3px;
    }

    .page-subtitle {
      font-size: 13px;
      color: var(--gray-500);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .live-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      background: #28A745;
      border-radius: 50%;
      animation: pulse-dot 2s ease-in-out infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.5); }
      50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(40, 167, 69, 0); }
    }

    .page-header-right {
      display: flex;
      gap: 10px;
    }

    .header-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid var(--gray-200);
      background: var(--white);
      color: var(--gray-600);
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .header-action-btn:hover {
      border-color: var(--gray-300);
      background: var(--gray-50);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .header-action-btn.primary {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      color: white;
      border: none;
    }

    .header-action-btn.primary:hover {
      box-shadow: 0 4px 16px rgba(91, 99, 211, 0.35);
    }

    /* ===== Stats Grid ===== */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: var(--white);
      border-radius: 16px;
      padding: 22px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      border: 1px solid var(--gray-200);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      border-radius: 16px 16px 0 0;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      border-color: transparent;
    }

    .stat-card:hover::before {
      opacity: 1;
    }

    .stat-blue::before { background: linear-gradient(90deg, var(--primary), var(--primary-light)); }
    .stat-green::before { background: linear-gradient(90deg, #28A745, #5BD67A); }
    .stat-orange::before { background: linear-gradient(90deg, #FD7E14, #FDAA5E); }
    .stat-purple::before { background: linear-gradient(90deg, #8B5CF6, #A78BFA); }

    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .icon-blue {
      background: rgba(234, 88, 12, 0.12);
      color: var(--primary);
    }

    .icon-green {
      background: linear-gradient(135deg, rgba(40, 167, 69, 0.12) 0%, rgba(91, 214, 122, 0.08) 100%);
      color: #28A745;
    }

    .icon-orange {
      background: linear-gradient(135deg, rgba(253, 126, 20, 0.12) 0%, rgba(253, 170, 94, 0.08) 100%);
      color: #FD7E14;
    }

    .icon-purple {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(167, 139, 250, 0.08) 100%);
      color: #8B5CF6;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 13px;
      color: var(--gray-500);
      font-weight: 500;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 800;
      color: var(--gray-800);
      line-height: 1.1;
      letter-spacing: -0.5px;
    }

    .stat-trend {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .trend-up {
      color: #28A745;
      background: rgba(40, 167, 69, 0.08);
    }

    .trend-down {
      color: #DC3545;
      background: rgba(220, 53, 69, 0.08);
    }

    /* ===== Dashboard Grid ===== */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 20px;
      margin-bottom: 24px;
    }

    /* ===== Dashboard Card ===== */
    .dashboard-card {
      background: var(--white);
      border-radius: 16px;
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 22px;
      border-bottom: 1px solid var(--gray-100);
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-title-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .card-title-icon.blue {
      background: rgba(234, 88, 12, 0.12);
      color: var(--primary);
    }

    .card-title-icon.green {
      background: linear-gradient(135deg, rgba(40, 167, 69, 0.12) 0%, rgba(40, 167, 69, 0.06) 100%);
      color: #28A745;
    }

    .card-title-icon.purple {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%);
      color: #8B5CF6;
    }

    .card-title h2 {
      font-size: 16px;
      font-weight: 700;
      color: var(--gray-800);
      margin: 0;
      line-height: 1.3;
    }

    .card-title-count {
      font-size: 12px;
      color: var(--gray-400);
      font-weight: 500;
    }

    .see-all-link {
      font-size: 13px;
      color: var(--primary);
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .see-all-link:hover {
      color: var(--primary-dark);
      gap: 10px;
    }

    /* ===== Pending Courses ===== */
    .pending-list {
      padding: 8px 16px 16px;
    }

    .pending-item {
      padding: 16px;
      margin-bottom: 8px;
      border-radius: 12px;
      background: var(--white);
      border: 1px solid var(--gray-100);
      transition: all 0.25s ease;
      animation: fadeSlideIn 0.4s ease forwards;
      opacity: 0;
    }

    .pending-item:hover {
      border-color: var(--gray-200);
      background: var(--gray-50);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .pending-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--gray-800);
      margin-bottom: 8px;
    }

    .pending-details {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 12px;
    }

    .pending-detail-item {
      font-size: 12px;
      color: var(--gray-500);
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .pending-detail-item.price {
      color: var(--primary);
      font-weight: 600;
    }

    .pending-detail-item i {
      font-size: 11px;
      opacity: 0.7;
    }

    .pending-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .action-btn.approve {
      background: linear-gradient(135deg, #28A745 0%, #34D058 100%);
      color: white;
    }

    .action-btn.approve:hover {
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
      transform: translateY(-1px);
    }

    .action-btn.reject {
      background: linear-gradient(135deg, #DC3545 0%, #E4606D 100%);
      color: white;
    }

    .action-btn.reject:hover {
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
      transform: translateY(-1px);
    }

    .action-btn.view {
      background: var(--gray-100);
      color: var(--gray-600);
      border: 1px solid var(--gray-200);
    }

    .action-btn.view:hover {
      background: var(--gray-200);
      transform: translateY(-1px);
    }

    /* ===== Instructors ===== */
    .instructor-list {
      padding: 8px 16px 16px;
    }

    .instructor-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border-radius: 12px;
      margin-bottom: 8px;
      border: 1px solid var(--gray-100);
      transition: all 0.25s ease;
      animation: fadeSlideIn 0.4s ease forwards;
      opacity: 0;
    }

    .instructor-item:hover {
      background: var(--gray-50);
      border-color: var(--gray-200);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .instructor-avatar {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 13px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .instructor-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .instructor-info strong {
      font-size: 14px;
      color: var(--gray-800);
    }

    .instructor-email {
      font-size: 12px;
      color: var(--gray-400);
    }

    .instructor-date {
      font-size: 11px;
      color: var(--gray-400);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .instructor-actions {
      display: flex;
      gap: 6px;
    }

    .inst-action-btn {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .inst-action-btn.approve {
      background: rgba(40, 167, 69, 0.1);
      color: #28A745;
    }

    .inst-action-btn.approve:hover {
      background: #28A745;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }

    .inst-action-btn.reject {
      background: rgba(220, 53, 69, 0.08);
      color: #DC3545;
    }

    .inst-action-btn.reject:hover {
      background: #DC3545;
      color: white;
    }

    /* Toast */
    .toast {
      position: fixed; bottom: 32px; right: 32px; background: var(--gray-800); color: white;
      padding: 14px 24px; border-radius: 14px; display: flex; align-items: center; gap: 10px;
      font-size: 14px; font-weight: 600; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      animation: toastSlide 0.4s ease; cursor: pointer; z-index: 1000;
    }
    .toast i { color: #28A745; font-size: 18px; }
    .toast.error { background: #DC3545; }
    .toast.error i { color: white; }
    @keyframes toastSlide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  statsCards: any[] = [
    {
      label: 'Tổng học viên',
      value: '...',
      trend: 'Đang tải',
      trendUp: true,
      icon: 'fa-solid fa-users',
      theme: 'blue'
    },
    {
      label: 'Giảng viên',
      value: '...',
      trend: 'Đang tải',
      trendUp: true,
      icon: 'fa-solid fa-chalkboard-user',
      theme: 'green'
    },
    {
      label: 'Kiến thức (Khóa học)',
      value: '...',
      trend: 'Đang tải',
      trendUp: true,
      icon: 'fa-solid fa-book-open',
      theme: 'orange'
    },
    {
      label: 'Doanh thu phí sàn (30%)',
      value: '...',
      trend: 'Cập nhật mới',
      trendUp: true,
      icon: 'fa-solid fa-vault',
      theme: 'green'
    }
  ];

  pendingCourses: any[] = [];
  totalPendingCount = 0;
  newInstructors: any[] = [];

  ngOnInit() {
    this.loadStats();
    this.loadPendingCourses();
    this.loadNewInstructors();
  }

  loadStats() {
    this.api.getUserStats().subscribe((res: any) => {
      this.statsCards[0].value = res.totalUsers?.toString() || '0';
      this.statsCards[0].trend = 'Cập nhật mới';
      
      this.statsCards[1].value = res.instructors?.toString() || '0';
      this.statsCards[1].trend = 'Cập nhật mới';

      // Format currency
      const formatCurrencyM = (value: number) => {
        if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M đ';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'k đ';
        return value.toString() + 'đ';
      };

      this.statsCards[3].value = formatCurrencyM(res.adminRevenue || 0);
      this.statsCards[3].trend = 'Từ chiết khấu';
    });


    this.api.getCourses({ page: 1, pageSize: 1 }).subscribe(res => {
      this.statsCards[2].value = (res.totalCount || res.data?.length || 0).toString();
      this.statsCards[2].trend = 'Cập nhật mới';
    });
  }

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  loadPendingCourses() {
    this.api.getAdminCourses({ page: 1, pageSize: 5, status: 'Pending' }).subscribe(res => {
      this.totalPendingCount = res.totalCount || 0;
      const data = res.data || [];
      this.pendingCourses = data.map((c: any) => ({
        id: c.maKhoaHoc,
        name: c.tieuDe,
        instructor: c.giangVien?.[0]?.ten || 'Admin',
        category: c.theLoai?.ten || 'N/A',
        price: (c.giaGoc || 0).toLocaleString('vi-VN') + 'đ',
        date: c.ngayTao ? new Date(c.ngayTao).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
        _saving: false
      }));
    });
  }

  loadNewInstructors() {
    this.api.getUsers(1, 20).subscribe(res => {
      const gvUsers = (res.data || []).filter((u: any) => u.vaiTro === 'GiaoVien').slice(0, 5);
      this.newInstructors = gvUsers.map((u: any, index: number) => {
        const initials = u.ten ? u.ten.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'KV';
        const gradients = [
          'linear-gradient(135deg, #28A745, #5BD67A)',
          'linear-gradient(135deg, var(--primary), var(--primary-light))',
          'linear-gradient(135deg, #FD7E14, #FDAA5E)',
          'linear-gradient(135deg, #8B5CF6, #A78BFA)'
        ];
        return {
          name: u.ten || 'Chưa cập nhật',
          email: u.email || '',
          date: u.ngayTao ? new Date(u.ngayTao).toLocaleDateString('vi-VN') : 'Mới đây',
          initials: initials,
          gradient: gradients[index % gradients.length]
        };
      });
    });
  }

  approveCourse(item: any) {
    if (!item.id) return;
    item._saving = true;
    this.api.updateCourseStatus(item.id, 'Published').subscribe({
      next: (res) => {
        this.showToast(res.message || 'Đã duyệt khóa học!');
        this.pendingCourses = this.pendingCourses.filter(c => c.id !== item.id);
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Lỗi khi duyệt', 'error');
        item._saving = false;
      }
    });
  }

  rejectCourse(item: any) {
    if (!item.id) return;
    item._saving = true;
    this.api.updateCourseStatus(item.id, 'Rejected').subscribe({
      next: (res) => {
        this.showToast(res.message || 'Đã từ chối khóa học!');
        this.pendingCourses = this.pendingCourses.filter(c => c.id !== item.id);
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Lỗi khi từ chối', 'error');
        item._saving = false;
      }
    });
  }

  private showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => this.toastMessage = '', 4000);
  }

  goToApprovals() {
    this.router.navigate(['/admin/courses/approvals']);
  }
}
