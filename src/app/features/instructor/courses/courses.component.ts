import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { InstructorLayoutComponent } from '../../../layouts/instructor-layout/instructor-layout.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, InstructorLayoutComponent],
  template: `
    <app-instructor-layout>
      <div class="header-action">
        <div>
          <h1><i class="fa-solid fa-book-open"></i> Khóa học của tôi</h1>
          <p class="subtitle">Quản lý và cập nhật nội dung các khóa học bạn đang giảng dạy.</p>
        </div>
        <a routerLink="/instructor/courses/create" class="btn btn-primary">
          <i class="fa-solid fa-plus"></i> Tạo khóa học mới
        </a>
      </div>

      <!-- Filters & Search -->
      <div class="filters card">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Tìm tên khóa học..." [(ngModel)]="searchTerm" (input)="filterCourses()">
        </div>
        <select class="form-select" [(ngModel)]="statusFilter" (change)="filterCourses()">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="Published">Đã xuất bản</option>
          <option value="Pending">Đang chờ duyệt</option>
          <option value="Draft">Bản nháp</option>
        </select>
        <select class="form-select">
          <option value="NEWEST">Mới nhất</option>
          <option value="POPULAR">Học viên nhiều nhất</option>
          <option value="RATING">Đánh giá cao nhất</option>
        </select>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" style="padding: 40px; text-align: center; color: var(--gray-400);">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 28px; margin-bottom: 8px; display: block;"></i>
        Đang tải danh sách khóa học...
      </div>

      <!-- Course Grid -->
      <div class="course-grid" *ngIf="!isLoading">
        <div class="course-card card" *ngFor="let course of filteredCourses">
          <div class="course-img" [style.background-image]="course.anhUrl ? 'url(' + getImageUrl(course.anhUrl) + ')' : ''" [class.no-img]="!course.anhUrl">
            <span class="status-badge" [ngClass]="getStatusClass(course.tinhTrang)">{{ getStatusLabel(course.tinhTrang) }}</span>
            <i class="fa-solid fa-image" *ngIf="!course.anhUrl" style="font-size: 24px; color: var(--gray-400);"></i>
          </div>
          <div class="course-body">
            <div class="course-meta">
              <span class="category">{{ course.theLoai || 'Chưa phân loại' }}</span>
              <span class="date">{{ course.ngayTao | date:'dd/MM/yyyy' }}</span>
            </div>
            <h3 class="course-title">{{ course.tieuDe }}</h3>
            
            <div class="course-stats">
              <div class="stat-item" title="Số lượng học viên">
                <i class="fa-solid fa-users"></i> {{ course.soHocVien | number }}
              </div>
              <div class="stat-item" title="Đánh giá trung bình">
                <i class="fa-solid fa-star" style="color: #fccc29;"></i> {{ course.tbdanhGia | number:'1.1-1' }} ({{ course.soLuongDanhGia }})
              </div>
              <div class="stat-item" title="Giá bán">
                <i class="fa-solid fa-tag"></i> {{ (course.giaGoc) ? formatCurrencyM(course.giaGoc) : 'Miễn phí' }}
              </div>
            </div>
            
            <div class="course-actions">
              <button class="btn btn-outline btn-sm action-btn" (click)="editCourse(course.maKhoaHoc || course.id)">
                <i class="fa-solid fa-pen"></i> Chỉnh sửa
              </button>
              <button class="btn btn-outline btn-sm action-btn" (click)="viewLessons(course.maKhoaHoc || course.id)">
                <i class="fa-solid fa-video"></i> Bài giảng
              </button>
              <button *ngIf="course.tinhTrang !== 'Published'" class="btn btn-icon btn-sm" title="Xóa khóa học" style="color: var(--danger); border-color: transparent;" (click)="deleteCourse(course)">
                <i class="fa-solid fa-trash" *ngIf="!course._deleting"></i>
                <i class="fa-solid fa-circle-notch fa-spin" *ngIf="course._deleting"></i>
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="filteredCourses.length === 0" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--gray-400); background: var(--white); border-radius: var(--radius-md);">
          <i class="fa-solid fa-box-open" style="font-size: 32px; margin-bottom: 10px;"></i>
          <p>Không tìm thấy khóa học nào phù hợp.</p>
        </div>
      </div>
    </app-instructor-layout>
  `,
  styles: [`
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitle { font-size: 14px; color: var(--gray-500); }
    .header-action { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
    
    .filters {
      display: flex;
      gap: 16px;
      padding: 16px;
      margin-bottom: 24px;
      align-items: center;
    }
    
    .search-box {
      position: relative;
      flex: 1;
    }
    .search-box i {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gray-400);
      font-size: 14px;
    }
    .search-box input {
      width: 100%;
      padding: 10px 14px 10px 36px;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-sm);
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
    }
    .search-box input:focus {
      border-color: #FF7B54;
      box-shadow: 0 0 0 3px rgba(255,123,84,0.1);
    }
    
    .form-select {
      padding: 10px 32px 10px 14px;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-sm);
      font-size: 14px;
      background: var(--white);
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      background-size: 14px;
      min-width: 180px;
    }
    
    .course-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .course-card {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .course-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.06);
    }
    
    .course-img {
      height: 160px;
      background-size: cover;
      background-position: center;
      position: relative;
    }
    .course-img.no-img {
      background: var(--gray-100);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .status-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      z-index: 10;
      backdrop-filter: blur(4px);
    }
    .badge-success { background: rgba(40,167,69,0.85); color: white; }
    .badge-warning { background: rgba(253,126,20,0.85); color: white; }
    .badge-danger { background: rgba(220,53,69,0.85); color: white; }
    
    .course-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    
    .course-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 11px;
    }
    .category {
      color: #FF7B54;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .date {
      color: var(--gray-400);
    }
    
    .course-title {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.4;
      margin-bottom: 16px;
      color: var(--gray-800);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }
    
    .course-stats {
      display: flex;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid var(--gray-100);
      margin-bottom: 16px;
    }
    .stat-item {
      font-size: 12px;
      font-weight: 600;
      color: var(--gray-600);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .stat-item i {
      color: var(--gray-400);
    }
    
    .course-actions {
      display: flex;
      gap: 8px;
    }
    .action-btn {
      flex: 1;
      font-size: 12px;
      padding: 8px;
    }
    .btn-icon {
      width: 34px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(220,53,69,0.05);
    }
    .btn-icon:hover {
      background: rgba(220,53,69,0.1);
    }
  `]
})
export class InstructorCoursesComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  isLoading = true;
  courses: any[] = [];
  filteredCourses: any[] = [];
  
  searchTerm = '';
  statusFilter = 'ALL';

  ngOnInit() {
    this.loadCourses();
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = environment.apiUrl.replace(/\/api$/, '');
    return `${baseUrl}${path}`;
  }

  loadCourses() {
    this.isLoading = true;
    this.api.getInstructorCourses().subscribe({
      next: (res) => {
        this.courses = res || [];
        this.filterCourses();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load courses', err);
        this.isLoading = false;
      }
    });
  }

  filterCourses() {
    let result = this.courses;

    if (this.statusFilter !== 'ALL') {
      result = result.filter(c => c.tinhTrang === this.statusFilter);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(c => 
        c.tieuDe?.toLowerCase().includes(term) || 
        c.theLoai?.toLowerCase().includes(term)
      );
    }

    this.filteredCourses = result;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Published': 'badge-success',
      'Draft': 'badge-warning',
      'Pending': 'badge-danger'
    };
    return map[status] || 'badge-warning';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'Published': 'Đã xuất bản',
      'Draft': 'Bản nháp',
      'Pending': 'Chờ duyệt'
    };
    return map[status] || status;
  }

  formatCurrencyM(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'k';
    }
    return value.toString();
  }

  editCourse(id: number) {
    if (!id) return;
    this.router.navigate(['/instructor/courses/edit', id]);
  }

  viewLessons(id: number) {
    if (!id) return;
    this.router.navigate(['/instructor/courses', id, 'lessons']);
  }

  deleteCourse(course: any) {
    const id = course.maKhoaHoc || course.id;
    if (!id) return;

    Swal.fire({
      title: 'Xóa khóa học?',
      text: `Bạn có chắc chắn muốn xóa khóa học "${course.tieuDe}" không? Thao tác này không thể hoàn tác.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6e7881',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        course._deleting = true;
        this.api.deleteCourse(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Đã xóa!',
              text: 'Khóa học của bạn đã được gỡ bỏ.',
              icon: 'success',
              confirmButtonColor: '#FF7B54'
            });
            this.courses = this.courses.filter(c => (c.maKhoaHoc || c.id) !== id);
            this.filterCourses();
          },
          error: (err) => {
            course._deleting = false;
            Swal.fire('Lỗi', err.error?.message || 'Không thể xóa khóa học lúc này.', 'error');
          }
        });
      }
    });
  }
}
