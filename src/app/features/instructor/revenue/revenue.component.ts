import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InstructorLayoutComponent } from '../../../layouts/instructor-layout/instructor-layout.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-instructor-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule, InstructorLayoutComponent],
  template: `
    <app-instructor-layout>
      <div class="header-action">
        <div>
          <h1><i class="fa-solid fa-coins"></i> Doanh thu & Báo cáo</h1>
          <p class="subtitle">Theo dõi lịch sử thanh toán và thống kê khóa học.</p>
        </div>

        <div class="actions">
          <select class="custom-select" [(ngModel)]="selectedCourse" (change)="loadData()">
            <option [ngValue]="0">Tất cả khóa học</option>
            <option *ngFor="let c of courses" [ngValue]="c.maKhoaHoc">{{ c.tieuDe }}</option>
          </select>

          <select class="custom-select" [(ngModel)]="selectedRange" (change)="loadData()">
            <option *ngFor="let range of dateRanges" [value]="range">{{ range }}</option>
          </select>

          <button class="btn btn-outline">
            <i class="fa-solid fa-download"></i> Xuất dữ liệu
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card card">
          <span class="sl">Doanh thu kỳ này ({{ selectedRange }})</span>
          <span class="sv primary">{{ formatCurrencyFull(totalRevenue) }}</span>
          <span class="sc-trend success" *ngIf="totalRevenue > 0"><i class="fa-solid fa-arrow-trend-up"></i> Đã trừ 30% phí nền tảng</span>
        </div>
        <div class="stat-card card">
          <span class="sl">Số lượng giao dịch</span>
          <span class="sv" style="color: var(--gray-700);">{{ transactions.length }}</span>
          <span class="sc-trend" style="color: var(--gray-400);">Lượt mua thành công</span>
        </div>
        <div class="stat-card card">
          <span class="sl">Trạng thái thanh toán</span>
          <span class="sv success">Hoàn tất</span>
          <span class="sc-trend success"><i class="fa-solid fa-check-circle"></i> Sẵn sàng đối soát</span>
        </div>
      </div>

      <div class="chart-container card main-chart" style="margin-bottom: 24px;">
        <div class="chart-header">
          <h3><i class="fa-solid fa-arrow-trend-up"></i> Tăng trưởng doanh thu</h3>
          <div class="chart-legend">
            <span class="dot Blue"></span> Thực nhận (VNĐ)
          </div>
        </div>
        <div class="chart-content growth-chart" style="position: relative; height: 100%; width: 100%; min-height: 250px;">

          <div class="y-axis-labels" style="position: absolute; left: 0; top: 0; bottom: 15%; display: flex; flex-direction: column; justify-content: space-between; font-size: 11px; color: var(--gray-400); font-weight: 600; text-align: right; width: 45px; padding-top: 5px;">
            <span *ngFor="let label of yAxisLabels">{{ label }}</span>
          </div>

          <div class="grid-lines" style="position: absolute; left: 55px; right: 0; top: 0; bottom: 15%; display: flex; flex-direction: column; justify-content: space-between; z-index: 0;">
            <div style="border-top: 1px dashed var(--gray-100); width: 100%; height: 1px;"></div>
            <div style="border-top: 1px dashed var(--gray-100); width: 100%; height: 1px;"></div>
            <div style="border-top: 1px dashed var(--gray-100); width: 100%; height: 1px;"></div>
            <div style="border-top: 1px solid var(--gray-200); width: 100%; height: 1px;"></div>
          </div>

          <svg style="width: calc(100% - 55px); height: 85%; overflow: visible; position: absolute; bottom: 15%; left: 55px; z-index: 1;" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgba(255, 123, 84, 0.3)" />
                <stop offset="100%" stop-color="rgba(255, 123, 84, 0)" />
              </linearGradient>
            </defs>
            <polygon [attr.points]="areaPoints" fill="url(#lineGrad)" />
            <polyline [attr.points]="linePoints" fill="none" stroke="#FF7B54" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>

          <div class="points-layer" style="position: absolute; top: 0; left: 55px; right: 0; bottom: 15%; z-index: 2;">
            <div *ngFor="let item of growthData; let i = index"
                 style="position: absolute; transform: translate(-50%, 50%); width: 10px; height: 10px; background: #fff; border: 2px solid #FF7B54; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer;"
                 [style.left.%]="i * (100 / (growthData.length - 1 || 1))"
                 [style.bottom.%]="getBarHeight(item.value)"
                 [title]="formatCurrencyFull(item.value) + ' (' + item.month + ')'">
            </div>
          </div>

          <div class="labels-layer" style="position: absolute; bottom: 0; left: 55px; right: 0; display: flex; justify-content: space-between;">
            <span *ngFor="let item of growthData" class="month-label" style="font-size: 11px; color: var(--gray-500); font-weight: 600;">{{ item.month }}</span>
          </div>
        </div>
      </div>

      <div class="section card" style="padding: 0;">
        <div style="padding: 24px; border-bottom: 1px solid var(--gray-100); display: flex; justify-content: space-between; align-items: center;">
          <h3 class="section-title" style="margin: 0;">Lịch sử dòng tiền</h3>

          <select class="custom-select tab-select" [(ngModel)]="viewMode">
            <option value="details">Thanh toán chi tiết (Từng học viên)</option>
            <option value="payouts">Đối soát hàng tháng (Gộp nền tảng)</option>
          </select>
        </div>

        <table *ngIf="viewMode === 'details'" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: var(--gray-50); border-bottom: 1px solid var(--gray-200); text-align: left;">
              <th style="padding: 12px 24px; font-weight: 600; font-size: 12px; color: var(--gray-500);">Ngày mua</th>
              <th style="padding: 12px 24px; font-weight: 600; font-size: 12px; color: var(--gray-500);">Học viên</th>
              <th style="padding: 12px 24px; font-weight: 600; font-size: 12px; color: var(--gray-500);">Khóa học</th>
              <th style="padding: 12px 24px; font-weight: 600; font-size: 12px; color: var(--gray-500);">Giá bán</th>
              <th style="padding: 12px 24px; font-weight: 600; font-size: 12px; color: var(--gray-500);">Thực nhận</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--gray-100);" *ngFor="let t of transactions">
              <td style="padding: 16px 24px; font-size: 13px; color: var(--gray-600);">{{ t.ngayTao | date:'dd/MM/yyyy HH:mm' }}</td>
              <td style="padding: 16px 24px; font-size: 14px; font-weight: 600;">{{ t.nguoiMua }}</td>
              <td style="padding: 16px 24px; font-size: 13px; color: var(--gray-600);">{{ t.khoaHoc }}</td>
              <td style="padding: 16px 24px; font-size: 14px; color: var(--gray-500);">{{ formatCurrencyFull(t.giaGop) }}</td>
              <td style="padding: 16px 24px; font-size: 14px; font-weight: 700; color: var(--success);">{{ formatCurrencyFull(t.thucNhan) }}</td>
            </tr>
            <tr *ngIf="transactions.length === 0">
              <td colspan="5" style="padding: 30px; text-align: center; color: var(--gray-500);">Không có giao dịch nào trong thời gian này.</td>
            </tr>
          </tbody>
        </table>

        <table *ngIf="viewMode === 'payouts'" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: var(--gray-50); border-bottom: 1px solid var(--gray-200); text-align: left;">
              <th style="padding: 12px 24px; font-weight: 600; font-size: 12px; color: var(--gray-500);">Kỳ đối soát</th>
              <th style="padding: 12px 24px; font-weight: 600; font-size: 12px; color: var(--gray-500);">Doanh thu gộp</th>
              <th style="padding: 12px 24px; font-weight: 600; font-size: 12px; color: var(--gray-500);">Phí nền tảng (30%)</th>
              <th style="padding: 12px 24px; font-weight: 600; font-size: 12px; color: var(--gray-500);">Thực nhận (70%)</th>
              <th style="padding: 12px 24px; font-weight: 600; font-size: 12px; color: var(--gray-500);">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--gray-100);" *ngFor="let p of payouts">
              <td style="padding: 16px 24px; font-size: 14px; font-weight: 500;">{{ p.period }}</td>
              <td style="padding: 16px 24px; font-size: 14px; color: var(--gray-600);">{{ formatCurrencyFull(p.gross) }}</td>
              <td style="padding: 16px 24px; font-size: 14px; color: var(--danger);">-{{ formatCurrencyFull(p.fee) }}</td>
              <td style="padding: 16px 24px; font-size: 14px; font-weight: 700; color: var(--success);">{{ formatCurrencyFull(p.net) }}</td>
              <td style="padding: 16px 24px;">
                <span class="badge" [ngClass]="p.status === 'Đã đối soát' ? 'badge-success' : 'badge-warning'">
                  {{ p.status }}
                </span>
              </td>
            </tr>
            <tr *ngIf="payouts.length === 0">
              <td colspan="5" style="padding: 30px; text-align: center; color: var(--gray-500);">Không có dữ liệu đối soát.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </app-instructor-layout>
  `,
  styles: [`
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitle { font-size: 14px; color: var(--gray-500); }
    .header-action { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
    .actions { display: flex; gap: 10px; align-items: center; }

    .custom-select {
      padding: 8px 16px; border-radius: 10px; border: 1px solid var(--gray-200);
      background: #fff; font-size: 13px; font-weight: 600; color: var(--gray-700);
      outline: none; cursor: pointer;
    }
    .tab-select { border: 1px solid #FF7B54; color: #FF7B54; background: rgba(255,123,84,0.05); }

    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
    .stat-card { padding: 24px; display: flex; flex-direction: column; border-radius: 16px; border: 1px solid var(--gray-200); }
    .sl { font-size: 13px; color: var(--gray-500); margin-bottom: 8px; font-weight: 600; text-transform: uppercase; }
    .sv { font-size: 26px; font-weight: 800; margin-bottom: 12px; }
    .sv.primary { color: #FF7B54; }
    .sv.success { color: var(--success); }
    .sc-trend { font-size: 13px; display: flex; align-items: center; gap: 6px; }
    .sc-trend.success { color: var(--success); }

    .chart-container { padding: 24px; display: flex; flex-direction: column; border-radius: 16px; border: 1px solid var(--gray-200); }
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .chart-header h3 { font-size: 16px; font-weight: 700; margin: 0; }
    .chart-legend { font-size: 12px; color: var(--gray-500); display: flex; align-items: center; gap: 6px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.Blue { background: #FF7B54; }

    .section-title { font-size: 16px; font-weight: 700; color: var(--gray-800); }

    .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge-success { background: rgba(40,167,69,0.15); color: #28A745; }
    .badge-warning { background: rgba(253,126,20,0.15); color: #FD7E14; }
  `]
})
export class InstructorRevenueComponent implements OnInit {
  private api = inject(ApiService);

