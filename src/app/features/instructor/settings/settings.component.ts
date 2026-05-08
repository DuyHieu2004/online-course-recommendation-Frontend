import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InstructorLayoutComponent } from '../../../layouts/instructor-layout/instructor-layout.component';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-instructor-settings',
  standalone: true,
  imports: [CommonModule, InstructorLayoutComponent, FormsModule],
  template: `
    <app-instructor-layout>
      <div class="header-action">
        <div>
          <h1><i class="fa-solid fa-gear"></i> Cài đặt báo cáo & Hệ thống</h1>
          <p class="subtitle">Quản lý hồ sơ giảng viên và tùy chọn thanh toán.</p>
        </div>
      </div>

      <div class="settings-grid">
        <!-- Profile Column -->
        <div class="section card">
          <h3 class="section-title"><i class="fa-solid fa-user-tie"></i> Hồ sơ Giảng viên</h3>
          
          <!-- Avatar Preview -->
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

        <!-- Document Upload Column for Instructor Approval -->
        <div class="section card mt-20" style="grid-column: 1 / -1;">
          <h3 class="section-title"><i class="fa-solid fa-file-contract"></i> Chứng thực Giảng viên (Hồ sơ / Bằng cấp)</h3>
          
          <div class="alert-warning" *ngIf="authService.currentUser()?.status === 'Chờ duyệt'" style="margin-bottom: 16px;">
            <strong>Tài khoản đang chờ duyệt!</strong> Bạn cần tải lên tài liệu xác minh chuyên môn (CV, Bằng cấp, Chứng chỉ) để Ban Quản Trị Hệ Thống phê duyệt trước khi có thể tạo và bán khóa học.
          </div>
          <div class="alert-success" *ngIf="authService.currentUser()?.status === 'Hoạt động'" style="margin-bottom: 16px; background: #D1FAE5; color: #059669; border: 1px solid #A7F3D0; padding: 16px; border-radius: var(--radius-sm);">
            <strong>Đã phê duyệt!</strong> Tài khoản Giảng viên của bạn đã được xác minh.
          </div>

          <div class="form-group">
            <label>Tài liệu đính kèm hiện tại</label>
            <div *ngIf="degreeUrl">
              <a [href]="degreeUrl" target="_blank" style="color: var(--primary); text-decoration: underline;">
                <i class="fa-solid fa-file-pdf"></i> Xem Hồ sơ đã tải lên
              </a>
            </div>
            <div *ngIf="!degreeUrl" style="color: var(--gray-400); font-style: italic;">
              Chưa có tài liệu nào được tải lên.
            </div>
          </div>

          <div class="form-group mt-20">
            <label class="btn btn-outline">
              <i class="fa-solid fa-upload"></i> {{ isUploadingDegree ? 'Đang tải lên...' : 'Chọn file và Tải lên (PDF, JPG, PNG)' }}
              <input type="file" hidden accept=".pdf,image/*" (change)="onDegreeSelected($event)" [disabled]="isUploadingDegree">
            </label>
            <span class="save-success" *ngIf="degreeSuccess" style="margin-left: 12px;"><i class="fa-solid fa-check"></i> Đã tải lên và Gửi duyệt thành công!</span>
          </div>
        </div>

        <!-- Payout Settings Column -->
        <div class="settings-sidebar">
          <div class="section card">
            <h3 class="section-title"><i class="fa-solid fa-credit-card"></i> Thông tin thanh toán</h3>
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
              <input type="password" class="form-control" value="0123456789" [type]="showBank ? 'text' : 'password'">
              <span class="pwd-toggle" (click)="showBank = !showBank"><i class="fa-solid" [ngClass]="showBank ? 'fa-eye-slash' : 'fa-eye'"></i></span>
            </div>
            
            <div class="form-group">
              <label>Tên chủ thẻ</label>
              <input type="text" class="form-control" [value]="fullName | uppercase" readonly style="background:var(--gray-50)">
            </div>
            
            <button class="btn btn-outline w-100">Cập nhật tài khoản ngân hàng</button>

            <div class="payout-note mt-20 alert-warning">
              <strong>Lưu ý:</strong> Mọi thay đổi về thông tin tài khoản ngân hàng sẽ bị giữ lại (hold) trong 14 ngày vì lý do bảo mật trước khi được áp dụng cho đợt đối soát tiếp theo.
            </div>
          </div>
        </div>
      </div>
    </app-instructor-layout>
  `,
  styles: [`
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitle { font-size: 14px; color: var(--gray-500); }
    .header-action { margin-bottom: 24px; }
    
    .settings-grid {
      display: grid;
      grid-template-columns: 2fr 1.2fr;
      gap: 24px;
    }
    
    .section { padding: 24px; }
    .section-title { font-size: 16px; font-weight: 700; color: var(--gray-800); margin-bottom: 24px; display: flex; align-items: center; gap: 8px;}
    .section-title i { color: #FF7B54;}
    
    .avatar-edit { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .avatar-preview {
      width: 80px; height: 80px; border-radius: 50%;
      background-size: cover; background-position: center; border: 2px solid var(--gray-200);
    }
    .avatar-preview.no-avt {
      background: var(--gray-100); display: flex; align-items: center; justify-content: center;
      font-size: 28px; color: var(--gray-300);
    }
    .avatar-actions { display: flex; gap: 8px; }
    
    .form-group { margin-bottom: 16px; position: relative; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-700); margin-bottom: 8px; }
    .form-control {
      width: 100%; padding: 10px 14px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm);
      font-size: 14px; outline: none; transition: all 0.2s ease;
      font-family: inherit;
    }
    .form-control:focus {
      border-color: #FF7B54; box-shadow: 0 0 0 3px rgba(255,123,84,0.1);
    }
    .form-select {
      width: 100%; padding: 10px 32px 10px 14px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm);
      font-size: 14px; background: var(--white); outline: none; cursor: pointer; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 10px center; background-size: 14px;
    }
    .mt-20 { margin-top: 20px; }
    .w-100 { width: 100%; }
    .pwd-toggle { position: absolute; right: 14px; top: 35px; color: var(--gray-400); cursor: pointer; }
    
    .text-sm { font-size: 13px; color: var(--gray-500); margin-bottom: 20px; line-height: 1.5; }
    
    .alert-warning {
      background: rgba(253,126,20,0.1); border: 1px solid rgba(253,126,20,0.2);
      border-radius: var(--radius-sm); padding: 16px; font-size: 12px; color: #D96A00; line-height: 1.5;
    }
    
    .form-actions { display: flex; align-items: center; gap: 16px; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--gray-100); }
    .save-success { color: var(--success); font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; }
  `]
})
export class InstructorSettingsComponent implements OnInit {
  private api = inject(ApiService);
  public authService = inject(AuthService); // changed to public

  fullName = '';
  jobTitle = '';
  bio = '';
  avatarUrl = '';
  degreeUrl = '';

  isSaving = false;
  saveSuccess = false;
  showBank = false;
  isUploadingDegree = false;
  degreeSuccess = false;

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    // Attempt to load profile from backend
    this.api.getUserProfile().subscribe({
      next: (res) => {
        if (res) {
          this.fullName = res.ten || '';
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

    // Call the existing profile update endpoint
    this.api.updateUserProfile({
      ten: this.fullName,
      tieuSu: this.bio,
      linkAnhDaiDien: this.avatarUrl // In real app, we need to upload the image first and get the URL
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
      error: () => {
        this.isSaving = false;
        // Handled silently for demo or add toast error
      }
    });
  }
}
