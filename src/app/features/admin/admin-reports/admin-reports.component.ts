import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AdminLayoutComponent } from '../../../layouts/admin-layout/admin-layout.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <!-- Page Header -->
      <div class="page-header no-print">
        <div class="page-header-left">
          <h1>Báo cáo & Thống kê</h1>
          <p class="page-subtitle">
            <i class="fa-regular fa-clock"></i>
            Dữ liệu Phạm vi: {{ selectedRange }} • <span class="live-dot"></span> Cập nhật tự động
          </p>
        </div>
        <div class="page-header-right">
          <div class="dropdown-wrapper">
            <div class="date-range-picker" (click)="toggleDropdown()">
              <i class="fa-regular fa-calendar"></i>
              <span>{{ selectedRange }}</span>
              <i class="fa-solid fa-chevron-down" style="font-size: 10px;"></i>
            </div>
            <div class="range-dropdown card" *ngIf="isDropdownOpen">
              <div class="range-item" *ngFor="let r of ranges" (click)="selectRange(r)">{{ r }}</div>
            </div>
          </div>
          <button class="header-action-btn" (click)="exportPDF()">
            <i class="fa-solid fa-download"></i> Xuất PDF
          </button>
          <button class="header-action-btn primary" (click)="exportExcel()">
            <i class="fa-solid fa-file-excel"></i> Xuất Excel
          </button>
        </div>
      </div>

      <!-- Print Header -->
      <div class="print-only-header">
         <h1>BÁO CÁO HỆ THỐNG EDULEARN</h1>
         <p>Ngày xuất: {{ today | date:'dd/MM/yyyy HH:mm' }} • Phạm vi: {{ selectedRange }}</p>
         <hr>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div *ngFor="let kpi of kpiCards; let i = index"
             class="kpi-card"
             [style.animation-delay]="(i * 0.08) + 's'">
          <div class="kpi-header">
            <div class="kpi-icon" [ngClass]="'kpi-' + kpi.theme">
              <i [class]="kpi.icon"></i>
            </div>
            <div class="kpi-trend" [ngClass]="kpi.trendUp ? 'up' : 'down'">
              <i [class]="kpi.trendUp ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"></i>
              {{ kpi.trend }}
            </div>
          </div>
          <div class="kpi-value">{{ kpi.value }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
          <div class="kpi-sparkline">
            <div *ngFor="let h of kpi.sparkline" class="spark-bar" [style.height.%]="h"></div>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="bottom-row">
        <!-- Top Courses -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-title">
              <div class="chart-title-icon orange"><i class="fa-solid fa-trophy"></i></div>
              <div>
                <h2>Top Doanh Thu Khóa Học</h2>
                <span class="chart-subtitle">Top 5 khóa học mang lại doanh thu cao nhất</span>
              </div>
            </div>
          </div>
          <div class="top-courses-list">
            <div *ngFor="let course of topCourses; let i = index" class="top-course-item">
              <div class="rank-badge" [ngClass]="'rank-' + (i + 1)">{{ i + 1 }}</div>
              <div class="top-course-info">
                <strong>{{ course.name }}</strong>
                <span>{{ course.instructor }} • {{ course.category }}</span>
              </div>
              <div class="top-course-revenue">
                <strong>{{ course.adminRevenue | currency:'VND':'symbol':'1.0-0' }}</strong>
                <!-- <span style="display:block; font-size:11px; color:#6B7280; margin-top:2px;">(Admin 30%)</span> -->
              </div>
            </div>
          </div>
        </div>

        <!-- Category Distribution -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div class="chart-title">
              <div class="chart-title-icon blue"><i class="fa-solid fa-chart-pie"></i></div>
              <div>
                <h2>Phân bố danh mục</h2>
                <span class="chart-subtitle">Theo số lượng khóa học</span>
              </div>
            </div>
          </div>
          <div class="category-dist-list">
            <div *ngFor="let cat of categoryDistribution; let i = index"
                 class="cat-dist-item"
                 [style.animation-delay]="(i * 0.08) + 's'">
              <div class="cat-dist-icon" [style.background]="cat.color + '18'" [style.color]="cat.color">
                <i [class]="cat.icon"></i>
              </div>
              <div class="cat-dist-info">
                <div class="cat-dist-name">
                  <strong>{{ cat.name }}</strong>
                  <span>{{ cat.count }} khóa học</span>
                </div>
                <div class="cat-dist-bar-wrapper">
                  <div class="cat-dist-bar">
                    <div class="cat-dist-fill" [style.width.%]="cat.pct" [style.background]="cat.color"></div>
                  </div>
                  <span class="cat-dist-pct" [style.color]="cat.color">{{ cat.pct }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    /* ===== Page Header ===== */
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    h1 { font-size: 26px; font-weight: 800; color: var(--gray-800); margin-bottom: 6px; letter-spacing: -0.3px; }
    .page-subtitle { font-size: 13px; color: var(--gray-500); display: flex; align-items: center; gap: 6px; }
    
    /* Print Styles */
    .print-only-header { display: none; text-align: center; margin-bottom: 30px; }
    @media print {
      .no-print, .admin-sidebar, .admin-topbar { display: none !important; }
      .admin-main { margin-left: 0 !important; width: 100% !important; padding: 0 !important; }
      .admin-layout { background: white !important; display: block !important; }
      .admin-content { padding: 0 !important; }
      .print-only-header { display: block !important; }
      .kpi-card { border: 1px solid #eee !important; box-shadow: none !important; }
      .kpi-grid { gap: 10px !important; }
      .bottom-row { grid-template-columns: 1fr !important; gap: 40px !important; }
      .kpi-sparkline { display: none; }
    }

    .live-dot { display: inline-block; width: 7px; height: 7px; background: #28A745; border-radius: 50%; animation: pulse-dot 2s ease-in-out infinite; }
    @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .page-header-right { display: flex; gap: 10px; align-items: center; }
    
    /* Dropdown wrapper */
    .dropdown-wrapper { position: relative; }
    .range-dropdown {
      position: absolute; top: 105%; right: 0; width: 220px; z-index: 100;
      padding: 8px; box-shadow: var(--shadow-lg); transition: all 0.2s ease;
    }
    .range-item { padding: 10px 14px; font-size: 13px; color: var(--gray-700); cursor: pointer; border-radius: 8px; }
    .range-item:hover { background: var(--gray-50); color: var(--primary); }

    .date-range-picker {
      display: flex; align-items: center; gap: 8px; padding: 9px 16px;
      border-radius: 10px; border: 1px solid var(--gray-200); background: var(--white);
      font-size: 13px; color: var(--gray-600); cursor: pointer; transition: all 0.2s ease;
    }
    .date-range-picker:hover { border-color: var(--primary); }
    .header-action-btn {
      display: inline-flex; align-items: center; gap: 8px; padding: 9px 18px;
      border-radius: 10px; font-size: 13px; font-weight: 600;
      border: 1px solid var(--gray-200); background: var(--white); color: var(--gray-600);
      cursor: pointer; transition: all 0.25s ease;
    }
    .header-action-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .header-action-btn.primary { background: linear-gradient(135deg, #5B63D3 0%, #7B82E0 100%); color: white; border: none; }
    .header-action-btn.primary:hover { box-shadow: 0 4px 16px rgba(91,99,211,0.35); }

    /* ===== KPI Grid ===== */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 24px; }
    .kpi-card {
      background: var(--white); border-radius: 16px; padding: 20px;
      border: 1px solid var(--gray-200); transition: all 0.3s ease;
      animation: fadeSlideIn 0.5s ease forwards; opacity: 0;
    }
    .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); border-color: transparent; }
    @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .kpi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .kpi-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .kpi-blue { background: rgba(91,99,211,0.1); color: #5B63D3; }
    .kpi-green { background: rgba(40,167,69,0.1); color: #28A745; }
    .kpi-orange { background: rgba(253,126,20,0.1); color: #FD7E14; }
    .kpi-purple { background: rgba(139,92,246,0.1); color: #8B5CF6; }
    .kpi-trend { font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px; }
    .kpi-trend.up { color: #28A745; background: rgba(40,167,69,0.08); }
    .kpi-trend.down { color: #DC3545; background: rgba(220,53,69,0.08); }
    .kpi-value { font-size: 28px; font-weight: 800; color: var(--gray-800); line-height: 1.1; }
    .kpi-label { font-size: 13px; color: var(--gray-500); margin-top: 4px; margin-bottom: 14px; }
    .kpi-sparkline { display: flex; align-items: flex-end; gap: 3px; height: 32px; }
    .spark-bar { flex: 1; background: linear-gradient(180deg, var(--gray-200), var(--gray-300)); border-radius: 2px; min-height: 4px; transition: all 0.3s ease; }
    .kpi-card:hover .spark-bar { background: linear-gradient(180deg, #9DA4F0, #5B63D3); }

    /* ===== Charts ===== */
    .charts-row { display: grid; grid-template-columns: 1.6fr 1fr; gap: 20px; margin-bottom: 24px; }
    .bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .chart-card {
      background: var(--white); border-radius: 16px; border: 1px solid var(--gray-200); overflow: hidden;
    }
    .chart-card-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 22px; border-bottom: 1px solid var(--gray-100); }
    .chart-title { display: flex; align-items: center; gap: 12px; }
    .chart-title-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .chart-title-icon.purple { background: rgba(139,92,246,0.1); color: #8B5CF6; }
    .chart-title-icon.green { background: rgba(40,167,69,0.1); color: #28A745; }
    .chart-title-icon.orange { background: rgba(253,126,20,0.1); color: #FD7E14; }
    .chart-title-icon.blue { background: rgba(91,99,211,0.1); color: #5B63D3; }
    .chart-title h2 { font-size: 16px; font-weight: 700; color: var(--gray-800); margin: 0; }
    .chart-subtitle { font-size: 12px; color: var(--gray-400); }
    .chart-tabs { display: flex; gap: 4px; background: var(--gray-50); padding: 4px; border-radius: 10px; }
    .chart-tab {
      padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
      background: transparent; border: none; color: var(--gray-500); cursor: pointer; transition: all 0.2s ease;
    }
    .chart-tab.active { background: var(--white); color: var(--primary); box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .chart-body { padding: 20px 22px; }

    /* ===== Top Courses ===== */
    .top-courses-list { padding: 8px 16px 16px; }
    .top-course-item {
      display: flex; align-items: center; gap: 14px; padding: 14px 8px;
      border-bottom: 1px solid var(--gray-100); transition: background 0.2s ease;
    }
    .top-course-item:last-child { border-bottom: none; }
    .top-course-item:hover { background: var(--gray-50); border-radius: 10px; }
    .rank-badge {
      width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center;
      justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0;
    }
    .rank-1 { background: linear-gradient(135deg, #F59E0B, #FBBF24); color: white; }
    .rank-2 { background: linear-gradient(135deg, #94A3B8, #CBD5E1); color: white; }
    .rank-3 { background: linear-gradient(135deg, #CD7F32, #DDA15E); color: white; }
    .rank-4, .rank-5 { background: var(--gray-100); color: var(--gray-500); }
    .top-course-info { flex: 1; min-width: 0; }
    .top-course-info strong { display: block; font-size: 14px; color: var(--gray-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .top-course-info span { font-size: 12px; color: var(--gray-400); }
    .top-course-revenue { text-align: right; min-width: 100px; }
    .top-course-revenue strong { font-size: 14px; color: var(--primary); display: block; margin-bottom: 4px; }
    .revenue-bar-mini { height: 4px; background: var(--gray-100); border-radius: 2px; width: 100px; }
    .revenue-fill { height: 100%; background: linear-gradient(90deg, #5B63D3, #7B82E0); border-radius: 2px; transition: width 1s ease; }

    /* ===== Category Distribution ===== */
    .category-dist-list { padding: 8px 16px 16px; }
    .cat-dist-item {
      display: flex; align-items: center; gap: 14px; padding: 12px 8px;
      border-bottom: 1px solid var(--gray-100); animation: fadeSlideIn 0.4s ease forwards; opacity: 0;
    }
    .cat-dist-item:last-child { border-bottom: none; }
    .cat-dist-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
    .cat-dist-info { flex: 1; }
    .cat-dist-name { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .cat-dist-name strong { font-size: 13px; color: var(--gray-700); }
    .cat-dist-name span { font-size: 12px; color: var(--gray-400); }
    .cat-dist-bar-wrapper { display: flex; align-items: center; gap: 10px; }
    .cat-dist-bar { flex: 1; height: 6px; background: var(--gray-100); border-radius: 3px; overflow: hidden; }
    .cat-dist-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
    .cat-dist-pct { font-size: 12px; font-weight: 700; min-width: 36px; text-align: right; }
  `]
})
export class AdminReportsComponent implements OnInit {
  private api = inject(ApiService);

  // Interaction State
  isDropdownOpen = false;
  selectedRange = '01/01/2026 - 18/03/2026';
  ranges = ['7 ngày qua', '30 ngày qua', 'Học kỳ này', 'Năm nay', 'Toàn thời gian'];
  today = new Date();

  kpiCards: any[] = [
    { label: 'Tổng học viên', value: '...', trend: 'Cập nhật', trendUp: true, icon: 'fa-solid fa-users', theme: 'blue', sparkline: Array(12).fill(0).map(() => Math.floor(Math.random() * 60) + 40) },
    { label: 'Giảng viên', value: '...', trend: 'Cập nhật', trendUp: true, icon: 'fa-solid fa-chalkboard-user', theme: 'green', sparkline: Array(12).fill(0).map(() => Math.floor(Math.random() * 60) + 40) },
    { label: 'Tổng khóa học', value: '...', trend: 'Cập nhật', trendUp: true, icon: 'fa-solid fa-book-open', theme: 'orange', sparkline: Array(12).fill(0).map(() => Math.floor(Math.random() * 60) + 40) },
    { label: 'Tổng danh mục', value: '...', trend: 'Cập nhật', trendUp: true, icon: 'fa-solid fa-folder-open', theme: 'purple', sparkline: Array(12).fill(0).map(() => Math.floor(Math.random() * 60) + 40) },
  ];

  topCourses: any[] = [];
  categoryDistribution: any[] = [];

  ngOnInit() {
    this.loadKpis();
    this.loadTopCourses();
    this.loadCategoryDistribution();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectRange(range: string) {
    this.selectedRange = range;
    this.isDropdownOpen = false;
    // Simulate data refresh
    this.loadKpis();
  }

  exportPDF() {
    window.print();
  }

  exportExcel() {
    // Mock excel export
    const blob = new Blob(['Mock Excel Data'], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao-cao-EduLearn-${new Date().getTime()}.xls`;
    a.click();
  }

  loadKpis() {
    this.api.getUsers(1, 1).subscribe(res => {
      this.kpiCards[0].value = res.totalCount.toString();
    });

    this.api.getUsers(1, 100).subscribe(res => {
      const data = res.data || [];
      const gv = data.filter((u: any) => (u.vaiTro || u.VaiTro) === 'GiaoVien').length;
      this.kpiCards[1].value = gv.toString();
    });

    this.api.getCourses({ page: 1, pageSize: 1 }).subscribe(res => {
      this.kpiCards[2].value = (res.totalCount || res.data?.length || 0).toString();
    });

    this.api.getCategories().subscribe(res => {
      const d = Array.isArray(res) ? res : (res.data || []);
      this.kpiCards[3].value = d.length.toString();
    });
  }

  loadTopCourses() {
    this.api.getAdminCourses({ page: 1, pageSize: 5, sortBy: 'revenue' }).subscribe(res => {
      const dbC = res.data || [];
      this.topCourses = dbC.map((c: any) => ({
        name: c.tieuDe || c.TieuDe,
        instructor: (c.giangVien || c.GiangVien)?.[0]?.ten || (c.giangVien || c.GiangVien)?.[0]?.Ten || 'Admin',
        category: (c.theLoai || c.TheLoai)?.ten || (c.theLoai || c.TheLoai)?.Ten || 'Chưa phân loại',
        price: c.giaGoc || c.GiaGoc || 0,
        adminRevenue: c.adminRevenue || c.AdminRevenue || 0
      }));
    });
  }

  loadCategoryDistribution() {
    this.api.getCategories().subscribe(res => {
      const dbCat = Array.isArray(res) ? res : (res.data || []);
      const colors = ['#5B63D3', '#8B5CF6', '#28A745', '#FD7E14', '#EC4899', '#94A3B8'];
      const icons = ['fa-solid fa-code', 'fa-solid fa-brain', 'fa-solid fa-mobile-screen', 'fa-solid fa-cloud', 'fa-solid fa-palette', 'fa-solid fa-ellipsis'];
      
      const totalCourses = dbCat.reduce((sum: number, c: any) => sum + (c.soKhoaHoc || c.SoKhoaHoc || 0), 0);
      
      this.categoryDistribution = dbCat.map((c: any, i: number) => {
        const name = c.ten || c.Ten;
        const count = c.soKhoaHoc || c.SoKhoaHoc || 0;
        return {
          name,
          count,
          pct: totalCourses > 0 ? Math.round((count / totalCourses) * 100) : 0,
          color: colors[i % colors.length],
          icon: icons[i % icons.length]
        };
      }).sort((a: any, b: any) => b.count - a.count).slice(0, 6);
    });
  }
}
