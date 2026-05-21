import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../../../layouts/admin-layout/admin-layout.component';
import { ApiService } from '../../../core/services/api.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent, PaginationComponent],
  template: `
    <app-admin-layout>
      <div class="promo-header">
        <h1><i class="fa-solid fa-tags"></i> Quản lý khuyến mãi</h1>
        <button class="btn btn-primary" (click)="openAddModal()">
          <i class="fa-solid fa-plus"></i> Tạo khuyến mãi mới
        </button>
      </div>

      <!-- Stats -->
      <div class="promo-stats">
        <div class="ps-item card">
          <span class="ps-val primary">{{ activeCount }}</span>
          <span class="ps-lbl">Đang hoạt động</span>
        </div>
        <div class="ps-item card">
          <span class="ps-val success">{{ promotions.length }}</span>
          <span class="ps-lbl">Tổng khuyến mãi</span>
        </div>
        <div class="ps-item card">
          <span class="ps-val orange">{{ expiredCount }}</span>
          <span class="ps-lbl">Đã hết hạn</span>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" style="padding: 60px; text-align: center; color: var(--gray-400);">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 28px; margin-bottom: 8px; display: block;"></i>
        Đang tải dữ liệu từ API...
      </div>

      <!-- Table -->
      <div class="table-wrapper card" *ngIf="!isLoading">
        <table>
          <thead>
            <tr>
              <th>Tên chương trình</th>
              <th>Giảm giá</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Số khóa học</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let promo of promotions">
              <td><strong class="promo-code">{{ promo.tenChuongTrinh }}</strong></td>
              <td>
                <span class="promo-value success">{{ promo.phanTramGiam }}%</span>
              </td>
              <td>{{ promo.ngayBatDau ? (promo.ngayBatDau | date:'dd/MM/yyyy') : '—' }}</td>
              <td>
                <span [class.expired-date]="promo.tinhTrang === 'expired'">
                  {{ promo.ngayKetThuc ? (promo.ngayKetThuc | date:'dd/MM/yyyy') : 'Không giới hạn' }}
                </span>
              </td>
              <td>{{ promo.soKhoaHoc || 0 }}</td>
              <td>
                <span class="status-badge" [class.active]="promo.tinhTrang === 'active'" [class.expired]="promo.tinhTrang === 'expired'">
                  <span class="status-dot" [class.active]="promo.tinhTrang === 'active'" [class.inactive]="promo.tinhTrang === 'expired'"></span>
                  {{ promo.tinhTrang === 'active' ? 'Đang hoạt động' : 'Hết hạn' }}
                </span>
              </td>
              <td>
                <button class="btn btn-outline btn-sm" style="color: var(--primary); border-color: var(--primary);" (click)="openApplyModal(promo)">
                  <i class="fa-solid fa-link"></i> Áp dụng
                </button>
                <button class="btn btn-outline btn-sm" (click)="openEditModal(promo)">
                  <i class="fa-solid fa-pen-to-square"></i> Sửa
                </button>
                <button class="icon-action delete" (click)="confirmDelete(promo)" title="Xóa">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="promotions.length === 0">
              <td colspan="7" style="text-align: center; padding: 40px; color: var(--gray-400);">
                Chưa có khuyến mãi nào. Nhấn "Tạo khuyến mãi mới" để bắt đầu.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <app-pagination 
        *ngIf="!isLoading"
        [currentPage]="currentPromotionsPage"
        [totalItems]="totalPromotions"
        [pageSize]="10"
        (pageChange)="onPageChange($event)">
      </app-pagination>

      <!-- Add/Edit Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <i [class]="editingId ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-plus-circle'"></i>
              {{ editingId ? 'Chỉnh sửa khuyến mãi' : 'Tạo khuyến mãi mới' }}
            </h2>
            <button class="modal-close" (click)="showModal = false">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Tên chương trình</label>
              <input type="text" class="form-input" placeholder="Ví dụ: Ưu đãi hội nghiệp..." [(ngModel)]="formName">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Phần trăm giảm (%)</label>
                <input type="number" class="form-input" placeholder="20" [(ngModel)]="formDiscount" min="1" max="100">
              </div>
              <div class="form-group">
                <label>Ngày bắt đầu</label>
                <input type="date" class="form-input" [(ngModel)]="formStartDate">
              </div>
            </div>
            <div class="form-group">
              <label>Ngày kết thúc</label>
              <input type="date" class="form-input" [(ngModel)]="formEndDate">
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn cancel" (click)="showModal = false">Hủy bỏ</button>
            <button class="modal-btn save" (click)="savePromotion()" [disabled]="isSaving">
              <i [class]="isSaving ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-check'"></i>
              {{ isSaving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo mới') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirm Modal -->
      <div class="modal-overlay" *ngIf="showDeleteModal" (click)="showDeleteModal = false">
        <div class="modal-card delete-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2><i class="fa-solid fa-triangle-exclamation" style="color: #DC3545;"></i> Xác nhận xóa</h2>
            <button class="modal-close" (click)="showDeleteModal = false"><i class="fa-solid fa-times"></i></button>
          </div>
          <div class="modal-body" style="text-align: center; padding: 32px;">
            <p style="font-size: 16px; margin-bottom: 8px;">
              Bạn có chắc muốn xóa <strong>"{{ deletingPromo?.tenChuongTrinh }}"</strong>?
            </p>
            <p style="color: var(--gray-400); font-size: 13px;">Hành động này không thể hoàn tác.</p>
          </div>
          <div class="modal-footer">
            <button class="modal-btn cancel" (click)="showDeleteModal = false">Hủy</button>
            <button class="modal-btn delete-btn" (click)="deletePromotion()" [disabled]="isSaving">
              <i [class]="isSaving ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-trash'"></i>
              {{ isSaving ? 'Đang xóa...' : 'Xóa' }}
            </button>
          </div>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="showApplyModal" (click)="closeApplyModal()">
        <div class="modal-card" style="width: 650px;" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2><i class="fa-solid fa-tags"></i> Áp dụng: {{ applyingPromo?.tenChuongTrinh }}</h2>
            <button class="modal-close" (click)="closeApplyModal()"><i class="fa-solid fa-times"></i></button>
          </div>
          
          <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
            <div class="form-group">
              <label>Phương thức áp dụng</label>
              <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <label style="font-weight: normal; cursor: pointer;">
                  <input type="radio" name="applyMode" value="category" [(ngModel)]="applyMode"> Theo Thể Loại
                </label>
                <label style="font-weight: normal; cursor: pointer;">
                  <input type="radio" name="applyMode" value="course" [(ngModel)]="applyMode"> Khóa học chỉ định
                </label>
              </div>
            </div>

            <div *ngIf="applyMode === 'category'" class="selection-list">
              <div *ngFor="let cat of availableCategories" class="checkbox-item">
                <label>
                  <input type="checkbox" 
                        [checked]="selectedCategoryIds.includes(cat.maTheLoai)"
                        (change)="toggleSelection(cat.maTheLoai, 'category')"> 
                  {{ cat.ten }}
                </label>
              </div>
            </div>

            <div *ngIf="applyMode === 'course'" class="selection-list">
              <input type="text" class="form-input" placeholder="Tìm khóa học..." [(ngModel)]="courseSearch" style="margin-bottom: 15px;">
              <div *ngFor="let course of filteredCourses" class="checkbox-item">
                <label>
                  <input type="checkbox" 
                        [checked]="selectedCourseIds.includes(course.maKhoaHoc)"
                        (change)="toggleSelection(course.maKhoaHoc, 'course')"> 
                  [{{ course.theLoai?.ten || 'Chưa phân loại' }}] {{ course.tieuDe }} 
                  <span style="color: var(--gray-400); font-size: 12px;">(Giá: {{ course.giaGoc | number }}đ)</span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="modal-btn cancel" (click)="closeApplyModal()">Hủy bỏ</button>
            <button class="modal-btn save" (click)="submitApplyPromotion()" [disabled]="isSaving">
              <i [class]="isSaving ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-check'"></i>
              {{ isSaving ? 'Đang lưu...' : 'Xác nhận áp dụng' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div class="toast" *ngIf="toastMessage" [class.error]="toastType === 'error'" (click)="toastMessage = ''">
        <i [class]="toastType === 'error' ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-circle-check'"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .promo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    h1 { font-size: 22px; display: flex; align-items: center; gap: 10px; }
    .promo-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
    .ps-item { padding: 20px; }
    .ps-val { font-size: 28px; font-weight: 800; display: block; }
    .ps-val.primary { color: var(--primary); }
    .ps-val.success { color: var(--success); }
    .ps-val.orange { color: var(--orange); }
    .ps-lbl { font-size: 13px; color: var(--gray-500); }
    .promo-code {
      font-size: 14px;
      background: var(--gray-100);
      padding: 4px 10px;
      border-radius: 4px;
    }
    .promo-value { font-weight: 800; }
    .promo-value.success { color: var(--success); }
    .status-badge { font-size: 13px; display: flex; align-items: center; gap: 6px; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; }
    .status-dot.active { background: #28A745; }
    .status-dot.inactive { background: #DC3545; }
    .expired-date { color: var(--danger); }
    .icon-action { background: none; font-size: 14px; padding: 6px 8px; cursor: pointer; border: none; border-radius: 6px; transition: all 0.2s; margin-left: 6px; }
    .icon-action.delete { color: var(--danger); }
    .icon-action.delete:hover { background: rgba(220,53,69,0.08); }
    .btn { padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary { background: linear-gradient(135deg, #5B63D3, #7B82E0); color: white; }
    .btn-primary:hover { box-shadow: 0 4px 15px rgba(91,99,211,0.3); }
    .btn-outline { background: var(--gray-50); color: var(--gray-600); border: 1px solid var(--gray-200); padding: 7px 14px; font-size: 12px; }
    .btn-sm { padding: 7px 14px; font-size: 12px; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(5px); z-index: 999; display: flex; align-items: center; justify-content: center; }
    .modal-card { background: white; border-radius: 24px; width: 560px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); overflow: hidden; }
    .delete-modal { width: 440px; }
    .modal-header { padding: 24px; border-bottom: 1px solid var(--gray-50); display: flex; justify-content: space-between; align-items: center; }
    .modal-header h2 { font-size: 18px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
    .modal-close { background: var(--gray-50); border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; }
    .modal-body { padding: 28px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-weight: 600; font-size: 14px; margin-bottom: 8px; color: var(--gray-700); }
    .form-input { width: 100%; padding: 12px 14px; border: 2px solid var(--gray-100); border-radius: 10px; outline: none; transition: 0.3s; font-family: inherit; font-size: 14px; }
    .form-input:focus { border-color: var(--primary); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .modal-footer { padding: 18px 28px; background: var(--gray-50); display: flex; justify-content: flex-end; gap: 12px; }
    .modal-btn { padding: 11px 22px; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
    .modal-btn.cancel { background: white; color: var(--gray-500); }
    .modal-btn.save { background: var(--primary); color: white; }
    .modal-btn.save:disabled { opacity: 0.6; }
    .modal-btn.delete-btn { background: #DC3545; color: white; }
    .modal-btn.delete-btn:disabled { opacity: 0.6; }

    .selection-list { border: 1px solid var(--gray-200); border-radius: 8px; padding: 15px; max-height: 300px; overflow-y: auto; background: var(--gray-50); }
    .checkbox-item { margin-bottom: 10px; }
    .checkbox-item label { display: flex; align-items: center; gap: 10px; font-weight: normal; cursor: pointer; color: var(--gray-700); }
    .checkbox-item input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }

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
  `]
})
export class AdminPromotionsComponent implements OnInit {
  private api = inject(ApiService);

