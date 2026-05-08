import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { InstructorLayoutComponent } from '../../../layouts/instructor-layout/instructor-layout.component';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, InstructorLayoutComponent],
  template: `
    <app-instructor-layout>
      <div class="dashboard-container">
        <div class="header-section">
          <h1>Tổng quan</h1>
          <p class="subtitle">Chào mừng trở lại, <strong>{{ instructorName }}</strong>! Dưới đây là bức tranh toàn cảnh về lớp học của bạn.</p>
        </div>

        <div *ngIf="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Đang đồng bộ dữ liệu từ hệ thống...</p>
        </div>

        <ng-container *ngIf="!isLoading">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="sc-body">
                <span class="sc-lbl">Tổng học viên</span>
                <span class="sc-val text-primary">{{ stats?.tongHocVien | number:'1.0-0' }}</span>
              </div>
              <div class="icon-wrapper bg-primary-light">
                <i class="fa-solid fa-users text-primary"></i>
              </div>
            </div>

            <div class="stat-card">
              <div class="sc-body">
                <span class="sc-lbl">Doanh thu</span>
                <span class="sc-val text-success" [title]="stats?.tongDoanhThu">{{ formatCurrencyM(stats?.tongDoanhThu || 0) }}</span>
              </div>
              <div class="icon-wrapper bg-success-light">
                <i class="fa-solid fa-coins text-success"></i>
              </div>
            </div>

            <div class="stat-card">
              <div class="sc-body">
                <span class="sc-lbl">Đánh giá TB <span class="text-muted">({{ stats?.tongDanhGia }} lượt)</span></span>
                <span class="sc-val text-warning">{{ stats?.tbDanhGia | number:'1.1-1' }}</span>
              </div>
              <div class="icon-wrapper bg-warning-light">
                <i class="fa-solid fa-star text-warning"></i>
              </div>
            </div>

            <div class="stat-card">
              <div class="sc-body">
                <span class="sc-lbl">Khóa học</span>
                <span class="sc-val text-info">{{ stats?.tongKhoaHoc }}</span>
                <span class="sc-note" *ngIf="draftCount > 0"><i class="fa-solid fa-pen-ruler"></i> {{ draftCount }} bản nháp</span>
              </div>
              <div class="icon-wrapper bg-info-light">
                <i class="fa-solid fa-book-open text-info"></i>
              </div>
            </div>
          </div>

          <div class="section-card">
            <div class="section-header">
              <div class="title-group">
                <div class="title-icon"><i class="fa-solid fa-layer-group"></i></div>
                <h2>Khóa học của tôi</h2>
              </div>
              <a routerLink="/instructor/courses/create" class="btn-create">
                <i class="fa-solid fa-plus"></i> Tạo khóa mới
              </a>
            </div>
            
            <div class="table-responsive">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Thông tin khóa học</th>
                    <th>Trạng thái</th>
                    <th class="text-center">Học viên</th>
                    <th class="text-right">Giá bán</th>
                    <th class="text-center">Đánh giá</th>
                    <th class="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let course of courses" class="course-row">
                    <td (click)="editCourse(course.maKhoaHoc || course.id)">
                      <div class="course-profile">
                        <div class="course-thumb" [style.background-image]="course.anhUrl ? 'url(' + course.anhUrl + ')' : ''" [class.no-img]="!course.anhUrl">
                          <i class="fa-solid fa-image" *ngIf="!course.anhUrl"></i>
                        </div>
                        <div class="course-details">
                          <strong>{{ course.tieuDe }}</strong>
                          <span class="category">{{ course.theLoai }}</span>
                        </div>
                      </div>
                    </td>
                    <td (click)="editCourse(course.maKhoaHoc || course.id)">
                      <span class="status-badge" [ngClass]="getStatusClass(course.tinhTrang)">
                        <span class="dot"></span> {{ getStatusLabel(course.tinhTrang) }}
                      </span>
                    </td>
                    <td class="text-center font-medium" (click)="editCourse(course.maKhoaHoc || course.id)">
                      {{ course.soHocVien | number }}
                    </td>
                    <td class="text-right font-medium" (click)="editCourse(course.maKhoaHoc || course.id)">
                      {{ (course.giaGoc) ? (course.giaGoc | currency:'VND':'symbol':'1.0-0') : 'Miễn phí' }}
                    </td>
                    <td class="text-center" (click)="editCourse(course.maKhoaHoc || course.id)">
                      <div class="rating-badge">
                        <i class="fa-solid fa-star"></i> {{ course.tbdanhGia | number:'1.1-1' }}
                      </div>
                    </td>
                    <td>
                      <div class="action-group">
                        <button class="btn-icon btn-light" title="Xem báo cáo" (click)="viewReports()">
                          <i class="fa-solid fa-chart-line"></i>
                        </button>
                        <button *ngIf="course.tinhTrang === 'Draft' || course.tinhTrang === 'Rejected'" 
                                class="btn-action btn-submit" (click)="submitForReview(course)" [disabled]="course._submitting">
                          <i [class]="course._submitting ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-paper-plane'"></i> Gửi duyệt
                        </button>
                        <button *ngIf="course.tinhTrang !== 'Published'" 
                                class="btn-icon btn-danger-light" title="Xóa khóa học" (click)="deleteCourse(course)">
                          <i class="fa-solid fa-trash-can" *ngIf="!course._deleting"></i>
                          <i class="fa-solid fa-spinner fa-spin" *ngIf="course._deleting"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  <tr *ngIf="courses.length === 0">
                    <td colspan="6">
                      <div class="empty-state">
                        <img src="assets/images/empty-courses.svg" alt="No courses" onerror="this.style.display='none'">
                        <div class="empty-icon"><i class="fa-regular fa-folder-open"></i></div>
                        <h3>Chưa có khóa học nào</h3>
                        <p>Bạn chưa tạo khóa học nào. Hãy bắt đầu chia sẻ kiến thức của bạn ngay hôm nay!</p>
                        <a routerLink="/instructor/courses/create" class="btn-create mt-3">Tạo khóa học đầu tiên</a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="analytics-grid">
            <div class="section-card chart-container">
              <div class="section-header">
                <h2>Biểu đồ doanh thu tháng này</h2>
              </div>
              <div class="chart-bars">
                <div *ngFor="let bar of revenueData" class="bar-wrapper group">
                  <div class="tooltip">{{ bar.value }}</div>
                  <div class="bar-track">
                    <div class="bar-fill" [style.height.%]="bar.height"></div>
                  </div>
                  <span class="bar-label">{{ bar.month }}</span>
                </div>
              </div>
            </div>

            <div class="section-card split-container">
              <div class="revenue-split">
                <div class="split-header">
                  <div class="icon-pulse"><i class="fa-solid fa-wallet"></i></div>
                  <h3>Tỷ lệ phân chia</h3>
                </div>
                <div class="split-body">
                  <div class="split-item">
                    <div class="split-info">
                      <span class="dot-indicator bg-success"></span>
                      <span class="split-name">Giảng viên nhận</span>
                    </div>
                    <span class="split-val text-success">70%</span>
                  </div>
                  <div class="split-item">
                    <div class="split-info">
                      <span class="dot-indicator bg-gray"></span>
                      <span class="split-name">Nền tảng giữ lại</span>
                    </div>
                    <span class="split-val text-muted">30%</span>
                  </div>
                </div>
                <div class="split-footer">
                  <i class="fa-regular fa-calendar-check"></i> Thanh toán tự động vào ngày 1 hàng tháng
                </div>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </app-instructor-layout>
  `,
  styles: [`
    :host {
      /* ĐỔI MÀU CHỦ ĐẠO SANG CAM EDULEARN */
      --clr-primary: #ea580c; 
      --clr-primary-light: #fff7ed;
      --clr-success: #10b981;
      --clr-success-light: #d1fae5;
      --clr-warning: #f59e0b;
      --clr-warning-light: #fef3c7;
      --clr-info: #0ea5e9;
      --clr-info-light: #e0f2fe;
      --clr-danger: #ef4444;
      --clr-danger-light: #fee2e2;
      --clr-gray-50: #f9fafb;
      --clr-gray-100: #f3f4f6;
      --clr-gray-200: #e5e7eb;
      --clr-gray-300: #d1d5db;
      --clr-gray-400: #9ca3af;
      --clr-gray-500: #6b7280;
      --clr-gray-800: #1f2937;
      
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
      --radius-lg: 12px;
      --radius-xl: 16px;
    }

    .dashboard-container { padding: 10px; color: var(--clr-gray-800); font-family: 'Inter', sans-serif; }
    .header-section h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
    .subtitle { font-size: 15px; color: var(--clr-gray-500); margin-bottom: 32px; }
    .text-primary { color: var(--clr-primary); }
    .text-success { color: var(--clr-success); }
    .text-warning { color: var(--clr-warning); }
    .text-info { color: var(--clr-info); }
    .text-muted { color: var(--clr-gray-500); }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-medium { font-weight: 600; }

    /* NÚT BẤM CỰC KỲ XỊN XÒ KHÔNG GIỐNG AI CODE */
    .btn-create { 
      background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); 
      color: #fff; 
      padding: 10px 24px; 
      border-radius: 12px; 
      font-size: 14px; 
      font-weight: 600; 
      text-decoration: none; 
      display: inline-flex; 
      align-items: center; 
      gap: 8px; 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
      border: none; 
      cursor: pointer; 
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
    }
    .btn-create:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 6px 16px rgba(234, 88, 12, 0.4); 
      filter: brightness(1.05); 
    }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 32px; }
    .stat-card { background: #fff; border-radius: var(--radius-xl); padding: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-md); border: 1px solid var(--clr-gray-100); transition: transform 0.3s ease; }
    .stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
    .sc-body { display: flex; flex-direction: column; gap: 8px; }
    .sc-lbl { font-size: 14px; color: var(--clr-gray-500); font-weight: 500; }
    .sc-val { font-size: 32px; font-weight: 800; line-height: 1; letter-spacing: -1px; }
    .sc-note { font-size: 12px; color: var(--clr-warning); display: flex; align-items: center; gap: 4px; margin-top: 4px; font-weight: 600; }
    .icon-wrapper { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .bg-primary-light { background: var(--clr-primary-light); }
    .bg-success-light { background: var(--clr-success-light); }
    .bg-warning-light { background: var(--clr-warning-light); }
    .bg-info-light { background: var(--clr-info-light); }

    .section-card { background: #fff; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); border: 1px solid var(--clr-gray-100); padding: 24px; margin-bottom: 32px; overflow: hidden; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .title-group { display: flex; align-items: center; gap: 12px; }
    .title-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--clr-gray-50); color: var(--clr-gray-800); display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .section-header h2 { font-size: 18px; font-weight: 700; margin: 0; }

    .btn-action { padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; }
    .btn-submit { background: var(--clr-primary-light); color: var(--clr-primary); }
    .btn-submit:hover:not(:disabled) { background: var(--clr-primary); color: #fff; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-icon { width: 34px; height: 34px; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; font-size: 14px; }
    .btn-light { background: var(--clr-gray-100); color: var(--clr-gray-500); }
    .btn-light:hover { background: var(--clr-info-light); color: var(--clr-info); }
    .btn-danger-light { background: transparent; color: var(--clr-gray-300); }
    .btn-danger-light:hover { background: var(--clr-danger-light); color: var(--clr-danger); }

    .table-responsive { overflow-x: auto; margin: -10px; padding: 10px; }
    .modern-table { width: 100%; border-collapse: separate; border-spacing: 0; }
    .modern-table th { font-size: 13px; font-weight: 600; color: var(--clr-gray-500); text-transform: uppercase; letter-spacing: 0.5px; padding: 16px; border-bottom: 2px solid var(--clr-gray-100); }
    .modern-table td { padding: 16px; vertical-align: middle; border-bottom: 1px dashed var(--clr-gray-100); transition: background 0.2s; }
    .course-row:hover td { background: var(--clr-gray-50); }
    .course-row:last-child td { border-bottom: none; }

    .course-profile { display: flex; align-items: center; gap: 16px; cursor: pointer; }
    .course-thumb { width: 64px; height: 44px; border-radius: 8px; background-size: cover; background-position: center; border: 1px solid var(--clr-gray-100); box-shadow: var(--shadow-sm); }
    .course-thumb.no-img { background: var(--clr-gray-50); display: flex; align-items: center; justify-content: center; color: var(--clr-gray-300); font-size: 20px; }
    .course-details { display: flex; flex-direction: column; gap: 4px; }
    .course-details strong { font-size: 15px; color: var(--clr-gray-800); }
    .course-row:hover .course-details strong { color: var(--clr-primary); }
    .category { font-size: 12px; color: var(--clr-gray-500); background: var(--clr-gray-100); padding: 2px 8px; border-radius: 12px; align-self: flex-start; }

    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .dot { width: 6px; height: 6px; border-radius: 50%; }
    .badge-success { background: var(--clr-success-light); color: #047857; }
    .badge-success .dot { background: var(--clr-success); }
    .badge-warning { background: var(--clr-warning-light); color: #b45309; }
    .badge-warning .dot { background: var(--clr-warning); }
    .badge-danger { background: var(--clr-danger-light); color: #b91c1c; }
    .badge-danger .dot { background: var(--clr-danger); }
    .rating-badge { display: inline-flex; align-items: center; gap: 4px; background: #fffbeb; color: #d97706; padding: 4px 10px; border-radius: 8px; font-weight: 600; font-size: 13px; border: 1px solid #fef3c7; }
    .action-group { display: flex; align-items: center; justify-content: center; gap: 8px; }

    .empty-state { padding: 60px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .empty-icon { width: 80px; height: 80px; border-radius: 50%; background: var(--clr-primary-light); display: flex; align-items: center; justify-content: center; font-size: 32px; color: var(--clr-primary); margin-bottom: 16px; }
    .empty-state h3 { font-size: 18px; font-weight: 700; margin: 0; }
    .empty-state p { color: var(--clr-gray-500); font-size: 14px; max-width: 400px; margin: 0 auto; line-height: 1.5; }

    .analytics-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
    .chart-container { display: flex; flex-direction: column; }
    .chart-bars { flex: 1; display: flex; align-items: flex-end; gap: 20px; padding: 20px 10px; min-height: 250px; border-top: 1px solid var(--clr-gray-50); border-bottom: 1px solid var(--clr-gray-50); }
    .bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; position: relative; cursor: pointer; }
    .bar-track { width: 100%; max-width: 48px; background: var(--clr-gray-100); border-radius: 8px; height: 100%; display: flex; align-items: flex-end; overflow: hidden; }
    .bar-fill { width: 100%; background: linear-gradient(180deg, var(--clr-primary) 0%, #fb923c 100%); border-radius: 8px; transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
    .bar-wrapper:hover .bar-fill { filter: brightness(1.1); box-shadow: 0 0 12px rgba(234, 88, 12, 0.4); }
    .bar-label { font-size: 12px; font-weight: 500; color: var(--clr-gray-500); margin-top: 12px; }
    .tooltip { position: absolute; top: -30px; background: var(--clr-gray-800); color: #fff; font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 4px; opacity: 0; transform: translateY(10px); transition: all 0.2s; pointer-events: none; white-space: nowrap; }
    .bar-wrapper:hover .tooltip { opacity: 1; transform: translateY(0); }

    /* CHỖ NÀY LÀ KHỐI TỶ LỆ PHÂN CHIA (TRẮNG SÁNG, KHÔNG CÒN MÀU ĐEN NỮA) */
    .split-container { background: #ffffff; color: var(--clr-gray-800); border: 1px solid var(--clr-gray-100); display: flex; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); }
    .revenue-split { display: flex; flex-direction: column; width: 100%; justify-content: space-between; padding: 24px; }
    .split-header { display: flex; align-items: center; gap: 12px; margin-bottom: 30px; }
    .icon-pulse { width: 40px; height: 40px; border-radius: 12px; background: var(--clr-success-light); display: flex; align-items: center; justify-content: center; font-size: 18px; color: var(--clr-success); }
    .split-header h3 { font-size: 18px; font-weight: 700; margin: 0; color: var(--clr-gray-800); }
    .split-body { display: flex; flex-direction: column; gap: 20px; margin-bottom: 40px; }
    .split-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px dashed var(--clr-gray-200); }
    .split-item:last-child { border-bottom: none; }
    .split-info { display: flex; align-items: center; gap: 10px; }
    .dot-indicator { width: 10px; height: 10px; border-radius: 50%; }
    .bg-gray { background: var(--clr-gray-400); }
    .split-name { font-size: 15px; color: var(--clr-gray-600); font-weight: 500;}
    .split-val { font-size: 24px; font-weight: 800; }
    .split-footer { font-size: 13px; color: var(--clr-gray-500); display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--clr-gray-50); padding: 12px; border-radius: var(--radius-lg); border: 1px solid var(--clr-gray-100); }

    .loading-state { padding: 60px; text-align: center; color: var(--clr-gray-500); display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--clr-gray-100); border-top-color: var(--clr-primary); border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 1024px) {
      .analytics-grid { grid-template-columns: 1fr; }
      .split-container { min-height: 250px; }
    }
  `]
})