  // Filters
  selectedRange = 'Năm nay';
  dateRanges = ['7 ngày qua', '30 ngày qua', '90 ngày qua', 'Năm nay', 'Toàn thời gian'];
  selectedCourse = 0; // 0 = Tất cả
  courses: any[] = [];

  // Data
  totalRevenue = 0;
  growthData: any[] = [];
  transactions: any[] = [];
  payouts: any[] = [];

  viewMode = 'details'; // 'details' | 'payouts'

  ngOnInit() {
    // Lấy danh sách khóa học cho Dropdown
    this.api.getInstructorCourses().subscribe(res => {
      this.courses = res || [];
    });
    this.loadData();
  }

  loadData() {
    // 1. Load Tổng KPI
    this.api.getInstructorStats(this.selectedRange, this.selectedCourse).subscribe(res => {
      this.totalRevenue = res?.tongDoanhThu || 0;
    });

    // 2. Load Biểu đồ
    this.api.getRevenueSeries(this.selectedRange, this.selectedCourse).subscribe(res => {
      const data = res || [];
      this.growthData = data.map((d: any) => ({
        month: d.month ?? d.Month,
        value: Number(d.revenue ?? d.Revenue ?? 0)
      }));
    });

    // 3. Load Giao dịch & Tạo Payout
    this.api.getInstructorTransactions(this.selectedRange, this.selectedCourse).subscribe(res => {
      this.transactions = res || [];
      this.generatePayouts();
    });
  }

