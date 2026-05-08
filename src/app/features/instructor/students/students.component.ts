import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstructorLayoutComponent } from '../../../layouts/instructor-layout/instructor-layout.component';
import { ApiService } from '../../../core/services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-instructor-students',
  standalone: true,
  imports: [CommonModule, InstructorLayoutComponent, FormsModule],
  template: `
    <app-instructor-layout>
      <h1><i class="fa-solid fa-users"></i> Học viên của tôi</h1>
      <p class="subtitle" style="margin-bottom: 24px;">Quản lý tiến độ học tập và thông tin học viên thuộc các khóa học của bạn.</p>

      <!-- Search & Filters -->
      <div class="filters card">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Tìm kiếm theo Tên, Email..." [(ngModel)]="searchTerm" (input)="filterStudents()">
        </div>
        <select class="form-select" [(ngModel)]="courseFilter" (change)="filterStudents()">
          <option value="ALL">Tất cả khóa học</option>
          <option *ngFor="let course of uniqueCourses" [value]="course">{{ course }}</option>
        </select>
        <select class="form-select" [(ngModel)]="deadlineFilter" (change)="filterStudents()" style="min-width: 180px;">
          <option value="ALL">Tất cả thời hạn</option>
          <option value="OVERDUE">Đang trễ hạn</option>
          <option value="ONTIME">Trong hạn / Chưa có</option>
        </select>
        <button class="btn btn-outline" (click)="loadStudents()"><i class="fa-solid fa-rotate-right"></i> Làm mới</button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" style="padding: 40px; text-align: center; color: var(--gray-400);">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 28px; margin-bottom: 8px; display: block;"></i>
        Đang tải danh sách học viên...
      </div>

      <!-- Table -->
      <div class="table-wrapper card" *ngIf="!isLoading">
        <table>
          <thead>
            <tr>
              <th>Học viên</th>
              <th>Khóa học</th>
              <th>Ngày tham gia</th>
              <th>Ngày kết thúc</th>
              <th>Tiến độ</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredStudents">
              <td>
                <div class="student-cell">
                  <!-- Avatar -->
                  <div class="avatar" 
                       [style.background-image]="item.hocVien?.linkAnhDaiDien ? 'url(' + item.hocVien.linkAnhDaiDien + ')' : ''"
                       [ngStyle]="{'background-color': !item.hocVien?.linkAnhDaiDien ? getAvatarColor(item.hocVien?.ten) : ''}"
                       [class.no-avt]="!item.hocVien?.linkAnhDaiDien">
                    {{ !item.hocVien?.linkAnhDaiDien ? getInitials(item.hocVien?.ten) : '' }}
                  </div>
                  <!-- Name & Email -->
                  <div>
                    <strong>{{ item.hocVien?.ten || 'Người dùng ẩn' }}</strong>
                    <div style="font-size: 11px; color: var(--gray-500); margin-top: 2px;">{{ item.hocVien?.email }}</div>
                  </div>
                </div>
              </td>
              <td style="font-size: 13px; color: var(--gray-700); max-width: 250px;" class="truncate" [title]="item.khoaHoc?.tieuDe">
                {{ item.khoaHoc?.tieuDe }}
              </td>
              <td>{{ item.ngayThamGia | date:'dd/MM/yyyy' }}</td>
              <td>
                <span *ngIf="item.ngayKetThuc" [class.text-danger]="isExpired(item.ngayKetThuc)">
                  {{ item.ngayKetThuc | date:'dd/MM/yyyy' }}
                </span>
                <span *ngIf="!item.ngayKetThuc" class="text-muted">Không có</span>
              </td>
              <td>
                <div class="progress-cell">
                  <div class="progress-bar">
                    <div class="fill" [style.width.%]="item.phanTramTienDo" [class.complete]="item.phanTramTienDo === 100"></div>
                  </div>
                  <span [class.text-success]="item.phanTramTienDo === 100">{{ item.phanTramTienDo }}%</span>
                </div>
              </td>
              <td>
                <span class="badge" [ngClass]="item.phanTramTienDo === 100 ? 'badge-success' : 'badge-primary'">
                  {{ item.phanTramTienDo === 100 ? 'Đã hoàn thành' : 'Đang học' }}
                </span>
              </td>
              <td>
                <button class="btn btn-outline btn-sm action-btn" title="Gửi tin nhắn"><i class="fa-regular fa-envelope"></i> Nhắn tin</button>
              </td>
            </tr>
            <tr *ngIf="filteredStudents.length === 0">
              <td colspan="6" style="text-align: center; padding: 40px; color: var(--gray-400);">
                <i class="fa-solid fa-users-slash" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
                Không có học viên nào phù hợp với tìm kiếm của bạn.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Basic Pagination placeholders -->
      <div class="pagination-footer" *ngIf="!isLoading && totalCount > 0">
        <span class="text-sm">Hiển thị {{ filteredStudents.length }} trên tổng số {{ totalCount }} lượt đăng ký</span>
        <div class="page-controls">
          <button class="btn btn-outline btn-sm" [disabled]="page === 1" (click)="changePage(page - 1)">« Trước</button>
          <button class="btn btn-outline btn-sm default">Trang {{ page }}</button>
          <button class="btn btn-outline btn-sm" [disabled]="filteredStudents.length < pageSize" (click)="changePage(page + 1)">Sau »</button>
        </div>
      </div>
    </app-instructor-layout>
  `,
  styles: [`
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitle { font-size: 14px; color: var(--gray-500); }
    
    .filters {
      display: flex; gap: 16px; padding: 16px; margin-bottom: 24px; align-items: center;
    }
    
    .search-box {
      position: relative; flex: 1; max-width: 400px;
    }
    .search-box i {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--gray-400); font-size: 14px;
    }
    .search-box input {
      width: 100%; padding: 10px 14px 10px 36px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm);
      font-size: 14px; outline: none; transition: all 0.2s ease;
    }
    .search-box input:focus {
      border-color: #FF7B54; box-shadow: 0 0 0 3px rgba(255,123,84,0.1);
    }
    
    .form-select {
      padding: 10px 32px 10px 14px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm);
      font-size: 14px; background: var(--white); outline: none; cursor: pointer; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 10px center; background-size: 14px;
      min-width: 250px;
    }
    
    .table-wrapper { overflow-x: auto; margin-bottom: 16px; }
    
    .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    
    .student-cell { display: flex; align-items: center; gap: 12px; }
    .avatar {
      width: 38px; height: 38px; border-radius: 10px; background-size: cover; background-position: center;
    }
    .avatar.no-avt {
      display: flex; align-items: center; justify-content: center;
      color: var(--white); font-weight: 700; font-size: 13px;
    }
    
    .progress-cell { display: flex; align-items: center; gap: 8px; min-width: 120px; }
    .progress-cell .progress-bar { flex: 1; height: 6px; background: var(--gray-100); border-radius: 10px; overflow: hidden;}
    .fill { height: 100%; background: linear-gradient(90deg, #FFB26B, #FF7B54); border-radius: 10px; transition: width 0.3s ease; }
    .fill.complete { background: var(--success); }
    .progress-cell span { font-size: 12px; font-weight: 700; color: var(--gray-600); }
    .text-success { color: var(--success) !important; }
    
    .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge-primary { background: rgba(59,130,246,0.15); color: #3B82F6; }
    .badge-success { background: rgba(40,167,69,0.15); color: #28A745; }
    
    .action-btn { font-size: 12px; padding: 6px 10px; border-radius: 6px;}
    
    .pagination-footer { display: flex; justify-content: space-between; align-items: center; }
    .text-sm { font-size: 13px; color: var(--gray-500); }
    .text-danger { color: #dc3545; font-weight: bold; }
    .text-muted { color: var(--gray-400); font-style: italic; }
    .page-controls { display: flex; gap: 6px; }
    .page-controls button:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class InstructorStudentsComponent implements OnInit {
  private api = inject(ApiService);
  
  isLoading = true;
  allStudents: any[] = [];
  filteredStudents: any[] = [];
  
  // Pagination
  page = 1;
  pageSize = 50;
  totalCount = 0;
  
  // Filters
  searchTerm = '';
  courseFilter = 'ALL';
  deadlineFilter = 'ALL';
  uniqueCourses: string[] = [];

  // Consistent color mapping for avatars
  private colorMap = ['#FF7B54', '#5B63D3', '#28A745', '#E83E8C', '#17A2B8', '#6F42C1', '#FD7E14'];

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.isLoading = true;
    this.api.getInstructorStudents(this.page, this.pageSize).subscribe({
      next: (res) => {
        this.allStudents = res.data || [];
        this.totalCount = res.totalCount || 0;
        
        // Extract unique course titles for the filter dropdown
        const courses = this.allStudents
                            .map(item => item.khoaHoc?.tieuDe)
                            .filter(t => t); // remove nulls
        this.uniqueCourses = [...new Set(courses)] as string[];
        
        this.filterStudents();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách học viên', err);
        this.isLoading = false;
      }
    });
  }

  filterStudents() {
    let results = this.allStudents;

    if (this.courseFilter !== 'ALL') {
      results = results.filter(item => item.khoaHoc?.tieuDe === this.courseFilter);
    }

    if (this.deadlineFilter !== 'ALL') {
      if (this.deadlineFilter === 'OVERDUE') {
        // Trễ hạn: Có ngày kết thúc, tiến độ < 100, và ngày kết thúc < hiện tại
        results = results.filter(item => 
          item.phanTramTienDo < 100 && 
          item.ngayKetThuc && 
          this.isExpired(item.ngayKetThuc)
        );
      } else if (this.deadlineFilter === 'ONTIME') {
        // Trong hạn / Chưa có: Không trễ hạn
        results = results.filter(item => 
          item.phanTramTienDo === 100 || 
          !item.ngayKetThuc || 
          !this.isExpired(item.ngayKetThuc)
        );
      }
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      results = results.filter(item => 
        item.hocVien?.ten?.toLowerCase().includes(term) || 
        item.hocVien?.email?.toLowerCase().includes(term)
      );
    }

    this.filteredStudents = results;
  }
  
  changePage(newPage: number) {
    if (newPage < 1) return;
    this.page = newPage;
    this.loadStudents();
  }

  isExpired(dateString: string): boolean {
    if (!dateString) return false;
    return new Date(dateString).getTime() < new Date().getTime();
  }

  getInitials(name?: string): string {
    if (!name) return 'HV';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  
  getAvatarColor(name?: string): string {
    if (!name) return this.colorMap[0];
    let sum = 0;
    for(let i=0; i < name.length; i++){
      sum += name.charCodeAt(i);
    }
    return this.colorMap[sum % this.colorMap.length];
  }
}
