import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InstructorLayoutComponent } from '../../../layouts/instructor-layout/instructor-layout.component';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-instructor-settings',
  standalone: true,
  imports: [CommonModule, InstructorLayoutComponent, FormsModule],
  template: `
    <app-instructor-layout>
      <div class="header-action">
        <div>
          <h1><i class="fa-solid fa-gear"></i> Thiết lập tài khoản</h1>
          <p class="subtitle">Quản lý hồ sơ giảng viên, thanh toán và thông báo.</p>
        </div>
      </div>

      <div class="settings-tabs-nav">
        <button class="tab-btn" [class.active]="currentTab === 'profile'" (click)="currentTab = 'profile'">
          <i class="fa-solid fa-user-tie"></i> Hồ sơ
        </button>
        <button class="tab-btn" [class.active]="currentTab === 'payout'" (click)="currentTab = 'payout'">
          <i class="fa-solid fa-credit-card"></i> Thanh toán
        </button>
        <button class="tab-btn" [class.active]="currentTab === 'notifications'" (click)="currentTab = 'notifications'">
          <i class="fa-solid fa-bell"></i> Thông báo
        </button>
      </div>

      <div class="settings-content-wrapper">
        <!-- Profile Tab -->
        <div class="tab-content fade-in" *ngIf="currentTab === 'profile'">
          <div class="settings-grid">
            <div class="section card">
              <h3 class="section-title"><i class="fa-solid fa-id-card"></i> Thông tin cá nhân</h3>
              
              <div class="avatar-edit">
                <div class="avatar-preview" [style.background-image]="avatarUrl ? 'url(' + avatarUrl + ')' : ''" [class.no-avt]="!avatarUrl">
                  <i class="fa-solid fa-camera" *ngIf="!avatarUrl"></i>
                </div>
                <div class="avatar-actions">
                  <label class="btn btn-outline btn-sm">
                    <i class="fa-solid fa-upload"></i> Tải ảnh mới
                    <input type="file" hidden accept="image/*" (change)="onFileSelected($event)">
                  </label>
                  <button class="btn btn-icon btn-sm" style="color:var(--danger); border-color:transparent;" (click)="avatarUrl=''" title="Xóa ảnh"><i class="fa-solid fa-trash"></i></button>
                </div>
              </div>
              
              <div class="form-group mt-20">
                <label>Email tài khoản</label>
                <input type="text" class="form-control" [value]="email" readonly style="background: var(--gray-50); color: var(--gray-500); cursor: not-allowed;">
              </div>
              
              <div class="form-group">
                <label>Tên hiển thị (Tên thật)</label>
                <input type="text" class="form-control" [(ngModel)]="fullName" placeholder="Nhập tên thật">
              </div>
              
              <div class="form-group">
                <label>Danh hiệu / Nghề nghiệp</label>
                <input type="text" class="form-control" [(ngModel)]="jobTitle" placeholder="Vd: Giảng viên Senior Frontend">
              </div>

          <div class="form-group">
            <label>Tiểu sử / Tóm tắt chuyên môn</label>
            <textarea class="form-control" rows="4" [(ngModel)]="bio" placeholder="Giới thiệu nhanh về bạn, kinh nghiệm của bạn để hiển thị cho học viên..."></textarea>
          </div>
          
          <div class="form-actions">
            <button class="btn btn-primary" [disabled]="isSaving" (click)="saveProfile()">
              <i class="fa-solid fa-circle-notch fa-spin" *ngIf="isSaving"></i> 
              <i class="fa-solid fa-save" *ngIf="!isSaving"></i> {{ isSaving ? 'Đang lưu...' : 'Lưu hồ sơ' }}
            </button>
            <span class="save-success" *ngIf="saveSuccess"><i class="fa-solid fa-check"></i> Đã lưu thành công!</span>
          </div>
        </div>

            <div class="section card">
              <h3 class="section-title"><i class="fa-solid fa-circle-info"></i> Hiển thị</h3>
              <p class="text-sm">Thông tin này sẽ được hiển thị trên trang chi tiết khóa học của bạn để học viên có thể tìm hiểu thêm.</p>
              <div class="preview-card-mini">
                 <div class="mini-avatar" [style.background-image]="'url(' + avatarUrl + ')'"></div>
                 <div class="mini-info">
                   <strong>{{ fullName || 'Giảng viên' }}</strong>
                   <span>{{ jobTitle || 'Chưa cập nhật danh hiệu' }}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payout Tab -->
        <div class="tab-content fade-in" *ngIf="currentTab === 'payout'">
          <div class="settings-grid">
            <div class="section card">
              <h3 class="section-title"><i class="fa-solid fa-university"></i> Tài khoản nhận tiền</h3>
              <p class="text-sm">Để nhận được doanh thu hàng tháng, bạn cần cập nhật thông tin tài khoản ngân hàng chính chủ.</p>
              
              <div class="form-group mt-20">
                <label>Ngân hàng hưởng thụ</label>
                <select class="form-select">
                  <option>Vietcombank - NHTM CP Ngoại thương VN</option>
                  <option>Techcombank - NHTM CP Kỹ thương VN</option>
                  <option>MBBank - NH QĐ</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Số tài khoản</label>
                <div class="pwd-input-wrapper">
                  <input [type]="showBank ? 'text' : 'password'" class="form-control" value="0123456789">
                  <span class="pwd-toggle" (click)="showBank = !showBank">
                    <i class="fa-solid" [ngClass]="showBank ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </span>
                </div>
              </div>
              
              <div class="form-group">
                <label>Tên chủ thẻ</label>
                <input type="text" class="form-control" [value]="fullName | uppercase" readonly style="background:var(--gray-50)">
              </div>
              
              <button class="btn btn-primary w-100">Cập nhật tài khoản ngân hàng</button>
            </div>

            <div class="section card alert-card">
              <h3 class="section-title"><i class="fa-solid fa-shield-check"></i> Quy định bảo mật</h3>
              <div class="payout-note">
                <strong>Lưu ý quan trọng:</strong>
                <ul>
                  <li>Mọi thay đổi thông tin ngân hàng sẽ bị khóa (hold) 14 ngày.</li>
                  <li>Tên chủ thẻ phải trùng khớp với tên trên CCCD/Passport.</li>
                  <li>Hệ thống thực hiện đối soát và chuyển tiền vào ngày 15 hàng tháng.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications Tab -->
        <div class="tab-content fade-in" *ngIf="currentTab === 'notifications'">
          <div class="section card max-w-800">
            <h3 class="section-title"><i class="fa-solid fa-bell"></i> Cài đặt thông báo Giảng viên</h3>
            <p class="text-sm">Tùy chỉnh các loại thông báo email bạn muốn nhận liên quan đến hoạt động giảng dạy và doanh thu.</p>
            
            <div class="notification-list">
              <div *ngFor="let notif of instructorNotifications" class="notif-item">
                <div class="notif-info">
                  <strong>{{ notif.label }}</strong>
                  <p>{{ notif.desc }}</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="notif.enabled">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn btn-primary" [disabled]="isSavingNotif" (click)="saveNotifications()">
                <i class="fa-solid fa-circle-notch fa-spin" *ngIf="isSavingNotif"></i> 
                <i class="fa-solid fa-save" *ngIf="!isSavingNotif"></i> {{ isSavingNotif ? 'Đang lưu...' : 'Lưu cài đặt' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </app-instructor-layout>
  `,
  styles: [`
    h1 { font-size: 24px; margin-bottom: 4px; font-weight: 800; }
    .subtitle { font-size: 14px; color: var(--gray-500); }
    .header-action { margin-bottom: 32px; }

    /* ===== Tabs Nav ===== */
    .settings-tabs-nav {
      display: flex; gap: 8px; margin-bottom: 24px;
      border-bottom: 1px solid var(--gray-200); padding-bottom: 2px;
    }
    .tab-btn {
      padding: 12px 24px; border: none; background: transparent;
      font-size: 14px; font-weight: 600; color: var(--gray-500);
      cursor: pointer; position: relative; transition: all 0.2s;
      display: flex; align-items: center; gap: 8px;
    }
    .tab-btn:hover { color: #FF7B54; }
    .tab-btn.active { color: #FF7B54; }
    .tab-btn.active::after {
      content: ''; position: absolute; bottom: -2px; left: 0; width: 100%;
      height: 3px; background: #FF7B54; border-radius: 3px 3px 0 0;
    }
    
    .settings-grid {
      display: grid;
      grid-template-columns: 2fr 1.2fr;
      gap: 24px;
    }
    .max-w-800 { max-width: 800px; margin: 0 auto; }
    
    .section { padding: 32px; background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid var(--gray-100); }
    .section-title { font-size: 16px; font-weight: 700; color: var(--gray-800); margin-bottom: 24px; display: flex; align-items: center; gap: 8px;}
    .section-title i { color: #FF7B54;}
    
    .avatar-edit { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; padding: 16px; background: var(--gray-50); border-radius: 16px; }
    .avatar-preview {
      width: 80px; height: 80px; border-radius: 50%;
      background-size: cover; background-position: center; border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .avatar-preview.no-avt {
      background: var(--gray-100); display: flex; align-items: center; justify-content: center;
      font-size: 28px; color: var(--gray-300);
    }
    .avatar-actions { display: flex; gap: 10px; }
    
    .form-group { margin-bottom: 20px; position: relative; }
    .form-group label { display: block; font-size: 13px; font-weight: 700; color: var(--gray-700); margin-bottom: 8px; }
    .form-control {
      width: 100%; padding: 12px 16px; border: 1.5px solid var(--gray-200); border-radius: 12px;
      font-size: 14px; outline: none; transition: all 0.25s ease;
      font-family: inherit;
    }
    .form-control:focus {
      border-color: #FF7B54; box-shadow: 0 0 0 4px rgba(255,123,84,0.1);
    }
    .form-select {
      width: 100%; padding: 12px 16px; border: 1.5px solid var(--gray-200); border-radius: 12px;
      font-size: 14px; background: var(--white); outline: none; cursor: pointer;
    }
    
    .text-sm { font-size: 13px; color: var(--gray-500); margin-bottom: 20px; line-height: 1.5; }

    /* ===== Notification List ===== */
    .notification-list { display: flex; flex-direction: column; gap: 16px; }
    .notif-item {
      display: flex; justify-content: space-between; align-items: center;
      padding-bottom: 16px; border-bottom: 1px solid var(--gray-100);
    }
    .notif-item:last-child { border-bottom: none; }
    .notif-info strong { display: block; font-size: 14px; color: var(--gray-800); margin-bottom: 4px; }
    .notif-info p { font-size: 12px; color: var(--gray-500); margin: 0; }

    /* ===== Toggle Switch ===== */
    .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: var(--gray-200); border-radius: 24px; transition: 0.3s;
    }
    .toggle-slider:before {
      content: ""; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px;
      background: white; border-radius: 50%; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    input:checked + .toggle-slider { background: #FF7B54; }
    input:checked + .toggle-slider:before { transform: translateX(20px); }

    .preview-card-mini {
      display: flex; align-items: center; gap: 12px; padding: 16px;
      background: var(--gray-50); border-radius: 12px; border: 1px solid var(--gray-100);
    }
    .mini-avatar { width: 44px; height: 44px; border-radius: 50%; background-size: cover; background-position: center; }
    .mini-info strong { display: block; font-size: 14px; color: var(--gray-800); }
    .mini-info span { font-size: 12px; color: var(--gray-500); }

    .payout-note ul { padding-left: 18px; margin-top: 10px; }
    .payout-note li { font-size: 12px; color: var(--gray-600); margin-bottom: 6px; }

    .form-actions { display: flex; align-items: center; gap: 16px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--gray-100); }
    .save-success { color: var(--success); font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px; }

    .btn-primary {
      background: #FF7B54; color: white; border: none; padding: 12px 24px; border-radius: 12px;
      font-weight: 700; cursor: pointer; transition: all 0.3s;
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,123,84,0.3); }

    .btn-outline {
      background: white; border: 1.5px solid var(--gray-200); border-radius: 10px; padding: 8px 16px;
      font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s;
    }
    .btn-outline:hover { border-color: #FF7B54; color: #FF7B54; }

    .pwd-input-wrapper { position: relative; }
    .pwd-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--gray-400); cursor: pointer; }

    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class InstructorSettingsComponent implements OnInit {
  private api = inject(ApiService);
  public authService = inject(AuthService);

  currentTab: 'profile' | 'payout' | 'notifications' = 'profile';

  fullName = '';
  jobTitle = '';
  email = '';
  bio = '';
  avatarUrl = '';
  degreeUrl = '';

  isSaving = false;
  saveSuccess = false;
  isSavingNotif = false;
  showBank = false;
  isUploadingDegree = false;
  degreeSuccess = false;

  instructorNotifications = [
    { id: 'enrollment', label: 'Học viên mới đăng ký', desc: 'Nhận email khi có học viên mới mua khóa học của bạn.', enabled: true },
    { id: 'review', label: 'Đánh giá mới', desc: 'Nhận thông báo khi học viên để lại đánh giá hoặc bình luận trên khóa học.', enabled: true },
    { id: 'revenue', label: 'Báo cáo doanh thu', desc: 'Nhận email tóm tắt doanh thu hàng tuần và hàng tháng.', enabled: true },
    { id: 'approval', label: 'Trạng thái khóa học', desc: 'Nhận thông báo khi khóa học của bạn được duyệt hoặc bị từ chối.', enabled: true },
    { id: 'promotion', label: 'Khuyến mãi hệ thống', desc: 'Nhận thông tin về các chương trình đẩy mạnh bán hàng từ EduLearn.', enabled: false },
  ];

  ngOnInit() {
    this.loadProfile();
    this.loadNotifications();
  }

  loadNotifications() {
    this.api.getUserNotificationSettings().subscribe({
      next: (res: any) => {
        if (res && Array.isArray(res)) {
          this.instructorNotifications.forEach(n => {
            const found = res.find((item: any) => item.id === n.id);
            if (found) n.enabled = found.enabled;
          });
        }
      }
    });
  }

  loadProfile() {
    this.api.getUserProfile().subscribe({
      next: (res) => {
        if (res) {
          this.fullName = res.ten || '';
          this.email = res.email || '';
          this.bio = res.tieuSu || '';
          this.avatarUrl = res.linkAnhDaiDien || '';
          this.degreeUrl = res.hoSoBangCap || '';
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải profile', err);
        // Fallback to auth token claim just in case
        this.fullName = this.authService.currentUser()?.userName || '';
      }
    });
  }

  saveNotifications() {
    this.isSavingNotif = true;
    this.api.updateUserNotificationSettings(this.instructorNotifications).subscribe({
      next: () => {
        this.isSavingNotif = false;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Đã lưu cài đặt thông báo',
          showConfirmButton: false,
          timer: 2000
        });
      },
      error: () => this.isSavingNotif = false
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onDegreeSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploadingDegree = true;
      this.api.uploadDegree(file).subscribe({
        next: (res) => {
          this.isUploadingDegree = false;
          this.degreeSuccess = true;
          this.degreeUrl = res.linkHoSo;
          setTimeout(() => this.degreeSuccess = false, 4000);
        },
        error: (err) => {
          this.isUploadingDegree = false;
          alert(err.error?.message || 'Lỗi khi tải tài liệu.');
        }
      });
    }
  }

  saveProfile() {
    this.isSaving = true;
    this.saveSuccess = false;

    this.api.updateUserProfile({
      ten: this.fullName,
      tieuSu: this.bio,
      linkAnhDaiDien: this.avatarUrl
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.saveSuccess = true;

        // Update global auth state immediately
        const user = this.authService.currentUser();
        if (user) {
          this.authService.updateLocalUser({
            ...user,
            userName: this.fullName,
            avatar: this.avatarUrl
          });
        }
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: () => this.isSaving = false
    });
  }
}