  // Tự động gom nhóm các giao dịch thành Bảng Đối soát (Theo tháng)
  generatePayouts() {
    this.payouts = [];
    const grouped = this.transactions.reduce((acc, curr) => {
      const date = new Date(curr.ngayTao);
      const key = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!acc[key]) acc[key] = { gross: 0, fee: 0, net: 0, count: 0 };
      acc[key].gross += curr.giaGop;
      acc[key].fee += curr.phiNenTang;
      acc[key].net += curr.thucNhan;
      acc[key].count++;
      return acc;
    }, {});

    for (const [period, data] of Object.entries(grouped)) {
      const isPastMonth = this.checkIfPastMonth(period);
      this.payouts.push({
        period,
        gross: (data as any).gross,
        fee: (data as any).fee,
        net: (data as any).net,
        status: isPastMonth ? 'Đã đối soát' : 'Chờ đối soát (Cuối kỳ)'
      });
    }
  }

  checkIfPastMonth(periodString: string): boolean {
    const parts = periodString.replace('Tháng ', '').split('/');
    const pMonth = parseInt(parts[0], 10);
    const pYear = parseInt(parts[1], 10);
    const now = new Date();
    if (pYear < now.getFullYear()) return true;
    if (pYear === now.getFullYear() && pMonth < (now.getMonth() + 1)) return true;
    return false;
  }

  // ==== LOGIC BIỂU ĐỒ (Giống Reports) ====
  get yAxisLabels(): string[] {
    if (!this.growthData || this.growthData.length === 0) return ['0', '0', '0', '0'];
    const max = Math.max(...this.growthData.map(d => d.value));
    if (!max || max === 0) return ['0', '0', '0', '0'];

    const upperLimit = max * 1.2; // Tăng trần 20%
    return [
      this.formatShortCurrency(upperLimit),
      this.formatShortCurrency(upperLimit * 0.66),
      this.formatShortCurrency(upperLimit * 0.33),
      '0'
    ];
  }

  getBarHeight(value: number): number {
    if (!this.growthData || this.growthData.length === 0) return 5;
    const max = Math.max(...this.growthData.map(d => d.value)) * 1.2;
    if (!max || max === 0) return 5;
    return 5 + (value / max) * 85;
  }

  get linePoints(): string {
    if (!this.growthData || this.growthData.length === 0) return '';
    const max = Math.max(...this.growthData.map(d => d.value)) * 1.2;
    if (!max || max === 0) return '0,95 100,95';

    const widthStep = 100 / (this.growthData.length - 1 || 1);
    return this.growthData.map((d, i) => {
      const x = i * widthStep;
      const y = 95 - ((d.value / max) * 85);
      return `${x},${y}`;
    }).join(' ');
  }

  get areaPoints(): string {
    const points = this.linePoints;
    if (!points || points === '0,95 100,95') return '';
    return `${points} 100,100 0,100`;
  }

  // Tiện ích Format tiền
  formatShortCurrency(value: number): string {
    if (value >= 1000000) return (value / 1000000).toFixed(1).replace('.0', '') + 'Tr';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
    return value.toFixed(0);
  }

  formatCurrencyFull(value: number): string {
    if (!value) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
}