  promotions: any[] = [];
  totalPromotions = 0;
  currentPromotionsPage = 1;
  isLoading = false;
  isSaving = false;
  showModal = false;
  showDeleteModal = false;
  editingId: number | null = null;
  deletingPromo: any = null;

  // Form
  formName = '';
  formDiscount: number | null = null;
  formStartDate = '';
  formEndDate = '';

  showApplyModal = false;
  applyingPromo: any = null;
  applyMode: 'category' | 'course' = 'category';
  
  availableCategories: any[] = [];
  availableCourses: any[] = [];
  
  selectedCategoryIds: number[] = [];
  selectedCourseIds: number[] = [];
  courseSearch = '';

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  get activeCount() { return this.promotions.filter(p => p.tinhTrang === 'active').length; }
  get expiredCount() { return this.promotions.filter(p => p.tinhTrang === 'expired').length; }
  get filteredCourses() {
    if (!this.courseSearch.trim()) return this.availableCourses;
    const lower = this.courseSearch.toLowerCase();
    return this.availableCourses.filter(c => c.tieuDe.toLowerCase().includes(lower));
  }

  ngOnInit() {
    this.loadPromotions();
  }

  loadPromotions(page = 1) {
    this.isLoading = true;
    this.api.getPromotions(page, 10).subscribe({
      next: (res) => {
        const raw = Array.isArray(res) ? res : (res.data || []);
        this.promotions = raw;
        this.totalPromotions = res.totalCount || raw.length;
        this.currentPromotionsPage = res.page || page;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Không thể tải dữ liệu khuyến mãi', 'error');
      }
    });
  }

