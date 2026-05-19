import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, PercentPipe, DecimalPipe } from '@angular/common';
import { InstructorLayoutComponent } from '../../../layouts/instructor-layout/instructor-layout.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-instructor-reports',
  standalone: true,
  imports: [CommonModule, InstructorLayoutComponent],
  template: `
    <app-instructor-layout>
      <div class="screen-only">
        <div class="header-action no-print">
          <div>
            <h1><i class="fa-solid fa-chart-column"></i> Báo cáo & Phân tích</h1>
            <p class="subtitle">Theo dõi sự tăng trưởng và hiệu suất các khóa học của bạn.</p>
          </div>
          <div class="actions">
            <button class="btn btn-outline btn-sm" (click)="exportPDF()">
              <i class="fa-solid fa-download"></i> Xuất PDF
            </button>
            <button class="btn btn-primary btn-sm" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); border: none;" (click)="exportExcel()">
              <i class="fa-solid fa-file-excel"></i> Xuất Excel
            </button>

            <div class="dropdown-wrapper">
              <button class="btn btn-primary btn-sm" (click)="toggleDropdown()">
                <i class="fa-solid fa-calendar-days"></i> {{ selectedRange }}
                <i class="fa-solid fa-chevron-down" style="font-size: 10px; margin-left: 6px;"></i>
              </button>
              <div class="dropdown-menu card" *ngIf="isDropdownOpen">
                <div class="menu-item" *ngFor="let range of dateRanges" (click)="selectRange(range)">
                  {{ range }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card card">
            <div class="kpi-header">
              <span class="kpi-icon blue"><i class="fa-solid fa-users"></i></span>
              <span class="kpi-trend up">+12.5%</span>
            </div>
            <div class="kpi-body">
              <span class="kpi-val">{{ stats?.tongHocVien | number }}</span>
              <span class="kpi-lbl">Tổng học viên</span>
            </div>
          </div>
          <div class="kpi-card card">
            <div class="kpi-header">
              <span class="kpi-icon green"><i class="fa-solid fa-money-bill-trend-up"></i></span>
              <span class="kpi-trend up">+8.2%</span>
            </div>
            <div class="kpi-body">
              <span class="kpi-val">{{ formatCurrency(stats?.tongDoanhThu || 0) }}</span>
              <span class="kpi-lbl">Doanh thu tích lũy</span>
            </div>
          </div>
          <div class="kpi-card card">
            <div class="kpi-header">
              <span class="kpi-icon yellow"><i class="fa-solid fa-star"></i></span>
              <span class="kpi-trend down">-0.1</span>
            </div>
            <div class="kpi-body">
              <span class="kpi-val">{{ stats?.tbDanhGia | number:'1.1-1' }}</span>
              <span class="kpi-lbl">Xếp hạng trung bình</span>
            </div>
          </div>
          <div class="kpi-card card">
            <div class="kpi-header">
              <span class="kpi-icon purple"><i class="fa-solid fa-award"></i></span>
              <span class="kpi-trend up">+4</span>
            </div>
            <div class="kpi-body">
              <span class="kpi-val">{{ stats?.tongKhoaHoc }}</span>
              <span class="kpi-lbl">Khóa học đang dạy</span>
            </div>
          </div>
        </div>

        <div class="charts-row">
          <div class="chart-container card main-chart">
            <div class="chart-header">
              <h3><i class="fa-solid fa-arrow-trend-up"></i> Tăng trưởng doanh thu</h3>
              <div class="chart-legend">
                <span class="dot Blue"></span> Doanh thu (VNĐ)
              </div>
            </div>
            <div class="chart-content growth-chart" style="position: relative; height: 100%; width: 100%; min-height: 220px;">

              <div class="y-axis-labels" style="position: absolute; left: 0; top: 0; bottom: 15%; display: flex; flex-direction: column; justify-content: space-between; font-size: 11px; color: var(--gray-400); font-weight: 600; text-align: right; width: 45px; padding-top: 5px;">
                <span>{{ yAxisLabels[0] }}</span>
                <span>{{ yAxisLabels[1] }}</span>
                <span>{{ yAxisLabels[2] }}</span>
              </div>

              <div class="grid-lines" style="position: absolute; left: 55px; right: 0; top: 0; bottom: 15%; display: flex; flex-direction: column; justify-content: space-between; z-index: 0;">
                <div style="border-top: 1px dashed var(--gray-100); width: 100%; height: 1px;"></div>
                <div style="border-top: 1px dashed var(--gray-100); width: 100%; height: 1px;"></div>
                <div style="border-top: 1px solid var(--gray-200); width: 100%; height: 1px;"></div>
              </div>

              <svg style="width: calc(100% - 55px); height: 85%; overflow: visible; position: absolute; bottom: 15%; left: 55px; z-index: 1;" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(59, 130, 246, 0.3)" />
                    <stop offset="100%" stop-color="rgba(59, 130, 246, 0)" />
                  </linearGradient>
                </defs>
                <polygon [attr.points]="areaPoints" fill="url(#lineGrad)" />
                <polyline [attr.points]="linePoints" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>

              <div class="points-layer" style="position: absolute; top: 0; left: 55px; right: 0; bottom: 15%; z-index: 2;">
                <div *ngFor="let item of growthData; let i = index"
                     style="position: absolute; transform: translate(-50%, 50%); width: 10px; height: 10px; background: #fff; border: 2px solid #3B82F6; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer;"
                     [style.left.%]="i * (100 / (growthData.length - 1 || 1))"
                     [style.bottom.%]="getBarHeight(item.value)"
                     [title]="formatCurrency(item.value) + ' (' + item.month + ')'">
                </div>
              </div>

              <div class="labels-layer" style="position: absolute; bottom: 0; left: 55px; right: 0; display: flex; justify-content: space-between;">
                <span *ngFor="let item of growthData" class="month-label" style="font-size: 11px; color: var(--gray-500); font-weight: 600;">{{ item.month }}</span>
              </div>
            </div>
          </div>

          <div class="chart-container card side-chart">
            <div class="pie-placeholder" style="height: 100%; justify-content: center;">
               <div class="pie-ring">
                 <div class="pie-center">
                   <strong>{{ publishedCount }}</strong>
                   <span>Xuất bản</span>
                 </div>
               </div>
               <div class="pie-labels">
                  <div class="p-item"><span class="dot success"></span> Xuất bản ({{ publishedCount }})</div>
                  <div class="p-item"><span class="dot gray"></span> Bản nháp/Chờ duyệt ({{ draftCount }})</div>
               </div>
            </div>
          </div>
        </div>

        <div class="performance-section">
          <div class="section-header">
            <h2><i class="fa-solid fa-list-check"></i> Hiệu suất khóa học</h2>
          </div>
          <div class="table-wrapper card">
            <table>
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Sức hút</th>
                  <th>Doanh thu</th>
                  <th>Đánh giá</th>
                  <th>Phản hồi (AI)</th>
                  </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of courses">
                  <td>
                    <div class="course-cell"><strong>{{ c.tieuDe }}</strong></div>
                  </td>
                  <td>{{ c.soHocVien }}</td>
                  <td>{{ c.giaGoc | currency:'VND' }}</td>
                  <td style="font-weight: 600;">{{ c.tbdanhGia }} <i class="fa-solid fa-star" style="color: #F59E0B; font-size: 13px; margin-left: 2px;"></i></td>

                  <td (click)="openSentimentDetail(c)" style="cursor: pointer;">
                    <div class="mini-donut-wrapper" [title]="'Tích cực: ' + c.sentimentStats?.pos">
                      <div class="mini-donut" [ngStyle]="getDonutStyle(c.sentimentStats)">
                        <div class="donut-hole"></div>
                      </div>
                      <span class="donut-percent">{{ c.sentimentStats?.percentPos }}%</span>
                    </div>
                  </td>
                  </tr>
              </tbody>
            </table>
            <div class="sentiment-modal-overlay" *ngIf="isModalOpen" (click)="closeModal()">
              <div class="sentiment-modal-content" (click)="$event.stopPropagation()">
                <div class="modal-header">
                  <div class="header-info">
                    <h3>{{ selectedCourse?.tieuDe }}</h3>
                    <p>Phân tích cảm xúc từ {{ courseComments.length }} bình luận</p>
                  </div>
                  <button class="close-btn" (click)="closeModal()">✕</button>
                </div>

                <div class="modal-body">
                  <div class="comments-scroll">
                    <div class="cmt-item" *ngFor="let cmt of courseComments">
                      <div class="cmt-header">
                        <span class="stars">⭐ {{ cmt.rating || 5 }}</span>
                        <span class="cmt-badge" [ngClass]="emotionMap[cmt.emotion]?.bg || 'bg-slate-100'">
                          {{ emotionMap[cmt.emotion]?.emoji }} {{ emotionMap[cmt.emotion]?.name }}
                        </span>
                      </div>
                      <p class="cmt-text">{{ cmt.text }}</p>
                    </div>
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
            Cổng thông tin Giảng viên
          </div>
          <div class="print-header-right">
            <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
            <span class="print-underline">Độc lập - Tự do - Hạnh phúc</span>
          </div>
        </div>

        <div class="print-title">
          <h1>BÁO CÁO HIỆU SUẤT GIẢNG DẠY</h1>
          <p>Phạm vi thời gian: {{ selectedRange }}</p>
          <p>Ngày xuất báo cáo: {{ today | date:'dd/MM/yyyy HH:mm' }}</p>
        </div>

        <div class="print-section">
          <h3>I. TỔNG QUAN CHỈ SỐ</h3>
          <table class="print-table">
            <thead>
              <tr>
                <th style="width: 50px;">STT</th>
                <th>Chỉ số đánh giá</th>
                <th>Giá trị hiện tại</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: center;">1</td>
                <td>Tổng số học viên</td>
                <td style="text-align: right; font-weight: bold;">{{ stats?.tongHocVien | number }}</td>
              </tr>
              <tr>
                <td style="text-align: center;">2</td>
                <td>Doanh thu tích lũy</td>
                <td style="text-align: right; font-weight: bold; color: #10B981;">{{ (stats?.tongDoanhThu || 0) | currency:'VND':'symbol':'1.0-0' }}</td>
              </tr>
              <tr>
                <td style="text-align: center;">3</td>
                <td>Xếp hạng trung bình</td>
                <td style="text-align: right; font-weight: bold;">{{ stats?.tbDanhGia | number:'1.1-1' }} / 5.0</td>
              </tr>
              <tr>
                <td style="text-align: center;">4</td>
                <td>Số lượng khóa học đang dạy</td>
                <td style="text-align: right; font-weight: bold;">{{ stats?.tongKhoaHoc }} khóa học</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="print-section">
          <h3>II. CHI TIẾT HIỆU SUẤT KHÓA HỌC</h3>
          <table class="print-table">
            <thead>
              <tr>
                <th style="width: 50px;">STT</th>
                <th>Tên khóa học</th>
                <th>Danh mục</th>
                <th style="text-align: right;">Số học viên</th>
                <th style="text-align: right;">Doanh thu</th>
                <th style="text-align: right;">Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of courses; let i = index">
                <td style="text-align: center;">{{ i + 1 }}</td>
                <td>{{ c.tieuDe }}</td>
                <td>{{ c.theLoai || c.TheLoai?.ten || 'Chưa phân loại' }}</td>
                <td style="text-align: right;">{{ c.soHocVien | number }}</td>
                <td style="text-align: right;">{{ (c.giaGoc || 0) | currency:'VND':'symbol':'1.0-0' }}</td>
                <td style="text-align: right;">{{ c.tbdanhGia | number:'1.1-1' }} ⭐</td>
              </tr>
              <tr *ngIf="courses.length === 0">
                <td colspan="6" style="text-align: center; padding: 15px;">Chưa có dữ liệu khóa học</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="print-signatures">
          <div class="sig-box">
            </div>
          <div class="sig-box">
            <em>....., ngày {{ today | date:'dd' }} tháng {{ today | date:'MM' }} năm {{ today | date:'yyyy' }}</em><br>
            <strong>Giảng viên lập báo cáo</strong><br>
            <span style="display: block; margin-top: 60px;">(Ký, ghi rõ họ tên)</span>
          </div>
        </div>
      </div>
    </app-instructor-layout>
  `,
  styles: [`
    /* ===== SCREEN STYLES ===== */
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitle { font-size: 14px; color: var(--gray-500); }
    .header-action { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
    .actions { display: flex; gap: 10px; }
    .dropdown-wrapper { position: relative; }
    .dropdown-menu { position: absolute; top: 105%; right: 0; width: 180px; z-index: 100; padding: 8px; box-shadow: var(--shadow-lg); transition: all 0.2s ease; background: #fff; border-radius: 8px; border: 1px solid #eee; }
    .menu-item { padding: 10px 14px; font-size: 13px; color: var(--gray-700); cursor: pointer; border-radius: 8px; }
    .menu-item:hover { background: var(--gray-50); color: var(--primary); }

    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi-card { padding: 20px; border-radius: 16px; border: 1px solid var(--gray-200); }
    .kpi-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .kpi-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .kpi-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
    .kpi-icon.green { background: rgba(16, 185, 129, 0.1); color: #10B981; }
    .kpi-icon.yellow { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
    .kpi-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; }
    .kpi-trend { font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 20px; }
    .kpi-trend.up { background: rgba(16, 185, 129, 0.1); color: #10B981; }
    .kpi-trend.down { background: rgba(220, 53, 69, 0.1); color: #DC3545; }
    .kpi-body { display: flex; flex-direction: column; }
    .kpi-val { font-size: 24px; font-weight: 800; color: var(--gray-800); }
    .kpi-lbl { font-size: 13px; color: var(--gray-500); margin-top: 2px; }

    .charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 30px; }
    .chart-container { padding: 24px; min-height: 350px; display: flex; flex-direction: column; }
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .chart-header h3 { font-size: 16px; font-weight: 700; }
    .chart-legend { font-size: 12px; color: var(--gray-500); display: flex; align-items: center; gap: 6px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.Blue { background: #3B82F6; }
    .dot.success { background: #10B981; }
    .dot.gray { background: var(--gray-300); }

    .growth-chart { flex: 1; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; padding: 0 10px; }
    .growth-bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 10px; height: 100%; justify-content: flex-end; }
    .growth-bar { width: 100%; max-width: 45px; background: linear-gradient(to top, #3B82F6, #60A5FA); border-radius: 6px 6px 0 0; transition: height 1s ease-out; position: relative; }
    .growth-bar:hover { filter: brightness(1.1); }
    .month-label { font-size: 11px; color: var(--gray-400); font-weight: 600; }

    .pie-placeholder { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
    .pie-ring { width: 140px; height: 140px; border-radius: 50%; border: 15px solid #10B981; border-top-color: var(--gray-200); position: relative; display: flex; align-items: center; justify-content: center; }
    .pie-center { text-align: center; display: flex; flex-direction: column; }
    .pie-center strong { font-size: 20px; font-weight: 800; }
    .pie-center span { font-size: 11px; color: var(--gray-400); }
    .pie-labels { display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
    .p-item { display: flex; align-items: center; gap: 8px; }

    .performance-section { margin-bottom: 30px; }
    .section-header { margin-bottom: 16px; }
    .section-header h2 { font-size: 18px; font-weight: 700; }
    .course-cell { display: flex; flex-direction: column; }
    .course-cell span { font-size: 11px; color: var(--gray-400); margin-top: 2px; }
    .rating-cell { display: flex; align-items: center; gap: 6px; font-weight: 700; color: var(--gray-700); }
    .trend-indicator { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px; }
    .trend-indicator.up { color: var(--success); }
    .trend-indicator.side { color: var(--gray-400); }

    .btn-sm { padding: 8px 16px; border-radius: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--gray-200); }
    th { color: var(--gray-500); font-size: 13px; font-weight: 600; }

    /* ===== BẢN IN: MẶC ĐỊNH ẨN GIAO DIỆN CHUYÊN NGHIỆP ===== */
    .print-professional-report { display: none; }

    /* ===== CẤU HÌNH KHI NGƯỜI DÙNG NHẤN IN (CTRL + P) ===== */
    @media print {
      /* Ẩn hoàn toàn layout trang web */
      .screen-only, .instructor-sidebar, .instructor-topbar, app-sidebar, app-header {
        display: none !important;
      }

      /* Reset lại layout gốc */
      .instructor-main, app-instructor-layout, body, html {
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
        font-family: "Times New Roman", Times, serif;
        font-size: 12pt;
      }

      /* Định dạng header Quốc hiệu, Tiêu ngữ */
      .print-header-formal { display: flex; justify-content: space-between; margin-bottom: 40px; text-align: center; line-height: 1.4; }
      .print-header-left { width: 40%; }
      .print-header-right { width: 50%; }
      .print-underline { display: inline-block; border-bottom: 1px solid #000; padding-bottom: 2px; font-weight: bold; }

      /* Định dạng tiêu đề chính */
      .print-title { text-align: center; margin-bottom: 30px; }
      .print-title h1 { font-size: 18pt; font-weight: bold; margin-bottom: 8px; color: #000; }
      .print-title p { margin: 3px 0; font-style: italic; }

      /* Định dạng từng phần báo cáo */
      .print-section { margin-bottom: 30px; page-break-inside: avoid; }
      .print-section h3 { font-size: 14pt; font-weight: bold; margin-bottom: 15px; color: #000; }

      /* Định dạng bảng biểu */
      .print-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
      .print-table th, .print-table td { border: 1px solid #000; padding: 8px 10px; text-align: left; }
      .print-table th { background-color: #f2f2f2 !important; -webkit-print-color-adjust: exact; font-weight: bold; text-align: center;}

      /* Định dạng phần chữ ký */
      .print-signatures { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; page-break-inside: avoid; }
      .sig-box { width: 45%; }
    }

    .mini-donut-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .mini-donut {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      position: relative;
    }
    .mini-donut .donut-hole {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 18px;
      height: 18px;
      background: #fff;
      border-radius: 50%;
    }
    .donut-percent {
      font-size: 12px;
      font-weight: 700;
      color: #15803d;
    }

    /* Modal Overlay */
    .sentiment-modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex; justify-content: center; align-items: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    }

    /* Modal Content */
    .sentiment-modal-content {
      background: #fff;
      width: 450px;
      max-height: 80vh;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .modal-header {
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 { font-size: 16px; font-weight: 800; color: #1e293b; margin: 0; }
    .modal-header p { font-size: 12px; color: #64748b; margin: 0; }

    .modal-body { padding: 12px; overflow: hidden; display: flex; flex-direction: column; }
    .comments-scroll { overflow-y: auto; max-height: 60vh; display: flex; flex-direction: column; gap: 10px; }

    /* Item giống Extension */
    .cmt-item {
      background: #f8fafc;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
    }
    .cmt-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .cmt-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .cmt-text { font-size: 13px; color: #334155; margin: 0; line-height: 1.5; }

    /* Colors từ Extension */
    .bg-green-100 { background: #dcfce7; color: #15803d; }
    .bg-slate-100 { background: #f1f5f9; color: #334155; }
    .bg-red-100 { background: #fee2e2; color: #b91c1c; }
  `]
})
export class InstructorReportsComponent implements OnInit {
  // 1. Định nghĩa Map cảm xúc (giống Chrome Extension)
  emotionMap: any = {
    'Enjoyment': { name: 'Thích', emoji: '😍', polarity: 'pos', color: '#22c55e' },
    'Surprise':  { name: 'Ngạc nhiên', emoji: '😲', polarity: 'pos', color: '#86efac' },
    'Other':     { name: 'Khác', emoji: '🤔', polarity: 'neu', color: '#94a3b8' },
    'Sadness':   { name: 'Buồn', emoji: '😢', polarity: 'neg', color: '#3b82f6' },
    'Anger':     { name: 'Giận', emoji: '😡', polarity: 'neg', color: '#ef4444' },
    'Disgust':   { name: 'Chê', emoji: '🤢', polarity: 'neg', color: '#f97316' },
    'Fear':      { name: 'Sợ', emoji: '😨', polarity: 'neg', color: '#a855f7' }
  };

