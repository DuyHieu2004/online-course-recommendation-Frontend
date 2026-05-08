import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../../../layouts/admin-layout/admin-layout.component';
import { DataService } from '../../../core/services/data.service';
import { ApiService } from '../../../core/services/api.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent, PaginationComponent],
  template: `
    <app-admin-layout>
      <h1><i class="fa-solid fa-clipboard-list"></i> Quản lý người dùng</h1>

      <!-- Filters -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 16px;">
        <div class="filter-row" style="margin-bottom: 0;">
          <input type="text" class="form-input" placeholder="Tìm kiếm người dùng..." style="flex:1" [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()">
          <div class="filter-select" (click)="filterByRole('')" [class.active]="filterRole === ''">Tất cả vai trò</div>
          <div class="filter-select" (click)="filterByRole('HocVien')" [class.active]="filterRole === 'HocVien'">Học viên</div>
          <div class="filter-select" (click)="filterByRole('GiaoVien')" [class.active]="filterRole === 'GiaoVien'">Giảng viên</div>
          <div class="filter-select" (click)="filterByRole('Admin')" [class.active]="filterRole === 'Admin'">Admin</div>
        </div>
        <button class="btn btn-primary" style="padding: 10px 16px; font-weight: 600;" (click)="showAddAdminModal = true">
          <i class="fa-solid fa-user-plus" style="margin-right: 6px;"></i> Thêm Admin
        </button>
      </div>



      <!-- User Stats -->
      <div class="user-stats">
        <div class="us-item"><span class="us-val primary">{{ dataService.adminStats().students }}</span><span>Học viên</span></div>
        <div class="us-item"><span class="us-val success">{{ dataService.adminStats().instructors }}</span><span>Giảng viên</span></div>
        <div class="us-item"><span class="us-val orange">{{ dataService.adminStats().admins }}</span><span>Admin</span></div>
      </div>

      <!-- Table -->
      <div class="table-wrapper card">
        <table>
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tham gia</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            @for (user of dataService.users(); track user.id) {
            <tr class="clickable-row" (click)="viewUser(user)">
              <td>
                <div class="user-cell">
                  <div class="avatar" [style.background]="user.color">
                    <img *ngIf="user.linkAnhDaiDien" [src]="user.linkAnhDaiDien" 
                         class="avatar-img" (error)="user.linkAnhDaiDien = ''" alt="Avatar">
                    <span *ngIf="!user.linkAnhDaiDien">{{ user.initials }}</span>
                  </div>
                  <div>
                    <strong>{{ user.name }}</strong>
                    <span class="user-email-sm">{{ user.email }}</span>
                  </div>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td (click)="$event.stopPropagation()">
                <span class="role-badge" [class]="user.role === 'admin' ? 'admin' : (user.role === 'instructor' ? 'instructor' : 'student')">
                  {{ user.role === 'admin' ? 'Admin' : (user.role === 'instructor' ? 'Giảng viên' : 'Học viên') }}
                </span>
              </td>
              <td>
                <span class="status-badge" [class.active]="user.originalStatus === 'Hoạt động'" [class.inactive]="user.originalStatus === 'Từ chối' || user.originalStatus === 'Bị khóa'" [class.pending]="user.originalStatus === 'Chờ duyệt'">
                  <span class="status-dot" [class.active]="user.originalStatus === 'Hoạt động'" [class.inactive]="user.originalStatus === 'Từ chối' || user.originalStatus === 'Bị khóa'" [class.pending]="user.originalStatus === 'Chờ duyệt'"></span>
                  {{ user.originalStatus }}
                </span>
                <div *ngIf="user.role === 'instructor' && user.hoSoBangCap" style="margin-top: 6px;">
                  <a [href]="user.hoSoBangCap" target="_blank" style="font-size: 11px; color: var(--primary); text-decoration: underline;"><i class="fa-solid fa-file-pdf"></i> Xem bằng cấp</a>
                </div>
              </td>
              <td>{{ user.joinDate }}</td>
              <td (click)="$event.stopPropagation()">
                <div style="display: flex; gap: 8px;">
                  <button *ngIf="user.originalStatus === 'Chờ duyệt' && user.role === 'instructor'"
                          class="action-btn unlock" 
                          (click)="updateSpecificStatus(user, 'Hoạt động')"
                          [disabled]="user._saving" title="Phê duyệt Giảng viên">
                    <i class="fa-solid fa-check"></i> Duyệt
                  </button>
                  <button *ngIf="user.originalStatus === 'Chờ duyệt' && user.role === 'instructor'"
                          class="action-btn lock" 
                          (click)="updateSpecificStatus(user, 'Từ chối')"
                          [disabled]="user._saving" title="Từ chối Giảng viên">
                    <i class="fa-solid fa-xmark"></i> Từ chối
                  </button>

                  <button *ngIf="user.originalStatus !== 'Chờ duyệt'"
                          class="action-btn" 
                          [class.lock]="user.originalStatus === 'Hoạt động'"
                          [class.unlock]="user.originalStatus === 'Bị khóa'"
                          (click)="updateSpecificStatus(user, user.originalStatus === 'Hoạt động' ? 'Bị khóa' : 'Hoạt động')"
                          [disabled]="user._saving"
                          [title]="user.originalStatus === 'Hoạt động' ? 'Khóa tài khoản' : 'Mở khóa'">
                    <i [class]="user._saving ? 'fa-solid fa-circle-notch fa-spin' : (user.originalStatus === 'Hoạt động' ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open')"></i>
                    {{ user.originalStatus === 'Hoạt động' ? 'Khóa' : 'Mở khóa' }}
                  </button>
                </div>
              </td>
            </tr>
            } @empty {
            <tr>
              <td colspan="6" style="text-align: center; padding: 40px; color: var(--gray-400);">
                <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                Ngưới dùng đang trống hoặc đang tải...
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <app-pagination 
        [currentPage]="dataService.currentUsersPage()"
        [totalItems]="dataService.usersTotal()"
        [pageSize]="10"
        (pageChange)="onPageChange($event)">
      </app-pagination>

      <!-- Toast -->
      <div class="toast" *ngIf="toastMessage" [class.error]="toastType === 'error'" (click)="toastMessage = ''">
        <i [class]="toastType === 'error' ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-circle-check'"></i>
        <span>{{ toastMessage }}</span>
      </div>

      <!-- Add Admin Modal -->
      <div class="modal-overlay" *ngIf="showAddAdminModal" (click)="showAddAdminModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3><i class="fa-solid fa-user-shield"></i> Thêm Quản trị viên</h3>
            <button class="close-btn" (click)="showAddAdminModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Họ và tên</label>
              <input type="text" class="form-input" [(ngModel)]="newAdmin.ten" placeholder="Nhập họ và tên quản trị viên">
            </div>
            <div class="form-group" style="margin-top: 16px;">
              <label>Email</label>
              <input type="email" class="form-input" [(ngModel)]="newAdmin.email" placeholder="admin@edulearn.vn">
            </div>
            <div class="form-group" style="margin-top: 16px;">
              <label>Mật khẩu</label>
              <div class="password-wrapper">
                <input [type]="showPassword ? 'text' : 'password'" class="form-input" [(ngModel)]="newAdmin.matKhau" placeholder="Mật khẩu (ít nhất 6 ký tự)">
                <button type="button" class="eye-btn" (click)="showPassword = !showPassword" tabindex="-1">
                  <i class="fa-solid" [class.fa-eye]="!showPassword" [class.fa-eye-slash]="showPassword"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer" style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
            <button class="btn action-btn lock" style="padding: 10px 16px;" (click)="showAddAdminModal = false">Hủy</button>
            <button class="btn action-btn unlock" style="padding: 10px 16px;" (click)="createAdmin()" [disabled]="isCreatingAdmin">
               <i *ngIf="isCreatingAdmin" class="fa-solid fa-spinner fa-spin"></i>
               {{ isCreatingAdmin ? 'Đang tạo...' : 'Xác nhận tạo' }}
            </button>
          </div>
        </div>
      </div>
      <!-- User Profile Modal -->
      <div class="modal-overlay" *ngIf="selectedUser" (click)="selectedUser = null">
        <div class="user-modal card" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="selectedUser = null" style="position: absolute; right: 20px; top: 20px;">×</button>
          
          <div class="user-modal-header">
            <div class="avatar-large" [style.background]="selectedUser.color">
              <img *ngIf="selectedUser.linkAnhDaiDien" [src]="selectedUser.linkAnhDaiDien" class="avatar-img" alt="Avatar">
              <span *ngIf="!selectedUser.linkAnhDaiDien">{{ selectedUser.initials }}</span>
            </div>
            <div class="user-modal-title">
              <h2>{{ selectedUser.name }}</h2>
              <span class="role-badge" [class]="selectedUser.role === 'admin' ? 'admin' : (selectedUser.role === 'instructor' ? 'instructor' : 'student')">
                {{ selectedUser.role === 'admin' ? 'Admin' : (selectedUser.role === 'instructor' ? 'Giảng viên' : 'Học viên') }}
              </span>
            </div>
          </div>
          
          <div class="user-modal-body">
            <div class="detail-group">
              <label>Email</label>
              <p>{{ selectedUser.email }}</p>
            </div>
            <div class="detail-group">
              <label>Trạng thái</label>
              <p>
                <span class="status-badge" [class.active]="selectedUser.originalStatus === 'Hoạt động'" [class.inactive]="selectedUser.originalStatus === 'Từ chối' || selectedUser.originalStatus === 'Bị khóa'" [class.pending]="selectedUser.originalStatus === 'Chờ duyệt'">
                  <span class="status-dot" [class.active]="selectedUser.originalStatus === 'Hoạt động'" [class.inactive]="selectedUser.originalStatus === 'Từ chối' || selectedUser.originalStatus === 'Bị khóa'" [class.pending]="selectedUser.originalStatus === 'Chờ duyệt'"></span>
                  {{ selectedUser.originalStatus }}
                </span>
              </p>
            </div>
            <div class="detail-group">
              <label>Ngày tham gia</label>
              <p>{{ selectedUser.joinDate }}</p>
            </div>
            <div class="detail-group" *ngIf="selectedUser.tieuSu">
              <label>Tiểu sử / Giới thiệu</label>
              <p style="white-space: pre-line; line-height: 1.5; color: var(--gray-700);">{{ selectedUser.tieuSu }}</p>
            </div>
            
            <div class="detail-group" *ngIf="selectedUser.role === 'instructor'">
              <label>Hồ sơ chứng nhận (CV)</label>
              
              <div *ngIf="selectedUser.hoSoBangCap; else noCV">
                <a [href]="selectedUser.hoSoBangCap" target="_blank" download="CV_GiangVien" class="btn-download-cv">
                  <i class="fa-solid fa-download"></i> Tải xuống bằng cấp / CV
                </a>
              </div>

              <ng-template #noCV>
                <p style="color: var(--gray-400); font-style: italic; margin-top: 4px; font-size: 14px;">
                  <i class="fa-solid fa-circle-exclamation" style="margin-right: 4px;"></i> Giảng viên này chưa cập nhật hồ sơ.
                </p>
              </ng-template>
            </div>
            
          </div>
        </div>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    h1 { font-size: 22px; margin-bottom: 16px; }
    .filter-row { display: flex; gap: 12px; margin-bottom: 16px; }
    .filter-select {
      padding: 10px 14px; border: 1px solid var(--gray-300);
      border-radius: var(--radius-sm); font-size: 13px; background: var(--white);
      cursor: pointer; white-space: nowrap; transition: all 0.2s ease;
    }
    .filter-select:hover { border-color: var(--primary); }
    .filter-select.active { background: var(--primary); color: white; border-color: var(--primary); }
    .user-stats { display: flex; gap: 16px; margin-bottom: 20px; }
    .us-item {
      padding: 14px 24px; border: 1px solid var(--gray-200);
      border-radius: var(--radius-sm); background: var(--white);
      display: flex; align-items: center; gap: 8px;
    }
    .us-val { font-size: 22px; font-weight: 800; }
    .us-val.primary { color: var(--primary); }
    .us-val.success { color: var(--success); }
    .us-val.orange { color: var(--orange); }
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: var(--white); font-weight: 700; font-size: 11px;
      overflow: hidden; flex-shrink: 0;
    }
    .avatar-img {
      width: 100%; height: 100%; object-fit: cover;
    }
    .user-email-sm { font-size: 11px; color: var(--gray-400); display: block; }
    .role-badge { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .role-badge.admin { background: rgba(253,126,20,0.1); color: var(--orange); border: 1px solid rgba(253,126,20,0.2); }
    .role-badge.instructor { background: rgba(40,167,69,0.1); color: var(--success); border: 1px solid rgba(40,167,69,0.2); }
    .role-badge.student { background: rgba(59,130,246,0.1); color: var(--primary); border: 1px solid rgba(59,130,246,0.2); }
    
    .status-badge { font-size: 13px; display: flex; align-items: center; gap: 6px; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; }
    .status-dot.active { background: #28A745; }
    .status-dot.inactive { background: #DC3545; }
    .status-dot.pending { background: #FFC107; }
    .status-badge.pending { color: #856404; }
    .action-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
      cursor: pointer; transition: all 0.2s ease; border: none;
    }
    .action-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .action-btn.lock { background: rgba(220,53,69,0.08); color: #DC3545; }
    .action-btn.lock:hover:not(:disabled) { background: #DC3545; color: white; }
    .action-btn.unlock { background: rgba(40,167,69,0.08); color: #28A745; }
    .action-btn.unlock:hover:not(:disabled) { background: #28A745; color: white; }

    .btn-download-cv {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 16px; margin-top: 6px;
      background-color: rgba(59, 130, 246, 0.1); 
      color: var(--primary);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 8px; font-size: 13px; font-weight: 600;
      text-decoration: none; transition: all 0.2s ease;
    }
    .btn-download-cv:hover {
      background-color: var(--primary);
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


    /* Password Eye Icon */
    .password-wrapper { position: relative; display: flex; align-items: center; }
    .password-wrapper .form-input { padding-right: 40px; width: 100%; }
    .eye-btn {
      position: absolute; right: 10px;
      background: none; border: none;
      color: var(--gray-500); cursor: pointer;
      font-size: 16px; padding: 4px;
      display: flex; align-items: center; justify-content: center;
    }
    .eye-btn:hover { color: var(--primary); }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; width: 440px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); animation: scaleUp 0.3s ease; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h3 { font-size: 18px; color: var(--gray-800); }
    .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--gray-500); }
    .close-btn:hover { color: red; }
    @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

    /* User details modal */
    .user-modal { position: relative; background: white; border-radius: 16px; width: 500px; max-width: 90vw; max-height: 90vh; overflow-y: auto; padding: 32px; animation: scaleUp 0.3s ease; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
    .user-modal-header { display: flex; align-items: center; gap: 20px; border-bottom: 1px solid var(--gray-200); padding-bottom: 24px; margin-bottom: 24px; }
    .avatar-large { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 28px; overflow: hidden; }
    .user-modal-title h2 { margin: 0 0 8px 0; font-size: 20px; color: var(--gray-800); }
    .user-modal-body { display: flex; flex-direction: column; gap: 16px; }
    .detail-group label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-500); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-group p { margin: 0; font-size: 15px; color: var(--gray-800); }
    
    .clickable-row { cursor: pointer; transition: background 0.2s ease; }
    .clickable-row:hover { background: var(--gray-50); }
  `]
})