  onPageChange(page: number) {
    this.loadPromotions(page);
  }

  openAddModal() {
    this.editingId = null;
    this.formName = '';
    this.formDiscount = null;
    this.formStartDate = '';
    this.formEndDate = '';
    this.showModal = true;
  }

  openEditModal(promo: any) {
    this.editingId = promo.maKhuyenMai;
    this.formName = promo.tenChuongTrinh || '';
    this.formDiscount = promo.phanTramGiam;
    this.formStartDate = promo.ngayBatDau ? new Date(promo.ngayBatDau).toISOString().split('T')[0] : '';
    this.formEndDate = promo.ngayKetThuc ? new Date(promo.ngayKetThuc).toISOString().split('T')[0] : '';
    this.showModal = true;
  }

  savePromotion() {
    if (!this.formName.trim()) {
      this.showToast('Vui lòng nhập tên chương trình', 'error');
      return;
    }

    this.isSaving = true;
    const data: any = {
      tenChuongTrinh: this.formName.trim(),
      phanTramGiam: this.formDiscount || 0,
      ngayBatDau: this.formStartDate || undefined,
      ngayKetThuc: this.formEndDate || undefined
    };

    if (this.editingId) {
      this.api.updatePromotion(this.editingId, data).subscribe({
        next: (res) => {
          this.showToast(res.message || 'Cập nhật thành công!');
          this.showModal = false;
          this.isSaving = false;
          this.loadPromotions();
        },
        error: (err) => {
          this.showToast(err.error?.message || 'Lỗi khi cập nhật', 'error');
          this.isSaving = false;
        }
      });
    } else {
      this.api.createPromotion(data).subscribe({
        next: (res) => {
          this.showToast(res.message || 'Tạo khuyến mãi thành công!');
          this.showModal = false;
          this.isSaving = false;
          this.loadPromotions();
        },
        error: (err) => {
          this.showToast(err.error?.message || 'Lỗi khi tạo khuyến mãi', 'error');
          this.isSaving = false;
        }
      });
    }
  }

