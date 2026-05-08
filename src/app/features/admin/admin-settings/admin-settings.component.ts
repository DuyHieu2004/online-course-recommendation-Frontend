import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../../../layouts/admin-layout/admin-layout.component';
import { ApiService } from '../../../core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1>Cài đặt hệ thống</h1>
          <p class="page-subtitle">
            <i class="fa-solid fa-gear"></i>
            Quản lý cấu hình và tùy chỉnh nền tảng
          </p>
        </div>
        <div class="page-header-right">
          <button class="header-action-btn" (click)="loadSettings()">
            <i class="fa-solid fa-rotate-left"></i> Tải lại
          </button>
          <button class="header-action-btn primary" (click)="saveSettings()">
            <i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi
          </button>
        </div>
      </div>

      <div class="settings-layout">
        <!-- Settings Sidebar -->
        <div class="settings-nav">
          <button *ngFor="let tab of settingsTabs"
                  class="settings-nav-item"
                  [class.active]="activeTab === tab.id"
                  (click)="activeTab = tab.id">
            <div class="nav-item-icon" [ngClass]="'icon-' + tab.theme">
              <i [class]="tab.icon"></i>
            </div>
            <div class="nav-item-text">
              <strong>{{ tab.label }}</strong>
              <span>{{ tab.desc }}</span>
            </div>
          </button>
        </div>

        <!-- Settings Content -->
        <div class="settings-content">
          <!-- General Settings -->
          <div class="settings-section" *ngIf="activeTab === 'general'">
            <div class="section-card">
              <div class="section-card-header">
                <h2>Thông tin nền tảng</h2>
                <span class="section-badge">Cơ bản</span>
              </div>
              <div class="section-card-body">
                <div class="form-group">
                  <label>Tên nền tảng</label>
                  <input type="text" class="form-input" value="EduLearn">
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Email liên hệ</label>
                    <input type="email" class="form-input" value="admin&#64;edulearn.vn">
                  </div>
                  <div class="form-group">
                    <label>Số điện thoại</label>
                    <input type="text" class="form-input" value="0912 345 678">
                  </div>
                </div>
                <div class="form-group">
                  <label>Mô tả ngắn</label>
                  <textarea class="form-input form-textarea">Nền tảng học trực tuyến tích hợp AI hàng đầu Việt Nam</textarea>
                </div>
                <div class="form-group">
                  <label>Logo nền tảng</label>
                  <div class="upload-area">
                    <div class="upload-preview">
                      <span class="upload-icon-preview">E</span>
                    </div>
                    <div class="upload-info">
                      <strong>EduLearn Logo</strong>
                      <span>PNG, SVG • Tối đa 2MB</span>
                      <button class="upload-btn">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Tải lên
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="section-card">
              <div class="section-card-header">
                <h2>Cài đặt khu vực</h2>
                <span class="section-badge green">Địa phương</span>
              </div>
              <div class="section-card-body">
                <div class="form-row">
                  <div class="form-group">
                    <label>Ngôn ngữ mặc định</label>
                    <select class="form-input">
                      <option selected>Tiếng Việt</option>
                      <option>English</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Múi giờ</label>
                    <select class="form-input">
                      <option selected>UTC+7 (Hà Nội)</option>
                      <option>UTC+0 (London)</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Đơn vị tiền tệ</label>
                    <select class="form-input">
                      <option selected>VND (₫)</option>
                      <option>USD ($)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Định dạng ngày</label>
                    <select class="form-input">
                      <option selected>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Learning Settings -->
          <div class="settings-section" *ngIf="activeTab === 'learning'">
            <div class="section-card">
              <div class="section-card-header">
                <h2>Cấu hình học tập</h2>
                <span class="section-badge blue">Học viên</span>
              </div>
              <div class="section-card-body">
                <div class="form-group">
                  <label>Thời gian cho phép trễ mặc định (Ngày)</label>
                  <input type="number" class="form-input" [(ngModel)]="defaultGracePeriod">
                  <span class="form-help">Số ngày được học thêm sau khi hết hạn khóa học (áp dụng toàn hệ thống)</span>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Tự động cấp chứng chỉ</label>
                    <select class="form-input">
                      <option selected>Khi hoàn thành 100%</option>
                      <option>Khi hoàn thành 80% và vượt qua bài thi</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Giới hạn thiết bị đăng nhập</label>
                    <input type="number" class="form-input" value="2">
                    <span class="form-help">Số lượng thiết bị tối đa có thể đăng nhập cùng lúc</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="section-card">
              <div class="section-card-header">
                <h2>Cấu hình Video & Player</h2>
                <span class="section-badge purple">Trải nghiệm</span>
              </div>
              <div class="section-card-body">
                <div class="form-row">
                  <div class="form-group">
                    <label>Chất lượng mặc định</label>
                    <select class="form-input">
                      <option>Auto (Khuyên dùng)</option>
                      <option>1080p Full HD</option>
                      <option selected>720p HD</option>
                      <option>480p SD</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Tốc độ phát tối đa</label>
                    <select class="form-input">
                      <option>1.5x</option>
                      <option selected>2.0x</option>
                      <option>3.0x</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                   <div class="form-group">
                    <label>Cho phép tua video</label>
                    <label class="toggle-switch" style="margin-top: 8px;">
                      <input type="checkbox" checked>
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                  <div class="form-group">
                    <label>Ghi nhớ vị trí phát</label>
                    <label class="toggle-switch" style="margin-top: 8px;">
                      <input type="checkbox" checked>
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Settings -->
          <div class="settings-section" *ngIf="activeTab === 'payment'">
            <div class="section-card">
              <div class="section-card-header">
                <h2>Cổng thanh toán</h2>
                <span class="section-badge blue">Tích hợp</span>
              </div>
              <div class="section-card-body">
                <div *ngFor="let gateway of paymentGateways" class="payment-gateway-item">
                  <div class="gateway-left">
                    <div class="gateway-icon" [style.background]="gateway.color">
                      <i [class]="gateway.icon"></i>
                    </div>
                    <div class="gateway-info">
                      <strong>{{ gateway.name }}</strong>
                      <span>{{ gateway.desc }}</span>
                    </div>
                  </div>
                  <div class="gateway-right">
                    <span class="gateway-status" [class.active]="gateway.active" [class.inactive]="!gateway.active">
                      {{ gateway.active ? 'Đang hoạt động' : 'Chưa kích hoạt' }}
                    </span>
                    <label class="toggle-switch">
                      <input type="checkbox" [checked]="gateway.active">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="section-card">
              <div class="section-card-header">
                <h2>Chính sách giá</h2>
                <span class="section-badge orange">Kinh doanh</span>
              </div>
              <div class="section-card-body">
                <div class="form-row">
                  <div class="form-group">
                    <label>Phí nền tảng (%)</label>
                    <input type="number" class="form-input" value="15">
                    <span class="form-help">Phần trăm hoa hồng từ mỗi giao dịch</span>
                  </div>
                  <div class="form-group">
                    <label>Giá tối thiểu (VND)</label>
                    <input type="number" class="form-input" value="99000">
                    <span class="form-help">Giá khóa học tối thiểu cho phép</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>Chính sách hoàn tiền</label>
                  <select class="form-input">
                    <option selected>Hoàn tiền trong 7 ngày</option>
                    <option>Hoàn tiền trong 14 ngày</option>
                    <option>Hoàn tiền trong 30 ngày</option>
                    <option>Không hoàn tiền</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div class="settings-section" *ngIf="activeTab === 'notification'">
            <div class="section-card">
              <div class="section-card-header">
                <h2>Thông báo Email</h2>
                <span class="section-badge purple">Giao tiếp</span>
              </div>
              <div class="section-card-body">
                <div *ngFor="let notif of emailNotifications" class="notif-item template-item">
                  <div class="notif-info">
                    <strong>{{ notif.label }}</strong>
                    <span>{{ notif.desc }}</span>
                  </div>
                  <div class="notif-actions">
                    <button class="edit-template-btn" (click)="editTemplate(notif)">
                      <i class="fa-solid fa-pen-to-square"></i> Mẫu email
                    </button>
                    <label class="toggle-switch">
                      <input type="checkbox" [(ngModel)]="notif.enabled">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Template Editor -->
            <div class="section-card" *ngIf="editingTemplate" style="border-top: 4px solid var(--primary); animation: slideInUp 0.3s ease;">
              <div class="section-card-header">
                <h2>Chỉnh sửa mẫu: {{ editingTemplate.label }}</h2>
                <button class="close-btn" (click)="editingTemplate = null" style="background:transparent; border:none; cursor:pointer; font-size: 18px; color: var(--gray-400);">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div class="section-card-body">
                <div class="form-group">
                  <label>Tiêu đề Email</label>
                  <input type="text" class="form-input" [(ngModel)]="currentTemplate.subject">
                </div>
                <div class="form-group">
                  <label>Nội dung (HTML hỗ trợ)</label>
                  <textarea class="form-input form-textarea" style="min-height: 200px;" [(ngModel)]="currentTemplate.body"></textarea>
                </div>
                <div class="template-placeholders">
                  <strong>Placeholders:</strong>
                  <div class="placeholder-chips">
                    <span class="chip" title="Tên người nhận">{{ '{{' }}userName{{ '}}' }}</span>
                    <span class="chip" title="Tên khóa học">{{ '{{' }}courseName{{ '}}' }}</span>
                    <span class="chip" title="Ngày hết hạn">{{ '{{' }}deadline{{ '}}' }}</span>
                    <span class="chip" title="Link truy cập">{{ '{{' }}link{{ '}}' }}</span>
                  </div>
                </div>
                <div class="form-actions" style="margin-top: 20px; border-top: none; padding-top: 0;">
                  <button class="header-action-btn primary" (click)="applyTemplate()">
                    <i class="fa-solid fa-check"></i> Lưu mẫu này
                  </button>
                </div>
              </div>
            </div>

            <div class="section-card">
              <div class="section-card-header">
                <h2>Cấu hình SMTP</h2>
                <span class="section-badge">Kỹ thuật</span>
              </div>
              <div class="section-card-body">
                <div class="form-row">
                  <div class="form-group">
                    <label>SMTP Host</label>
                    <input type="text" class="form-input" [(ngModel)]="smtpConfig.host">
                  </div>
                  <div class="form-group">
                    <label>Port</label>
                    <input type="number" class="form-input" [(ngModel)]="smtpConfig.port">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Tên người gửi</label>
                    <input type="text" class="form-input" [(ngModel)]="smtpConfig.fromName">
                  </div>
                  <div class="form-group">
                    <label>Email người gửi</label>
                    <input type="email" class="form-input" [(ngModel)]="smtpConfig.fromEmail">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Mật khẩu ứng dụng (App Password)</label>
                    <input type="password" class="form-input" [(ngModel)]="smtpConfig.password">
                    <span class="form-help">Mật khẩu ứng dụng dành cho Gmail hoặc SMTP server</span>
                  </div>
                </div>
                <button class="test-btn">
                  <i class="fa-solid fa-paper-plane"></i> Gửi email thử nghiệm
                </button>
              </div>
            </div>
          </div>

          <!-- Security Settings -->
          <div class="settings-section" *ngIf="activeTab === 'security'">
            <div class="section-card">
              <div class="section-card-header">
                <h2>Bảo mật tài khoản</h2>
                <span class="section-badge red">Quan trọng</span>
              </div>
              <div class="section-card-body">
                <div *ngFor="let sec of securitySettings" class="notif-item">
                  <div class="notif-info">
                    <div class="notif-label-row">
                      <strong>{{ sec.label }}</strong>
                      <span class="sec-badge" *ngIf="sec.recommended" [class.on]="sec.enabled">
                        {{ sec.enabled ? '✓ Đang bật' : 'Khuyến nghị' }}
                      </span>
                    </div>
                    <span>{{ sec.desc }}</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" [(ngModel)]="sec.enabled">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="section-card">
              <div class="section-card-header">
                <h2>Phiên đăng nhập</h2>
                <span class="section-badge">Quản lý</span>
              </div>
              <div class="section-card-body">
                <div class="form-row">
                  <div class="form-group">
                    <label>Thời gian phiên (phút)</label>
                    <input type="number" class="form-input" value="60">
                    <span class="form-help">Tự động đăng xuất sau khoảng thời gian không hoạt động</span>
                  </div>
                  <div class="form-group">
                    <label>Số lần đăng nhập sai tối đa</label>
                    <input type="number" class="form-input" value="5">
                    <span class="form-help">Khoá tài khoản sau số lần nhập sai liên tiếp</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Settings -->
          <div class="settings-section" *ngIf="activeTab === 'ai'">
            <div class="section-card">
              <div class="section-card-header">
                <h2>Cấu hình AI</h2>
                <span class="section-badge purple">Nâng cao</span>
              </div>
              <div class="section-card-body">
                <div class="ai-model-card">
                  <div class="ai-model-header">
                    <div class="ai-model-icon">
                      <i class="fa-solid fa-robot"></i>
                    </div>
                    <div class="ai-model-info">
                      <strong>GPT-4 Turbo</strong>
                      <span>Model AI chính cho gợi ý khóa học</span>
                    </div>
                    <span class="ai-status active">Đang hoạt động</span>
                  </div>
                  <div class="ai-model-stats">
                    <div class="ai-stat">
                      <span class="ai-stat-value">12.450</span>
                      <span class="ai-stat-label">Yêu cầu / ngày</span>
                    </div>
                    <div class="ai-stat">
                      <span class="ai-stat-value">245ms</span>
                      <span class="ai-stat-label">Thời gian phản hồi TB</span>
                    </div>
                    <div class="ai-stat">
                      <span class="ai-stat-value">99.8%</span>
                      <span class="ai-stat-label">Uptime</span>
                    </div>
                  </div>
                </div>

                <div class="form-group" style="margin-top: 20px;">
                  <label>API Key</label>
                  <div class="api-key-input">
                    <input type="password" class="form-input" value="sk-xxxxxxxxxxxxxxxxxxxxxxx">
                    <button class="api-key-toggle" title="Hiện/Ẩn">
                      <i class="fa-solid fa-eye"></i>
                    </button>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Nhiệt độ (Temperature)</label>
                    <input type="number" class="form-input" value="0.7" step="0.1">
                    <span class="form-help">Giá trị từ 0 đến 1. Cao = sáng tạo hơn</span>
                  </div>
                  <div class="form-group">
                    <label>Max Tokens</label>
                    <input type="number" class="form-input" value="2048">
                    <span class="form-help">Số token tối đa cho mỗi phản hồi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Toast -->
      <div class="save-toast" *ngIf="showSaveToast" (click)="showSaveToast = false">
        <i class="fa-solid fa-circle-check"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    /* ===== Page Header ===== */
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    h1 { font-size: 26px; font-weight: 800; color: var(--gray-800); margin-bottom: 6px; letter-spacing: -0.3px; }
    .page-subtitle { font-size: 13px; color: var(--gray-500); display: flex; align-items: center; gap: 6px; }
    .page-header-right { display: flex; gap: 10px; }
    .header-action-btn {
      display: inline-flex; align-items: center; gap: 8px; padding: 9px 18px;
      border-radius: 10px; font-size: 13px; font-weight: 600;
      border: 1px solid var(--gray-200); background: var(--white); color: var(--gray-600);
      cursor: pointer; transition: all 0.25s ease;
    }
    .header-action-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .header-action-btn.primary { background: linear-gradient(135deg, #5B63D3 0%, #7B82E0 100%); color: white; border: none; }
    .header-action-btn.primary:hover { box-shadow: 0 4px 16px rgba(91,99,211,0.35); }

    /* ===== Settings Layout ===== */
    .settings-layout { display: flex; gap: 24px; }
    .settings-nav { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 6px; }
    .settings-content { flex: 1; min-width: 0; }

    .settings-nav-item {
      display: flex; align-items: center; gap: 14px; padding: 14px 16px;
      border-radius: 14px; background: var(--white); border: 1px solid var(--gray-200);
      cursor: pointer; transition: all 0.25s ease; text-align: left;
    }
    .settings-nav-item:hover { border-color: var(--gray-300); transform: translateX(4px); }
    .settings-nav-item.active {
      background: linear-gradient(135deg, rgba(91,99,211,0.06) 0%, rgba(123,130,224,0.03) 100%);
      border-color: var(--primary); box-shadow: 0 2px 8px rgba(91,99,211,0.08);
    }
    .nav-item-icon {
      width: 40px; height: 40px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;
    }
    .icon-blue { background: rgba(91,99,211,0.1); color: #5B63D3; }
    .icon-green { background: rgba(40,167,69,0.1); color: #28A745; }
    .icon-orange { background: rgba(253,126,20,0.1); color: #FD7E14; }
    .icon-purple { background: rgba(139,92,246,0.1); color: #8B5CF6; }
    .icon-red { background: rgba(220,53,69,0.1); color: #DC3545; }
    .nav-item-text strong { display: block; font-size: 14px; color: var(--gray-800); }
    .nav-item-text span { font-size: 12px; color: var(--gray-400); }

    /* ===== Section Cards ===== */
    .settings-section { display: flex; flex-direction: column; gap: 20px; }
    .section-card {
      background: var(--white); border-radius: 16px; border: 1px solid var(--gray-200); overflow: hidden;
      animation: fadeSlideIn 0.4s ease forwards; opacity: 0;
    }
    @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .section-card-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid var(--gray-100);
    }
    .section-card-header h2 { font-size: 17px; font-weight: 700; color: var(--gray-800); margin: 0; }
    .section-badge {
      padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;
      background: var(--gray-100); color: var(--gray-500);
    }
    .section-badge.green { background: rgba(40,167,69,0.1); color: #28A745; }
    .section-badge.blue { background: rgba(91,99,211,0.1); color: #5B63D3; }
    .section-badge.orange { background: rgba(253,126,20,0.1); color: #FD7E14; }
    .section-badge.purple { background: rgba(139,92,246,0.1); color: #8B5CF6; }
    .section-badge.red { background: rgba(220,53,69,0.1); color: #DC3545; }
    .section-card-body { padding: 24px; }

    /* ===== Forms ===== */
    .form-group { margin-bottom: 18px; }
    .form-group label { display: block; font-weight: 600; font-size: 13px; color: var(--gray-700); margin-bottom: 8px; }
    .form-input {
      width: 100%; padding: 11px 14px; border: 1px solid var(--gray-200); border-radius: 10px;
      font-size: 14px; color: var(--gray-700); background: var(--gray-50);
      transition: all 0.25s ease; outline: none; font-family: var(--font);
    }
    .form-input:focus { border-color: var(--primary); background: var(--white); box-shadow: 0 0 0 3px rgba(91,99,211,0.1); }
    .form-textarea { min-height: 80px; resize: vertical; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-help { font-size: 11px; color: var(--gray-400); margin-top: 4px; display: block; }

    /* ===== Upload ===== */
    .upload-area {
      display: flex; align-items: center; gap: 16px; padding: 16px;
      border: 2px dashed var(--gray-200); border-radius: 12px; background: var(--gray-50);
    }
    .upload-preview { }
    .upload-icon-preview {
      width: 56px; height: 56px; border-radius: 14px;
      background: linear-gradient(135deg, #5B63D3, #7B82E0);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 900; font-size: 24px;
    }
    .upload-info { }
    .upload-info strong { display: block; font-size: 14px; color: var(--gray-700); }
    .upload-info span { font-size: 12px; color: var(--gray-400); display: block; margin-bottom: 8px; }
    .upload-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
      border-radius: 8px; background: var(--primary); color: white;
      font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; border: none;
    }
    .upload-btn:hover { background: var(--primary-dark); transform: translateY(-1px); }

    /* ===== Payment Gateways ===== */
    .payment-gateway-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 0; border-bottom: 1px solid var(--gray-100);
    }
    .payment-gateway-item:last-child { border-bottom: none; }
    .gateway-left { display: flex; align-items: center; gap: 14px; }
    .gateway-icon {
      width: 42px; height: 42px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 18px;
    }
    .gateway-info strong { display: block; font-size: 14px; color: var(--gray-800); }
    .gateway-info span { font-size: 12px; color: var(--gray-400); }
    .gateway-right { display: flex; align-items: center; gap: 14px; }
    .gateway-status { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; }
    .gateway-status.active { background: rgba(40,167,69,0.08); color: #28A745; }
    .gateway-status.inactive { background: rgba(220,53,69,0.08); color: #DC3545; }

    /* ===== Toggle Switch ===== */
    .toggle-switch { position: relative; display: inline-block; width: 48px; height: 26px; cursor: pointer; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: var(--gray-300); border-radius: 26px; transition: all 0.3s ease;
    }
    .toggle-slider::before {
      content: ''; position: absolute; height: 20px; width: 20px; left: 3px; bottom: 3px;
      background: white; border-radius: 50%; transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    }
    .toggle-switch input:checked + .toggle-slider { background: linear-gradient(135deg, #5B63D3, #7B82E0); }
    .toggle-switch input:checked + .toggle-slider::before { transform: translateX(22px); }

    /* ===== Notification Items ===== */
    .notif-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 0; border-bottom: 1px solid var(--gray-100);
    }
    .notif-item:last-child { border-bottom: none; }
    .notif-info { max-width: 80%; }
    .notif-info strong { display: block; font-size: 14px; color: var(--gray-800); margin-bottom: 2px; }
    .notif-info span { font-size: 12px; color: var(--gray-400); }
    .notif-label-row { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
    .sec-badge {
      font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
      background: rgba(253,126,20,0.1); color: #FD7E14;
    }
    .sec-badge.on { background: rgba(40,167,69,0.1); color: #28A745; }

    /* ===== Test Button ===== */
    .test-btn {
      display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
      border-radius: 10px; background: var(--gray-100); color: var(--gray-600);
      font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; border: none;
    }
    .test-btn:hover { background: var(--gray-200); transform: translateY(-1px); }

    /* ===== AI Section ===== */
    .ai-model-card {
      background: linear-gradient(135deg, rgba(91,99,211,0.04) 0%, rgba(139,92,246,0.04) 100%);
      border: 1px solid rgba(91,99,211,0.1); border-radius: 14px; padding: 20px;
    }
    .ai-model-header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
    .ai-model-icon {
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg, #5B63D3, #8B5CF6);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 22px;
    }
    .ai-model-info { flex: 1; }
    .ai-model-info strong { display: block; font-size: 16px; color: var(--gray-800); }
    .ai-model-info span { font-size: 12px; color: var(--gray-400); }
    .ai-status {
      padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
    }
    .ai-status.active { background: rgba(40,167,69,0.1); color: #28A745; }
    .ai-model-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .ai-stat {
      text-align: center; padding: 14px; background: var(--white); border-radius: 10px;
      border: 1px solid var(--gray-200);
    }
    .ai-stat-value { display: block; font-size: 20px; font-weight: 800; color: var(--gray-800); }
    .ai-stat-label { font-size: 11px; color: var(--gray-400); }

    /* ===== Template Editor ===== */
    .notif-actions { display: flex; align-items: center; gap: 16px; }
    .edit-template-btn {
      padding: 6px 12px; border-radius: 8px; border: 1px solid var(--primary);
      background: transparent; color: var(--primary); font-size: 12px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
    }
    .edit-template-btn:hover { background: var(--primary); color: white; }
    .template-placeholders { margin-top: 12px; padding: 12px; background: var(--gray-50); border-radius: 10px; }
    .template-placeholders strong { display: block; font-size: 12px; margin-bottom: 8px; color: var(--gray-600); }
    .placeholder-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      padding: 4px 10px; background: white; border: 1px solid var(--gray-200);
      border-radius: 6px; font-size: 11px; font-family: monospace; color: var(--primary);
      cursor: help;
    }
    @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .api-key-input { position: relative; }
    .api-key-input .form-input { padding-right: 44px; }
    .api-key-toggle {
      position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
      width: 36px; height: 36px; border-radius: 8px; border: none;
      background: transparent; color: var(--gray-400); cursor: pointer; transition: all 0.2s ease;
    }
    .api-key-toggle:hover { background: var(--gray-100); color: var(--gray-600); }

    /* ===== Save Toast ===== */
    .save-toast {
      position: fixed; bottom: 32px; right: 32px;
      background: var(--gray-800); color: white;
      padding: 14px 24px; border-radius: 14px;
      display: flex; align-items: center; gap: 10px;
      font-size: 14px; font-weight: 600;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      animation: toastSlide 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      cursor: pointer; z-index: 100;
    }
    .save-toast i { color: #28A745; font-size: 18px; }
    @keyframes toastSlide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminSettingsComponent implements OnInit {
  activeTab = 'general';
  showSaveToast = false;
  toastMessage = '';
  defaultGracePeriod = 7;

  settingsTabs = [
    { id: 'general', label: 'Tổng quát', desc: 'Thông tin cơ bản', icon: 'fa-solid fa-sliders', theme: 'blue' },
    { id: 'learning', label: 'Học tập', desc: 'Quy tắc & chứng chỉ', icon: 'fa-solid fa-graduation-cap', theme: 'blue' },
    { id: 'payment', label: 'Thanh toán', desc: 'Cổng & chính sách', icon: 'fa-solid fa-credit-card', theme: 'green' },
    { id: 'notification', label: 'Thông báo', desc: 'Email & push', icon: 'fa-solid fa-bell', theme: 'orange' },
    { id: 'security', label: 'Bảo mật', desc: 'Tài khoản & phiên', icon: 'fa-solid fa-shield-halved', theme: 'red' },
    { id: 'ai', label: 'AI & ML', desc: 'Model & cấu hình', icon: 'fa-solid fa-robot', theme: 'purple' },
  ];

  paymentGateways = [
    { name: 'VNPay', desc: 'Cổng thanh toán trực tuyến VNPay', icon: 'fa-solid fa-building-columns', color: '#1E3A5F', active: true },
    { name: 'MoMo', desc: 'Ví điện tử MoMo', icon: 'fa-solid fa-wallet', color: '#AE2070', active: true },
    { name: 'ZaloPay', desc: 'Thanh toán qua ZaloPay', icon: 'fa-solid fa-bolt', color: '#0068FF', active: false },
    { name: 'Chuyển khoản', desc: 'Chuyển khoản ngân hàng trực tiếp', icon: 'fa-solid fa-money-bill-transfer', color: '#28A745', active: true },
  ];

  emailNotifications = [
    { label: 'Người dùng mới', desc: 'Thông báo khi có tài khoản học viên mới đăng ký', enabled: true },
    { label: 'Giảng viên mới', desc: 'Thông báo khi có giảng viên đăng ký mới chờ duyệt', enabled: true },
    { label: 'Giao dịch mới', desc: 'Thông báo khi có giao dịch thanh toán thành công trên hệ thống', enabled: true },
    { label: 'Báo cáo vi phạm', desc: 'Thông báo khi có khóa học hoặc bình luận bị báo cáo', enabled: true },
    { label: 'Hệ thống', desc: 'Thông báo về tình trạng backup và cập nhật server', enabled: true },
  ];

  smtpConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    fromName: 'EduLearn',
    fromEmail: 'noreply@edulearn.vn',
    password: ''
  };

  securitySettings = [
    { label: 'Xác thực 2 yếu tố (2FA)', desc: 'Yêu cầu mã OTP khi đăng nhập', enabled: true, recommended: true },
    { label: 'Mã hóa dữ liệu', desc: 'Mã hóa AES-256 cho dữ liệu nhạy cảm', enabled: true, recommended: true },
    { label: 'Giới hạn IP', desc: 'Chỉ cho phép đăng nhập từ IP đã đăng ký', enabled: false, recommended: false },
    { label: 'Đăng nhập SSO', desc: 'Hỗ trợ đăng nhập bằng Google, Facebook', enabled: true, recommended: true },
    { label: 'Captcha đăng nhập', desc: 'Yêu cầu captcha sau 3 lần đăng nhập thất bại', enabled: true, recommended: true },
  ];

  constructor(private apiService: ApiService) {}

  editingTemplate: any = null;
  currentTemplate = { subject: '', body: '' };
  allTemplates: { [key: string]: { subject: string, body: string } } = {};

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.apiService.getSettings().subscribe({
      next: (res: any) => {
        if (res) {
          this.defaultGracePeriod = res.defaultGracePeriod;
          this.smtpConfig = res.smtp || this.smtpConfig;
          this.allTemplates = res.templates || {};
        }
      },
      error: (err) => console.error('Lỗi tải cài đặt:', err)
    });
  }

  editTemplate(notif: any) {
    this.editingTemplate = notif;
    this.currentTemplate = { 
      ...(this.allTemplates[notif.label] || { subject: `Thông báo: ${notif.label}`, body: '<p>Chào {{userName}},</p><p>Đây là thông báo về {{courseName}}.</p>' }) 
    };
  }

  applyTemplate() {
    if (this.editingTemplate) {
      this.allTemplates[this.editingTemplate.label] = { ...this.currentTemplate };
      this.editingTemplate = null;
      Swal.fire({
        toast: true, position: 'top-end', icon: 'success', title: 'Đã cập nhật mẫu tạm thời', showConfirmButton: false, timer: 1500
      });
    }
  }

  saveSettings() {
    const settings = {
      defaultGracePeriod: this.defaultGracePeriod,
      smtp: this.smtpConfig,
      enableExpiryNotification: true,
      templates: this.allTemplates
    };

    this.apiService.updateSettings(settings).subscribe({
      next: () => {
        this.toastMessage = 'Cài đặt và các mẫu email đã được lưu thành công!';
        this.showSaveToast = true;
        setTimeout(() => this.showSaveToast = false, 3000);
      },
      error: (err) => {
        console.error('Lỗi lưu cài đặt:', err);
        this.toastMessage = 'Đã có lỗi xảy ra khi lưu cài đặt.';
        this.showSaveToast = true;
      }
    });
  }
}