  // 2. Biến điều khiển Modal
  isModalOpen = false;
  selectedCourse: any = null;
  courseComments: any[] = []; // Danh sách comment của khóa học đang chọn

  // 3. Hàm mở Modal chi tiết
  openSentimentDetail(course: any) {
    this.selectedCourse = course;
    this.isModalOpen = true;
    this.courseComments = []; // Reset dữ liệu cũ

    // Gọi API lấy dữ liệu chi tiết
    this.api.getCourseSentimentDetail(course.maKhoaHoc).subscribe({
      next: (res) => {
        this.courseComments = res || [];
      },
      error: (err) => console.error('Lỗi tải bình luận', err)
    });
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // 4. Hàm tạo Style cho Donut Chart trong bảng (CSS Conic Gradient)
  getDonutStyle(stats: any) {
    if (!stats) return { 'background': '#e2e8f0' };

    const total = stats.pos + stats.neu + stats.neg;
    if (total === 0) return { 'background': '#e2e8f0' };

    const pPos = (stats.pos / total) * 100;
    const pNeu = (stats.neu / total) * 100;

    return {
      'background': `conic-gradient(#22c55e 0% ${pPos}%, #94a3b8 ${pPos}% ${pPos + pNeu}%, #ef4444 ${pPos + pNeu}% 100%)`
    };
  }

  private api = inject(ApiService);

  stats: any = null;
  courses: any[] = [];
  isLoading = true;
  today = new Date();
  publishedCount = 0;
  draftCount = 0;

  isDropdownOpen = false;
  selectedRange = '30 ngày qua';
  dateRanges = ['7 ngày qua', '30 ngày qua', '90 ngày qua', 'Năm nay', 'Toàn thời gian'];

  growthData: any[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    this.api.getInstructorStats(this.selectedRange).subscribe(res => {
      this.stats = res;
    });

    this.api.getInstructorCourses().subscribe(res => {
      this.courses = res || [];
      this.publishedCount = this.courses.filter(c => c.tinhTrang === 'Published').length;
      this.draftCount = this.courses.length - this.publishedCount;
      this.drawPieChart();
    });

    this.api.getRevenueSeries(this.selectedRange).subscribe(res => {
      const data = res || [];
      this.growthData = data.map((d: any) => ({
        month: d.month ?? d.Month,
        value: Number(d.revenue ?? d.Revenue ?? 0)
      }));
      this.isLoading = false;
    });
  }

  getBarHeight(value: number): number {
    if (!this.growthData || this.growthData.length === 0) return 5;
    const max = Math.max(...this.growthData.map(d => d.value));
    // Check thêm !max để bắt cả trường hợp NaN
    if (!max || max === 0) return 5;
    return 5 + (value / max) * 85;
  }

  get linePoints(): string {
    if (!this.growthData || this.growthData.length === 0) return '';
    const max = Math.max(...this.growthData.map(d => d.value));
    // Nếu tất cả doanh thu là 0 hoặc bị NaN thì vẽ một đường thẳng ở đáy
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

  // 1. Tính toán giá trị 3 mốc (Đỉnh, Giữa, Đáy) cho cột Trục Y
  get yAxisLabels(): string[] {
    if (!this.growthData || this.growthData.length === 0) return ['0', '0', '0'];
    const max = Math.max(...this.growthData.map(d => d.value));
    if (!max || max === 0) return ['0', '0', '0'];

    return [
      this.formatShortCurrency(max),
      this.formatShortCurrency(max / 2),
      '0'
    ];
  }

  // 2. Format số tiền siêu ngắn (Rút gọn chữ số 0) để vừa với độ rộng 45px của cột
  formatShortCurrency(value: number): string {
    if (value >= 1000000) return (value / 1000000).toFixed(1).replace('.0', '') + 'Tr';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
    return value.toString();
  }

  drawPieChart() {
    setTimeout(() => {
      const total = this.courses.length;
      if (total === 0) return;
      const deg = (this.publishedCount / total) * 360;
      const ring = document.querySelector('.pie-ring') as HTMLElement;
      if (ring) {
         ring.style.border = 'none';
         ring.style.background = `conic-gradient(#10B981 0deg ${deg}deg, var(--gray-200) ${deg}deg 360deg)`;
         ring.style.borderRadius = '50%';
      }
    }, 100);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectRange(range: string) {
    this.selectedRange = range;
    this.isDropdownOpen = false;
    this.isLoading = true;
    this.loadData();
  }

  // Khởi chạy chế độ in PDF
  exportPDF() {
    window.print();
  }

  // Chức năng xuất Excel thực tế bằng CSV (Hỗ trợ BOM UTF-8)
  exportExcel() {
    // 1. Ký tự BOM giúp Excel nhận diện đúng Font Tiếng Việt
    let csvContent = '\uFEFF';

    // 2. Header File
    csvContent += 'BÁO CÁO HIỆU SUẤT GIẢNG DẠY - EDULEARN\n';
    csvContent += `Thời gian xuất:,"${this.today.toLocaleDateString('vi-VN')} ${this.today.toLocaleTimeString('vi-VN')}"\n`;
    csvContent += `Phạm vi dữ liệu:,"${this.selectedRange}"\n\n`;

    // 3. Section KPI (Tổng quan)
    csvContent += 'I. TỔNG QUAN CHỈ SỐ\n';
    csvContent += 'Chỉ số,Giá trị\n';
    csvContent += `"Tổng số học viên","${this.stats?.tongHocVien || 0}"\n`;
    csvContent += `"Doanh thu tích lũy","${this.stats?.tongDoanhThu || 0} VND"\n`;
    csvContent += `"Xếp hạng trung bình","${this.stats?.tbDanhGia || 0} / 5.0"\n`;
    csvContent += `"Số lượng khóa học đang dạy","${this.stats?.tongKhoaHoc || 0}"\n\n`;

    // 4. Section Chi tiết khóa học
    csvContent += 'II. CHI TIẾT HIỆU SUẤT KHÓA HỌC\n';
    csvContent += 'STT,Tên khóa học,Danh mục,Số lượng học viên,Doanh thu (VND),Đánh giá\n';
    this.courses.forEach((c, index) => {
      const category = c.theLoai || c.TheLoai?.ten || 'Chưa phân loại';
      csvContent += `"${index + 1}","${c.tieuDe}","${category}","${c.soHocVien || 0}","${c.giaGoc || 0}","${c.tbdanhGia || 0}"\n`;
    });

    // 5. Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_Hieu_Suat_Giang_Day_${new Date().getTime()}.csv`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'Tr VNĐ';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'k VNĐ';
    }
    return value + ' VNĐ';
  }
}