  confirmDelete(promo: any) {
    this.deletingPromo = promo;
    this.showDeleteModal = true;
  }

  deletePromotion() {
    if (!this.deletingPromo) return;
    this.isSaving = true;

    this.api.deletePromotion(this.deletingPromo.maKhuyenMai).subscribe({
      next: (res) => {
        this.showToast(res.message || 'Đã xóa khuyến mãi!');
        this.showDeleteModal = false;
        this.isSaving = false;
        this.deletingPromo = null;
        this.loadPromotions();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Lỗi khi xóa', 'error');
        this.isSaving = false;
      }
    });
  }

  openApplyModal(promo: any) {
    this.applyingPromo = promo;
    this.selectedCategoryIds = [];
    this.selectedCourseIds = [];
    this.applyMode = 'category';
    this.courseSearch = '';
    
    // Fetch data cần thiết để cho phép admin chọn
    this.fetchDataForApply();
    this.showApplyModal = true;
  }

  closeApplyModal() {
    this.showApplyModal = false;
    this.applyingPromo = null;
  }

  fetchDataForApply() {
    // Lấy tất cả danh mục (có thể dùng getCategories page 1 pageSize lớn)
    this.api.getCategories(1, 100).subscribe(res => {
      this.availableCategories = Array.isArray(res) ? res : (res.data || []);
    });

    // Lấy tất cả khóa học để map
    this.api.getAdminCourses({ page: 1, pageSize: 500 }).subscribe(res => {
      this.availableCourses = res.data || [];
      
      // Auto tick những khóa học đang được áp khuyến mãi này
      const currentPromoId = this.applyingPromo?.maKhuyenMai;
      // Lưu ý: Cần update API backend GetAdminCourses để trả về MaKhuyenMai hoặc check logic. 
      // Tạm thời nếu mảng trả về có KhuyenMai, ta map ra.
      this.selectedCourseIds = this.availableCourses
        .filter(c => c.KhuyenMai?.maKhuyenMai === currentPromoId)
        .map(c => c.maKhoaHoc);
    });
  }

  toggleSelection(id: number, type: 'category' | 'course') {
    const list = type === 'category' ? this.selectedCategoryIds : this.selectedCourseIds;
    const index = list.indexOf(id);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(id);
    }
  }

  submitApplyPromotion() {
    if (!this.applyingPromo) return;
    this.isSaving = true;

    const payload = {
      courseIds: this.applyMode === 'course' ? this.selectedCourseIds : [],
      categoryIds: this.applyMode === 'category' ? this.selectedCategoryIds : []
    };

    this.api.applyPromotion(this.applyingPromo.maKhuyenMai, payload).subscribe({
      next: (res) => {
        this.showToast(res.message || 'Áp dụng khuyến mãi thành công!');
        this.isSaving = false;
        this.closeApplyModal();
        this.loadPromotions(); // Load lại để update "Số khóa học" trên UI
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Lỗi khi áp dụng', 'error');
        this.isSaving = false;
      }
    });
  }

  private showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => this.toastMessage = '', 4000);
  }
}