export class InstructorDashboardComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  isLoading = true;
  stats: any = null;
  courses: any[] = [];
  draftCount = 0;
  instructorName = '';

  revenueData: any[] = [];

  ngOnInit() {
    // Get instructor name from Auth
    const currentUser = this.auth.currentUser();
    this.instructorName = currentUser?.userName || 'Giảng viên';

    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    // Fetch Stats
    this.api.getInstructorStats().subscribe({
      next: (res) => this.stats = res,
      error: (err) => console.error('Failed to load stats', err)
    });

    // Fetch Revenue Series
    this.api.getRevenueSeries().subscribe({
      next: (res) => {
        const maxRev = Math.max(...res.map((r: any) => r.revenue)) || 1;
        this.revenueData = res.map((r: any) => ({
          month: r.month,
          value: r.revenue > 0 ? this.formatCurrencyM(r.revenue) : '0',
          height: r.revenue > 0 ? Math.max((r.revenue / maxRev) * 100, 5) : 0
        }));
      },
      error: (err) => console.error('Failed to load revenue series', err)
    });

    // Fetch Courses
    this.api.getInstructorCourses().subscribe({
      next: (res) => {
        this.courses = res || [];
        // Calculate draft count
        this.draftCount = this.courses.filter(c => c.tinhTrang === 'Draft').length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load courses', err);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Published': 'badge-success',
      'Draft': 'badge-warning',
      'Pending': 'badge-danger'
    };
    return map[status] || 'badge-warning';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'Published': ' Đã xuất bản',
      'Draft': ' Bản nháp',
      'Pending': ' Chờ duyệt'
    };
    return map[status] || status;
  }

  formatCurrencyM(value: number): string {
    if (value >= 1000000) {
      return 'đ' + (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
      return 'đ' + (value / 1000).toFixed(0) + 'k';
    }
    return 'đ' + value;
  }

  editCourse(id: number) {
    this.router.navigate(['/instructor/courses/edit', id]);
  }

  submitForReview(course: any) {
    Swal.fire({
      title: 'Xác nhận gửi duyệt?',
      text: "Khóa học sẽ được gửi cho quản trị viên xem xét. Bạn sẽ không thể chỉnh sửa trong khi chờ duyệt.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#5B63D3',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Đúng, gửi duyệt!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        course._submitting = true;
        this.api.submitCourseForReview(course.maKhoaHoc || course.id).subscribe({
          next: (res) => {
            Swal.fire('Thành công', res.message, 'success');
            course.tinhTrang = 'Pending';
            course._submitting = false;
          },
          error: (err) => {
            console.error('Submission error:', err);
            let msg = 'Có lỗi xảy ra khi gửi duyệt.';
            if (err.error?.message) msg = err.error.message;
            else if (typeof err.error === 'string') msg = err.error;
            else if (err.message) msg = err.message;

            Swal.fire('Thất bại', msg, 'error');
            course._submitting = false;
          }
        });
      }
    });
  }
  viewReports() {
    this.router.navigate(['/instructor/reports']);
  }

  deleteCourse(course: any) {
    const id = course.maKhoaHoc || course.id;
    if (!id) return;

    Swal.fire({
      title: 'Xóa khóa học?',
      text: `Bạn có chắc chắn muốn xóa khóa học "${course.tieuDe}" không? Thao tác này không thể hoàn tác.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        course._deleting = true;
        this.api.deleteCourse(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Đã xóa!',
              text: 'Khóa học của bạn đã được gỡ bỏ.',
              icon: 'success',
              confirmButtonColor: '#FF7B54'
            });
            this.courses = this.courses.filter(c => (c.maKhoaHoc || c.id) !== id);
            this.draftCount = this.courses.filter(c => c.tinhTrang === 'Draft').length;
          },
          error: (err) => {
            course._deleting = false;
            Swal.fire('Lỗi', err.error?.message || 'Không thể xóa khóa học lúc này.', 'error');
          }
        });
      }
    });
  }
}
