import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AdminLayoutComponent } from '../../../layouts/admin-layout/admin-layout.component';
import { ApiService } from '../../../core/services/api.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-admin-approvals',
  standalone: true,
  imports: [CommonModule, AdminLayoutComponent, PaginationComponent],
  template: `
    <app-admin-layout>
      <h1><i class="fa-solid fa-clipboard-list"></i> Duyệt nội dung khóa học</h1>
      <p class="subtitle">Xem xét và phê duyệt các khóa học từ giảng viên</p>

      <!-- Stats -->
      <div class="approval-stats">
        <div class="as-item card"><span class="as-val orange">{{ pendingCount }}</span><span>Chờ duyệt</span></div>
        <div class="as-item card"><span class="as-val primary">{{ publishedCount }}</span><span>Đã xuất bản</span></div>
        <div class="as-item card"><span class="as-val danger">{{ rejectedCount }}</span><span>Bị từ chối</span></div>
      </div>

      <!-- Tabs -->
      <div class="approval-tabs">
        <button class="tab" [class.active]="activeTab === 'all'" (click)="switchTab('all')">
          Tất cả <span class="tab-count">({{ totalCountAll }})</span>
        </button>
        <button class="tab" [class.active]="activeTab === 'published'" (click)="switchTab('published')">
          Đã duyệt <span class="tab-count">({{ publishedCount }})</span>
        </button>
        <button class="tab" [class.active]="activeTab === 'pending'" (click)="switchTab('pending')">
          Chờ duyệt <span class="tab-count">({{ pendingCount }})</span>
        </button>
        <button class="tab" [class.active]="activeTab === 'rejected'" (click)="switchTab('rejected')">
          Từ chối <span class="tab-count">({{ rejectedCount }})</span>
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" style="padding: 40px; text-align: center; color: var(--gray-400);">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 28px; margin-bottom: 8px; display: block;"></i>
        Đang tải dữ liệu từ API...
      </div>

      <!-- Empty -->
      <div *ngIf="!isLoading && courses.length === 0" style="padding: 60px; text-align: center; color: var(--gray-400);">
        <i class="fa-solid fa-inbox" style="font-size: 40px; margin-bottom: 12px; display: block;"></i>
        Không có khóa học nào.
      </div>
      
      <!-- Course Cards -->
      <div *ngFor="let course of courses" class="approval-card card">
        <div class="ac-thumb" [style.background-image]="course.image ? 'url(' + course.image + ')' : ''"
             [class.no-image]="!course.image">
          <i *ngIf="!course.image" class="fa-solid fa-box"></i>
          <span class="ac-status-badge" [ngClass]="getStatusClass(course.status)">
            {{ getStatusLabel(course.status) }}
          </span>
        </div>
        <div class="ac-content">
          <h3>{{ course.title }}</h3>
          <div class="ac-meta">
            <i class="fa-solid fa-chalkboard-user"></i> {{ course.instructor }} • 📂 {{ course.category }} • <i class="fa-solid fa-star" style="color: #fccc29;"></i> {{ course.rating || 0 }}
          </div>
          <p class="ac-desc">{{ course.description || 'Chưa có mô tả' }}</p>
          <div class="ac-details">
            <span class="detail-chip"><i class="fa-solid fa-coins"></i> {{ course.price | currency:'VND':'symbol':'1.0-0' }}</span>
            <span class="detail-chip"><i class="fa-solid fa-book"></i> {{ course.chapters }} chương</span>
          </div>
          
          <div class="ac-actions">
            <button class="btn btn-success btn-sm" 
                    *ngIf="course.status !== 'Published'"
                    (click)="updateStatus(course, 'Published')" 
                    [disabled]="course._saving">
              <i [class]="course._saving ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-check'"></i> Duyệt & Xuất bản
            </button>
            <button class="btn btn-danger btn-sm" 
                    *ngIf="course.status !== 'Rejected'"
                    (click)="updateStatus(course, 'Rejected')" 
                    [disabled]="course._saving">
              <i class="fa-solid fa-xmark"></i> Từ chối
            </button>
            <button class="btn btn-outline btn-sm" 
                    *ngIf="course.status !== 'Draft'"
                    (click)="updateStatus(course, 'Draft')" 
                    [disabled]="course._saving">
              <i class="fa-solid fa-file-pen"></i> Chuyển Draft
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <app-pagination 
        *ngIf="!isLoading && totalCourses > 0"
        [currentPage]="currentPage"
        [totalItems]="totalCourses"
        [pageSize]="10"
        (pageChange)="onPageChange($event)">
      </app-pagination>

      <!-- Toast -->
      <div class="toast" *ngIf="toastMessage" [class.error]="toastType === 'error'" (click)="toastMessage = ''">
        <i [class]="toastType === 'error' ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-circle-check'"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitle { font-size: 14px; color: var(--gray-500); margin-bottom: 20px; }
    .approval-stats { display: flex; gap: 16px; margin-bottom: 20px; }
    .as-item { padding: 16px 32px; display: flex; align-items: center; gap: 12px; }
    .as-val { font-size: 28px; font-weight: 800; }
    .as-val.orange { color: var(--orange); }
    .as-val.primary { color: var(--primary); }
    .as-val.danger { color: var(--danger); }

    .approval-tabs { display: flex; gap: 0; border-bottom: 2px solid var(--gray-200); margin-bottom: 20px; }
    .tab {
      padding: 10px 24px; background: none; font-size: 14px;
      font-weight: 600; color: var(--gray-400); cursor: pointer;
      border-bottom: 2px solid transparent; margin-bottom: -2px; border: none;
      transition: all 0.2s ease;
    }
    .tab:hover { color: var(--gray-600); }
    .tab.active { color: var(--primary); border-bottom: 2px solid var(--primary); }

    .approval-card { padding: 20px; display: flex; gap: 20px; margin-bottom: 16px; }
    .ac-thumb {
      width: 140px; height: 140px; flex-shrink: 0;
      border-radius: var(--radius-md); overflow: hidden;
      background-size: cover; background-position: center;
      position: relative;
    }
    .ac-thumb.no-image {
      background: var(--primary-bg);
      display: flex; align-items: center; justify-content: center;
      font-size: 48px; color: var(--primary);
    }
    .ac-status-badge {
      position: absolute; top: 8px; left: 8px;
      padding: 3px 10px; border-radius: 6px; font-size: 10px; font-weight: 700;
      text-transform: uppercase;
    }
    .ac-status-badge.published { background: rgba(40,167,69,0.9); color: white; }
    .ac-status-badge.draft { background: rgba(253,126,20,0.9); color: white; }
    .ac-status-badge.rejected { background: rgba(220,53,69,0.9); color: white; }
    .ac-status-badge.pending { background: rgba(91,99,211,0.9); color: white; }
    .tab-count { font-size: 11px; opacity: 0.7; margin-left: 4px; font-weight: 400; }
    .ac-content { flex: 1; }
    .ac-content h3 { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
    .ac-meta { font-size: 13px; color: var(--gray-500); margin-bottom: 8px; }
    .ac-desc { font-size: 14px; color: var(--gray-600); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .ac-details { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .detail-chip {
      padding: 6px 14px; background: var(--gray-100); border-radius: var(--radius-sm);
      font-size: 13px; color: var(--gray-600); display: flex; align-items: center; gap: 6px;
    }
    .ac-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-success { background: linear-gradient(135deg, #28A745, #34D058); color: white; }
    .btn-success:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(40,167,69,0.3); }
    .btn-danger { background: linear-gradient(135deg, #DC3545, #E4606D); color: white; }
    .btn-danger:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(220,53,69,0.3); }
    .btn-outline { background: var(--gray-100); color: var(--gray-600); border: 1px solid var(--gray-200); }
    .btn-outline:hover:not(:disabled) { background: var(--gray-200); }
    .btn-sm { padding: 7px 14px; font-size: 12px; }

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
export class AdminApprovalsComponent implements OnInit {
  private api = inject(ApiService);

  courses: any[] = [];
  totalCourses = 0; // Số lượng theo tab hiện tại
  totalCountAll = 0;
  publishedCount = 0;
  pendingCount = 0;
  rejectedCount = 0;
  
  isLoading = false;
  activeTab = 'all';
  currentPage = 1;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  ngOnInit() {
    this.loadCourses();
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadCourses();
  }

  loadCourses(page = 1) {
    this.isLoading = true;
    this.currentPage = page;
    const statusMap: Record<string, string> = {
      'all': '',
      'published': 'Published',
      'pending': 'Pending',
      'rejected': 'Rejected'
    };

    this.api.getAdminCourses({ 
      page: page, 
      pageSize: 10,
      status: statusMap[this.activeTab] || undefined
    }).subscribe({
      next: (res) => {
        const data = res.data || [];
        this.totalCourses = res.totalCount || data.length;
        this.courses = data.map((c: any) => ({
          id: c.maKhoaHoc,
          title: c.tieuDe,
          description: c.moTa,
          instructor: c.giangVien?.[0]?.ten || 'Admin',
          category: c.theLoai?.ten || 'Chưa phân loại',
          rating: c.tbdanhGia || 0,
          price: c.giaGoc || 0,
          image: c.anhUrl || '',
          chapters: c.soLuongChuong || 0,
          students: c.soHocVien || 0,
          status: c.tinhTrang || 'Published',
          _saving: false
        }));
        this.isLoading = false;
        
        // Luôn load lại tất cả các count để sync giao diện
        this.loadAllCounts();
      },
      error: (err) => {
        this.showToast('Không thể tải dữ liệu từ server. Vui lòng thử lại sau.', 'error');
        this.isLoading = false;
      }
    });
  }

  loadAllCounts() {
    // Gọi song song để lấy count cho các tab
    this.api.getAdminCourses({ page: 1, pageSize: 1 }).subscribe(r => this.totalCountAll = r.totalCount || 0);
    this.api.getAdminCourses({ page: 1, pageSize: 1, status: 'Published' }).subscribe(r => this.publishedCount = r.totalCount || 0);
    this.api.getAdminCourses({ page: 1, pageSize: 1, status: 'Pending' }).subscribe(r => this.pendingCount = r.totalCount || 0);
    this.api.getAdminCourses({ page: 1, pageSize: 1, status: 'Rejected' }).subscribe(r => this.rejectedCount = r.totalCount || 0);
  }


  onPageChange(page: number) {
    this.loadCourses(page);
  }

  updateStatus(course: any, newStatus: string) {
    course._saving = true;
    this.api.updateCourseStatus(course.id, newStatus).subscribe({
      next: (res) => {
        this.showToast(res.message || `Đã cập nhật trạng thái thành ${newStatus}`);
        course.status = newStatus;
        course._saving = false;
        // Reload to refresh counts
        if (this.activeTab !== 'all') {
          this.courses = this.courses.filter(c => c.id !== course.id);
        }
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Lỗi khi cập nhật', 'error');
        course._saving = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Published': 'published', 'Draft': 'draft', 'Rejected': 'rejected', 'Pending': 'pending'
    };
    return map[status] || 'draft';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'Published': 'Đã duyệt', 'Draft': 'Nháp', 'Rejected': 'Từ chối', 'Pending': 'Chờ duyệt'
    };
    return map[status] || status;
  }

  private showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => this.toastMessage = '', 4000);
  }
}