export class AdminUsersComponent implements OnInit {
  dataService = inject(DataService);
  private api = inject(ApiService);

  filterRole = '';
  searchTerm = '';
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  showAddAdminModal = false;
  isCreatingAdmin = false;
  newAdmin: { ten: string, email: string, matKhau: string } = { ten: '', email: '', matKhau: '' };
  showPassword = false;
  selectedUser: any = null;

  ngOnInit() {
    this.dataService.loadUsers();
    this.dataService.loadAdminStats();
  }

  onSearchChange() {
    this.dataService.loadUsers(1, this.searchTerm, this.filterRole);
  }

  onPageChange(page: number) {
    this.dataService.loadUsers(page, this.searchTerm, this.filterRole);
  }

  filterByRole(role: string) {
    this.filterRole = role;
    this.dataService.loadUsers(1, this.searchTerm, this.filterRole);
  }

  viewUser(user: any) {
    this.selectedUser = user;
  }

  createAdmin() {
    if (!this.newAdmin.ten || !this.newAdmin.email || !this.newAdmin.matKhau) {
      this.showToast('Vui lòng nhập đầy đủ thông tin.', 'error');
      return;
    }
    
    this.isCreatingAdmin = true;
    this.api.createAdmin(this.newAdmin).subscribe({
      next: (res) => {
        this.showToast(res.message || 'Tạo Admin thành công!');
        this.isCreatingAdmin = false;
        this.showAddAdminModal = false;
        this.newAdmin = { ten: '', email: '', matKhau: '' };
        this.dataService.loadUsers(1, this.searchTerm, this.filterRole); // reload table
        this.dataService.loadAdminStats();
      },
      error: (err) => {
        const errorDetail = err.error?.message || `Lỗi ${err.status}: ${err.message}`;
        this.showToast(errorDetail, 'error');
        this.isCreatingAdmin = false;
      }
    });
  }

  updateSpecificStatus(user: any, newStatus: string) {
    user._saving = true;

    this.api.updateUserStatus(user.maNguoiDung || user.id, newStatus).subscribe({
      next: (res) => {
        this.showToast(res.message || `Đã cập nhật trạng thái`);
        user.originalStatus = newStatus;
        user.status = newStatus === 'Hoạt động' ? 'active' : 'inactive'; // for UI mapping
        user._saving = false;
      },
      error: (err) => {
        const errorDetail = err.error?.message || `Lỗi ${err.status}: ${err.message}`;
        this.showToast(errorDetail, 'error');
        user._saving = false;
      }
    });
  }

  private mapRoleName(vaiTro: string): string {
    const map: Record<string, string> = { 'HocVien': 'student', 'GiaoVien': 'instructor', 'Admin': 'admin' };
    return map[vaiTro] || 'student';
  }

  private showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => this.toastMessage = '', 4000);
  }
}
