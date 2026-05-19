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
      <div class="screen-only">
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

        <div class="bottom-row">
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
                </div>
              </div>
            </div>
          </div>

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
      </div>

      <div class="print-professional-report">
        <div class="print-header-formal">
          <div class="print-header-left">
            <strong>HỆ THỐNG EDULEARN</strong><br>
            Phòng Quản lý Đào tạo
          </div>
          <div class="print-header-right">
            <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
            <span class="print-underline">Độc lập - Tự do - Hạnh phúc</span>
          </div>
        </div>

        <div class="print-title">
          <h1>BÁO CÁO THỐNG KÊ HOẠT ĐỘNG HỆ THỐNG</h1>
          <p>Phạm vi thời gian: {{ selectedRange }}</p>
          <p>Ngày xuất báo cáo: {{ today | date:'dd/MM/yyyy HH:mm' }}</p>
        </div>

        <div class="print-section">
          <h3>I. TỔNG QUAN HỆ THỐNG</h3>
          <table class="print-table">
            <thead>
              <tr>
                <th style="width: 50px;">STT</th>
                <th>Chỉ số đánh giá</th>
                <th>Giá trị hiện tại</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let kpi of kpiCards; let i = index">
                <td style="text-align: center;">{{ i + 1 }}</td>
                <td>{{ kpi.label }}</td>
                <td style="text-align: right; font-weight: bold;">{{ kpi.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="print-section">
          <h3>II. DANH SÁCH TOP KHÓA HỌC CÓ DOANH THU CAO NHẤT</h3>
          <table class="print-table">
            <thead>
              <tr>
                <th style="width: 50px;">Top</th>
                <th>Tên khóa học</th>
                <th>Giảng viên</th>
                <th>Danh mục</th>
                <th style="text-align: right;">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let course of topCourses; let i = index">
                <td style="text-align: center; font-weight: bold;">{{ i + 1 }}</td>
                <td>{{ course.name }}</td>
                <td>{{ course.instructor }}</td>
                <td>{{ course.category }}</td>
                <td style="text-align: right;">{{ course.adminRevenue | currency:'VND':'symbol':'1.0-0' }}</td>
              </tr>
              <tr *ngIf="topCourses.length === 0">
                <td colspan="5" style="text-align: center; padding: 15px;">Chưa có dữ liệu khóa học</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="print-section">
          <h3>III. PHÂN BỐ SỐ LƯỢNG KHÓA HỌC THEO DANH MỤC</h3>
          <table class="print-table">
            <thead>
              <tr>
                <th style="width: 50px;">STT</th>
                <th>Tên danh mục</th>
                <th style="text-align: right;">Số lượng (khóa)</th>
                <th style="text-align: right;">Tỷ lệ (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cat of categoryDistribution; let i = index">
                <td style="text-align: center;">{{ i + 1 }}</td>
                <td>{{ cat.name }}</td>
                <td style="text-align: right;">{{ cat.count }}</td>
                <td style="text-align: right;">{{ cat.pct }}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="print-signatures">
          <div class="sig-box">
            <strong>Người lập báo cáo</strong><br>
            <span>(Ký, ghi rõ họ tên)</span>
          </div>
          <div class="sig-box">
            <strong>Trưởng bộ phận</strong><br>
            <span>(Ký, ghi rõ họ tên)</span>
          </div>
        </div>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    /* ===== CÁC STYLE CHO GIAO DIỆN MÀN HÌNH (Giữ nguyên như cũ) ===== */
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    h1 { font-size: 26px; font-weight: 800; color: var(--gray-800); margin-bottom: 6px; letter-spacing: -0.3px; }
    .page-subtitle { font-size: 13px; color: var(--gray-500); display: flex; align-items: center; gap: 6px; }
    .live-dot { display: inline-block; width: 7px; height: 7px; background: #28A745; border-radius: 50%; animation: pulse-dot 2s ease-in-out infinite; }
    @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .page-header-right { display: flex; gap: 10px; align-items: center; }
    .dropdown-wrapper { position: relative; }
    .range-dropdown { position: absolute; top: 105%; right: 0; width: 220px; z-index: 100; padding: 8px; box-shadow: var(--shadow-lg); background: white; border-radius: 8px; border: 1px solid var(--gray-200); }
    .range-item { padding: 10px 14px; font-size: 13px; color: var(--gray-700); cursor: pointer; border-radius: 8px; }
    .range-item:hover { background: var(--gray-50); color: var(--primary); }
    .date-range-picker { display: flex; align-items: center; gap: 8px; padding: 9px 16px; border-radius: 10px; border: 1px solid var(--gray-200); background: var(--white); font-size: 13px; color: var(--gray-600); cursor: pointer; transition: all 0.2s ease; }
    .date-range-picker:hover { border-color: var(--primary); }
    .header-action-btn { display: inline-flex; align-items: center; gap: 8px; padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; border: 1px solid var(--gray-200); background: var(--white); color: var(--gray-600); cursor: pointer; transition: all 0.25s ease; }
    .header-action-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .header-action-btn.primary { background: linear-gradient(135deg, #5B63D3 0%, #7B82E0 100%); color: white; border: none; }
    .header-action-btn.primary:hover { box-shadow: 0 4px 16px rgba(91,99,211,0.35); }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 24px; }
    .kpi-card { background: var(--white); border-radius: 16px; padding: 20px; border: 1px solid var(--gray-200); transition: all 0.3s ease; animation: fadeSlideIn 0.5s ease forwards; opacity: 0; }
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
    .bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .chart-card { background: var(--white); border-radius: 16px; border: 1px solid var(--gray-200); overflow: hidden; }
    .chart-card-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 22px; border-bottom: 1px solid var(--gray-100); }
    .chart-title { display: flex; align-items: center; gap: 12px; }
    .chart-title-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .chart-title-icon.purple { background: rgba(139,92,246,0.1); color: #8B5CF6; }
    .chart-title-icon.green { background: rgba(40,167,69,0.1); color: #28A745; }
    .chart-title-icon.orange { background: rgba(253,126,20,0.1); color: #FD7E14; }
    .chart-title-icon.blue { background: rgba(91,99,211,0.1); color: #5B63D3; }
    .chart-title h2 { font-size: 16px; font-weight: 700; color: var(--gray-800); margin: 0; }
    .chart-subtitle { font-size: 12px; color: var(--gray-400); }
    .top-courses-list { padding: 8px 16px 16px; }
    .top-course-item { display: flex; align-items: center; gap: 14px; padding: 14px 8px; border-bottom: 1px solid var(--gray-100); transition: background 0.2s ease; }
    .top-course-item:last-child { border-bottom: none; }
    .top-course-item:hover { background: var(--gray-50); border-radius: 10px; }
    .rank-badge { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0; }
    .rank-1 { background: linear-gradient(135deg, #F59E0B, #FBBF24); color: white; }
    .rank-2 { background: linear-gradient(135deg, #94A3B8, #CBD5E1); color: white; }
    .rank-3 { background: linear-gradient(135deg, #CD7F32, #DDA15E); color: white; }
    .rank-4, .rank-5 { background: var(--gray-100); color: var(--gray-500); }
    .top-course-info { flex: 1; min-width: 0; }
    .top-course-info strong { display: block; font-size: 14px; color: var(--gray-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .top-course-info span { font-size: 12px; color: var(--gray-400); }
    .top-course-revenue { text-align: right; min-width: 100px; }
    .top-course-revenue strong { font-size: 14px; color: var(--primary); display: block; margin-bottom: 4px; }
    .category-dist-list { padding: 8px 16px 16px; }
    .cat-dist-item { display: flex; align-items: center; gap: 14px; padding: 12px 8px; border-bottom: 1px solid var(--gray-100); animation: fadeSlideIn 0.4s ease forwards; opacity: 0; }
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

    /* ===== BẢN IN: MẶC ĐỊNH ẨN GIAO DIỆN CHUYÊN NGHIỆP TRÊN MÀN HÌNH ===== */
    .print-professional-report { display: none; }

    /* ===== CẤU HÌNH KHI NGƯỜI DÙNG NHẤN IN (CTRL + P) ===== */
    @media print {
      /* Ẩn hoàn toàn layout trang web (Sidebar, Topbar, nội dung thẻ div.screen-only) */
      .screen-only, .admin-sidebar, .admin-topbar, app-sidebar, app-header {
        display: none !important;
      }

      /* Reset lại layout gốc để không bị kẹt lề của giao diện admin */
      .admin-main, app-admin-layout, body, html {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        background: white !important;
      }

      /* Hiển thị giao diện báo cáo chuyên nghiệp */
      .print-professional-report {
        display: block !important;
        width: 100%;
        color: #000;
        font-family: "Times New Roman", Times, serif; /* Font chuẩn văn bản */
        font-size: 12pt;
      }

      /* Định dạng header Quốc hiệu, Tiêu ngữ */
      .print-header-formal {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
        text-align: center;
        line-height: 1.4;
      }
      .print-header-left { width: 40%; }
      .print-header-right { width: 50%; }
      .print-underline {
        display: inline-block;
        border-bottom: 1px solid #000;
        padding-bottom: 2px;
        font-weight: bold;
      }

      /* Định dạng tiêu đề chính */
      .print-title { text-align: center; margin-bottom: 30px; }
      .print-title h1 { font-size: 18pt; font-weight: bold; margin-bottom: 8px; color: #000; }
      .print-title p { margin: 3px 0; font-style: italic; }

      /* Định dạng từng phần báo cáo */
      .print-section { margin-bottom: 30px; page-break-inside: avoid; }
      .print-section h3 { font-size: 14pt; font-weight: bold; margin-bottom: 15px; color: #000; }

      /* Định dạng bảng biểu */
      .print-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
      }
      .print-table th, .print-table td {
        border: 1px solid #000;
        padding: 8px 10px;
        text-align: left;
      }
      .print-table th { background-color: #f2f2f2 !important; -webkit-print-color-adjust: exact; font-weight: bold; text-align: center;}

      /* Định dạng phần chữ ký */
      .print-signatures {
        display: flex;
        justify-content: space-between;
        margin-top: 50px;
        text-align: center;
        page-break-inside: avoid;
      }
      .sig-box { width: 40%; }
      .sig-box span { font-style: italic; }
    }
  `]
})
export class AdminReportsComponent implements OnInit {
  private api = inject(ApiService);

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
    this.loadKpis();
  }

  // Chức năng in sử dụng layout CSS @media print chuyên nghiệp đã định dạng phía trên
  exportPDF() {
    window.print();
  }

  // Chức năng xuất Excel thực tế bằng CSV có hỗ trợ BOM (UTF-8 tiếng Việt)
  exportExcel() {
    // 1. Thêm BOM (\uFEFF) để Excel tự động đọc đúng font Tiếng Việt
    let csvContent = '\uFEFF';

    // 2. Format tiêu đề báo cáo
    csvContent += 'BÁO CÁO THỐNG KÊ HOẠT ĐỘNG HỆ THỐNG EDULEARN\n';
    csvContent += `Thời gian xuất:,"${this.today.toLocaleDateString('vi-VN')} ${this.today.toLocaleTimeString('vi-VN')}"\n`;
    csvContent += `Phạm vi dữ liệu:,"${this.selectedRange}"\n\n`;

    // 3. Section KPI
    csvContent += 'I. TỔNG QUAN HỆ THỐNG\n';
    csvContent += 'STT,Chỉ số đánh giá,Giá trị hiện tại\n';
    this.kpiCards.forEach((kpi, index) => {
      // Dùng dấu ngoặc kép bọc chuỗi để tránh lỗi nếu string có chứa dấu phẩy
      csvContent += `"${index + 1}","${kpi.label}","${kpi.value}"\n`;
    });
    csvContent += '\n';

    // 4. Section Top Doanh thu
    csvContent += 'II. DANH SÁCH TOP KHÓA HỌC CÓ DOANH THU CAO NHẤT\n';
    csvContent += 'Top,Tên khóa học,Giảng viên,Danh mục,Doanh thu (VND)\n';
    this.topCourses.forEach((course, index) => {
      csvContent += `"${index + 1}","${course.name}","${course.instructor}","${course.category}","${course.adminRevenue}"\n`;
    });
    csvContent += '\n';

    // 5. Section Phân bố danh mục
    csvContent += 'III. PHÂN BỐ SỐ LƯỢNG KHÓA HỌC THEO DANH MỤC\n';
    csvContent += 'STT,Tên danh mục,Số lượng (khóa),Tỷ lệ (%)\n';
    this.categoryDistribution.forEach((cat, index) => {
      csvContent += `"${index + 1}","${cat.name}","${cat.count}","${cat.pct}%"\n`;
    });

    // 6. Xử lý xuất file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_EduLearn_${new Date().getTime()}.csv`;

    // Kích hoạt click tải xuống
    document.body.appendChild(a);
    a.click();

    // Dọn dẹp DOM
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
