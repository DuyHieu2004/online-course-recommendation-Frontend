import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ChangePasswordComponent } from '../../../shared/components/change-password/change-password.component';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-student-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, ChangePasswordComponent],
  template: `
    <app-header />
    
    <div class="settings-container">
      <div class="header-action">
        <div>
          <h1><i class="fa-solid fa-user-gear"></i> Tài khoản của tôi</h1>
          <p class="subtitle">Quản lý hồ sơ, bảo mật và cài đặt thông báo của bạn.</p>
        </div>
      </div>

      <div class="settings-tabs-nav">
        <button class="tab-btn" [class.active]="currentTab === 'profile'" (click)="currentTab = 'profile'">
          <i class="fa-solid fa-user"></i> Hồ sơ
        </button>
        <button class="tab-btn" [class.active]="currentTab === 'security'" (click)="currentTab = 'security'">
          <i class="fa-solid fa-shield-halved"></i> Bảo mật
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
              <h3 class="section-title"><i class="fa-solid fa-user-graduate"></i> Hồ sơ Học viên</h3>
              
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
                <label>Họ và tên</label>
                <input type="text" class="form-control" [(ngModel)]="fullName" placeholder="Nhập tên thật">
              </div>
              
              <div class="form-group">
                <label>Danh hiệu / Nghề nghiệp</label>
                <input type="text" class="form-control" [(ngModel)]="jobTitle" placeholder="Vd: Sinh viên HUIT, Lập trình viên...">
              </div>

              <div class="form-group">
                <label>Tiểu sử / Tóm tắt chuyên môn</label>
                <textarea class="form-control" rows="4" [(ngModel)]="bio" placeholder="Chia sẻ đôi điều về bạn..."></textarea>
              </div>
              
              <div class="form-actions">
                <button class="btn btn-primary" [disabled]="isSaving" (click)="saveProfile()">
                  <i class="fa-solid fa-circle-notch fa-spin" *ngIf="isSaving"></i> 
                  <i class="fa-solid fa-save" *ngIf="!isSaving"></i> {{ isSaving ? 'Đang lưu...' : 'Lưu hồ sơ' }}
                </button>
                <span class="save-success" *ngIf="saveSuccess"><i class="fa-solid fa-check"></i> Đã lưu thành công!</span>
              </div>
            </div>

            <div class="section card info-card">
              <h3 class="section-title"><i class="fa-solid fa-circle-info"></i> Mẹo nhỏ</h3>
              <p class="text-sm">Hồ sơ đầy đủ giúp bạn nổi bật hơn trong cộng đồng học viên và được giảng viên chú ý hơn.</p>
              <ul class="tips-list">
                <li><i class="fa-solid fa-check"></i> Sử dụng ảnh thật rõ mặt</li>
                <li><i class="fa-solid fa-check"></i> Viết tiểu sử tóm tắt kỹ năng</li>
                <li><i class="fa-solid fa-check"></i> Cập nhật nghề nghiệp hiện tại</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Security Tab -->
        <div class="tab-content fade-in" *ngIf="currentTab === 'security'">
          <div class="settings-grid">
            <div class="section card">
              <h3 class="section-title"><i class="fa-solid fa-lock"></i> Đổi mật khẩu</h3>
              <app-change-password></app-change-password>
            </div>

            <div class="section card dangerous-zone">
              <h3 class="section-title"><i class="fa-solid fa-circle-exclamation"></i> Vùng nguy hiểm</h3>
              <p class="text-sm">Vô hiệu hóa tài khoản sẽ xóa hồ sơ của bạn khỏi hệ thống công cộng.</p>
              <button class="btn btn-outline-danger w-100" (click)="deactivateAccount()">Vô hiệu hóa tài khoản</button>
            </div>
          </div>
        </div>

        <!-- Notifications Tab -->
        <div class="tab-content fade-in" *ngIf="currentTab === 'notifications'">
          <div class="section card max-w-800">
            <h3 class="section-title"><i class="fa-solid fa-bell"></i> Cài đặt thông báo Email</h3>
            <p class="text-sm">Chọn các loại thông báo bạn muốn nhận qua email để không bỏ lỡ các thông tin quan trọng.</p>
            
            <div class="notification-list">
              <div *ngFor="let notif of userNotifications" class="notif-item">
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
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 1200px;
      margin: 40px auto;
      padding: 0 24px;
      animation: fadeIn 0.4s ease-out;
    }
    h1 { font-size: 24px; margin-bottom: 4px; font-weight: 800; color: var(--gray-800); }
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
    .tab-btn:hover { color: var(--primary); }
    .tab-btn.active { color: var(--primary); }
    .tab-btn.active::after {
      content: ''; position: absolute; bottom: -2px; left: 0; width: 100%;
      height: 3px; background: var(--primary); border-radius: 3px 3px 0 0;
    }
    
    .settings-grid {
      display: grid;
      grid-template-columns: 2fr 1.2fr;
      gap: 24px;
    }
    .max-w-800 { max-width: 800px; margin: 0 auto; }
    
    .section { padding: 32px; background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid var(--gray-100); }
    .section-title { font-size: 16px; font-weight: 700; color: var(--gray-800); margin-bottom: 24px; display: flex; align-items: center; gap: 8px;}
    .section-title i { color: var(--primary);}
    
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
      border-color: var(--primary); box-shadow: 0 0 0 4px rgba(91, 99, 211, 0.08);
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
    input:checked + .toggle-slider { background: var(--primary); }
    input:checked + .toggle-slider:before { transform: translateX(20px); }

    .dangerous-zone { border-top: 3px solid var(--danger); }
    .tips-list { list-style: none; padding: 0; margin: 0; }
    .tips-list li { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--gray-600); margin-bottom: 12px; }
    .tips-list li i { color: var(--success); font-size: 11px; }

    .btn-outline-danger {
      border: 1.5px solid var(--danger); color: var(--danger); background: transparent;
      padding: 10px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .btn-outline-danger:hover { background: var(--danger); color: white; }

    .form-actions { display: flex; align-items: center; gap: 16px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--gray-100); }
    .save-success { color: var(--success); font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px; }

    .btn-primary {
      background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 12px;
      font-weight: 700; cursor: pointer; transition: all 0.3s;
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(91,99,211,0.3); }

    .btn-outline {
      background: white; border: 1.5px solid var(--gray-200); border-radius: 10px; padding: 8px 16px;
      font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s;
    }
    .btn-outline:hover { border-color: var(--primary); color: var(--primary); }

    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StudentSettingsComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  currentTab: 'profile' | 'security' | 'notifications' = 'profile';

  fullName = '';
  jobTitle = '';
  email = '';
  bio = '';
  avatarUrl = '';

  isSaving = false;
  saveSuccess = false;
  isSavingNotif = false;

  userNotifications = [
    { id: 'purchase', label: 'Xác nhận mua khóa học', desc: 'Nhận email khi bạn thanh toán thành công khóa học mới.', enabled: true },
    { id: 'expiry', label: 'Nhắc nhở quá hạn', desc: 'Nhận thông báo khi khóa học của bạn sắp hết hạn hoặc đang trong thời gian trễ.', enabled: true },
    { id: 'update', label: 'Cập nhật nội dung', desc: 'Nhận thông báo khi giảng viên cập nhật bài học mới hoặc tài liệu học tập.', enabled: true },
    { id: 'promotion', label: 'Khuyến mãi & Ưu đãi', desc: 'Nhận thông tin về các chương trình giảm giá và khóa học miễn phí.', enabled: false },
  ];

  ngOnInit() {
    this.api.getUserProfile().subscribe({
      next: (res) => {
        if (res) {
          this.fullName = res.ten || '';
          this.email = res.email || '';
          this.bio = res.tieuSu || '';
          this.avatarUrl = res.linkAnhDaiDien || '';
        }
      },
      error: () => {
        this.fullName = this.auth.userName() || '';
      }
    });

    this.loadNotifications();
  }

  loadNotifications() {
    this.api.getUserNotificationSettings().subscribe({
      next: (res: any) => {
        if (res && Array.isArray(res)) {
          // Map backend settings to frontend list
          this.userNotifications.forEach(n => {
            const found = res.find((item: any) => item.id === n.id);
            if (found) n.enabled = found.enabled;
          });
        }
      }
    });
  }

  saveNotifications() {
    this.isSavingNotif = true;
    this.api.updateUserNotificationSettings(this.userNotifications).subscribe({
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
        const user = this.auth.currentUser();
        if (user) {
          this.auth.updateLocalUser({
            ...user,
            userName: this.fullName,
            avatar: this.avatarUrl
          });
        }
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: () => {
        this.isSaving = false;
      }
    });
  }

  deactivateAccount() {
    Swal.fire({
      title: 'Xóa tài khoản?',
      text: 'Thao tác này sẽ vô hiệu hóa tài khoản của bạn.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deactivateAccount().subscribe({
          next: () => {
            this.auth.logout();
            this.router.navigate(['/login']);
          }
        });
      }
    });
  }
}
