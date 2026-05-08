import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InstructorLayoutComponent } from '../../../layouts/instructor-layout/instructor-layout.component';
import { ApiService } from '../../../core/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, FormsModule, InstructorLayoutComponent],
  template: `
    <app-instructor-layout>
      <h1>
        <i class="fa-solid" [class.fa-plus-circle]="!editId" [class.fa-pen-to-square]="editId"></i> 
        {{ editId ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới' }}
      </h1>

      <div *ngIf="isInitialLoading" style="padding: 100px; text-align: center; color: var(--gray-400);">
        <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 32px; margin-bottom: 12px; display: block;"></i>
        Đang tải thông tin khóa học...
      </div>

      <!-- Stepper -->
      <div class="stepper" *ngIf="!isInitialLoading">
        <div class="step active"><span class="sn">1</span> Thông tin cơ bản</div>
        <div class="step-line"></div>
        <div class="step"><span class="sn">2</span> Nội dung</div>
        <div class="step-line"></div>
        <div class="step"><span class="sn">3</span> Giá & Xuất bản</div>
      </div>

      <div class="create-body" *ngIf="!isInitialLoading">
        <!-- Form -->
        <div class="create-main">
          <div class="form-card card">
            <h3>Thông tin cơ bản</h3>
            <div class="form-group">
              <label>Tiêu đề khóa học *</label>
              <input type="text" class="form-control" [(ngModel)]="title" placeholder="Ví dụ: Python cho người mới bắt đầu">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Ngôn ngữ *</label>
                <select class="form-select" [(ngModel)]="selectedLang">
                  <option *ngFor="let lang of languages" [value]="lang">{{ lang }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Cấp độ *</label>
                <select class="form-select" [(ngModel)]="selectedLevel">
                  <option *ngFor="let lvl of levels" [value]="lvl">{{ lvl }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Danh mục *</label>
                <select class="form-select" [(ngModel)]="selectedCategory">
                  <option *ngFor="let cat of categories" [value]="cat.maTheLoai || cat.MaTheLoai">{{ cat.ten || cat.Ten }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Thời hạn khóa học (Tháng) *</label>
                <input type="number" class="form-control" [(ngModel)]="thoiGianHocDuKien" placeholder="Ví dụ: 6">
              </div>
            </div>
            <div class="form-group">
              <label>Mô tả</label>
              <textarea class="form-control" rows="4" [(ngModel)]="description" placeholder="Mô tả những gì học viên sẽ học được..."></textarea>
            </div>
          </div>

          <div class="form-card card">
            <h3>📁 Media</h3>
            <div class="media-grid" style="grid-template-columns: 1fr;">
              <div class="upload-box">
                <span class="upload-icon">🖼️</span>
                <strong>Ảnh bìa</strong>
                <span class="upload-meta">JPG, PNG</span>
                <input type="file" #coverInput style="display:none" accept="image/*" (change)="onCoverChange($event)">
                <button class="btn btn-primary btn-sm" (click)="coverInput.click()" [disabled]="!editId">↑ Tải lên</button>
                <div *ngIf="!editId" style="font-size:11px;color:red;margin-top:4px">Lưu thông tin cơ bản trước khi tải ảnh bìa!</div>
                <div *ngIf="coverFileName" style="font-size:12px;color:var(--success);margin-top:4px">Đã chọn: {{ coverFileName }}</div>
              </div>
            </div>
          </div>

          <div class="form-card card">
            <div class="section-header">
              <h3><i class="fa-solid fa-book"></i> Nội dung khóa học (Chương & Bài học)</h3>
              <button class="btn btn-outline btn-sm" (click)="showCreateChapter()" [disabled]="!editId"><i class="fa-solid fa-plus"></i> Thêm chương</button>
            </div>
            <div *ngIf="!editId" style="font-size:13px; color: red;">Vui lòng lưu Thông tin cơ bản trước khi thêm chương bài!</div>
            
            <div class="chapter-list" *ngIf="editId" style="margin-top: 16px;">
              <div class="chapter-item card" *ngFor="let ch of chapters" style="margin-bottom: 12px; padding: 16px; background: var(--gray-50); border: 1px solid var(--gray-200);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--gray-200); padding-bottom: 12px; margin-bottom: 12px;">
                  <h4 style="margin: 0; font-size: 15px; font-weight: 700;">{{ ch.tieuDe || ch.TieuDe }}</h4>
                  <button class="btn btn-sm btn-primary" (click)="showCreateLesson(ch.maChuong || ch.MaChuong)">+ Thêm bài học</button>
                </div>
                <div class="lesson-list">
                  <div class="lesson-item" *ngFor="let lesson of ch.baiHocs || ch.BaiHocs" style="padding: 10px; background: var(--white); border: 1px solid var(--gray-200); border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 14px;">
                      {{ lesson.lyThuyet ? (lesson.lyThuyet.length > 50 ? lesson.lyThuyet.substring(0, 50) + '...' : lesson.lyThuyet) : 'Bài học' }}
                      <span *ngIf="lesson.linkVideo" style="color: var(--success); font-size: 11px; margin-left: 6px;" title="Đã có video">🎥 (Có Video)</span>
                      <span *ngIf="lesson.linkTaiLieu" style="color: var(--primary); font-size: 11px; margin-left: 6px;" title="Đã có tài liệu">📄 (Có PDF)</span>
                    </span>
                    <div style="display: flex; gap: 8px;">
                      <input type="file" #videoInput style="display:none" accept="video/*" (change)="onVideoChange($event, lesson.maBaiHoc || lesson.MaBaiHoc)">
                      <button class="btn btn-outline btn-sm" title="Upload Video" (click)="videoInput.click()"><i class="fa-solid fa-film"></i> Video</button>
                      
                      <input type="file" #pdfInput style="display:none" accept=".pdf" (change)="onPdfChange($event, lesson.maBaiHoc || lesson.MaBaiHoc)">
                      <button class="btn btn-outline btn-sm" title="Upload Tài liệu PDF" (click)="pdfInput.click()"><i class="fa-solid fa-file-pdf"></i> PDF</button>
                    </div>
                  </div>
                  <div *ngIf="!ch.baiHocs || ch.baiHocs.length === 0" style="font-size: 12px; color: var(--gray-400);">Chưa có bài học nào trong chương này.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quản lý Thông báo -->
          <div class="form-card card" *ngIf="editId">
            <div class="section-header">
              <h3><i class="fa-solid fa-bullhorn"></i> Thông báo cho lớp học</h3>
              <button class="btn btn-primary btn-sm" (click)="showCreateAnnouncement()"><i class="fa-solid fa-plus"></i> Viết thông báo</button>
            </div>
            <div class="announcement-list">
              <div class="announcement-item card" *ngFor="let tb of announcements" style="padding: 16px; margin-bottom: 12px; border: 1px solid var(--gray-200); position: relative;">
                <h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700;">{{ tb.tieuDe || tb.TieuDe }}</h4>
                <p style="font-size: 13px; color: var(--gray-600); white-space: pre-line; margin-bottom: 12px;">{{ tb.noiDung || tb.NoiDung }}</p>
                <span style="font-size: 11px; color: var(--gray-400);">{{ tb.ngayTao || tb.NgayTao | date:'dd/MM/yyyy HH:mm' }}</span>
                <button class="btn btn-icon btn-sm" title="Xóa thông báo" style="position: absolute; top: 16px; right: 16px; color: var(--danger); border-color: transparent;" (click)="deleteAnnouncement(tb.maThongBao || tb.MaThongBao)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
              <div *ngIf="announcements.length === 0" style="font-size: 12px; color: var(--gray-400);">Chưa có thông báo nào.</div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="create-sidebar">
          <div class="publish-card card">
            <h3> Xuất bản</h3>
            <div class="pub-status">
              <span>Trạng thái:</span>
              <span class="badge" [class.badge-success]="status === 'Published'" [class.badge-warning]="status === 'Draft'" [class.badge-danger]="status === 'Pending'">
                {{ getStatusLabel() }}
              </span>
            </div>
            
            <div class="form-group" style="margin-top: 16px;">
              <label>Giá khóa học *</label>
              <input type="number" class="form-control" [(ngModel)]="price" placeholder="Giá gốc (VND)">
            </div>
            
            <button class="btn btn-primary w-100" style="margin-top: 12px; height: 48px; font-size:16px;" (click)="saveCourse()" [disabled]="isSaving">
               <i class="fa-solid fa-circle-notch fa-spin" *ngIf="isSaving"></i>
               <i class="fa-solid fa-save" *ngIf="!isSaving"></i>
               {{ editId ? 'Cập nhật khóa học' : 'Lưu thông tin cơ bản' }}
            </button>

            <button *ngIf="editId && (status === 'Draft' || status === 'Rejected')" 
                    class="btn btn-outline w-100" 
                    style="margin-top: 12px; height: 44px; border-color: var(--primary); color: var(--primary);" 
                    (click)="submitForReview()"
                    [disabled]="isSaving">
              <i class="fa-solid fa-paper-plane"></i> Gửi duyệt khóa học
            </button>

            <!-- <div class="split-info">
              <h4>📊 Tỷ lệ doanh thu</h4>
              <span>Giảng viên: <strong class="success">70%</strong></span>
            </div> -->
          </div>

          <div class="checklist card">
            <h4><i class="fa-solid fa-clipboard-list"></i> Checklist</h4>
            <div class="check-item" [class.done]="title">✓ Tiêu đề đầy đủ</div>
            <div class="check-item" [class.done]="description">✓ Mô tả chi tiết</div>
            <div class="check-item done">✓ Ảnh bìa đạt chuẩn</div>
            <div class="check-item" [class.done]="price > 0">✓ Giá được thiết lập</div>
          </div>
        </aside>
      </div>
    </app-instructor-layout>
  `,
  styles: [`
    h1 { font-size: 22px; margin-bottom: 12px; }
    .stepper { display: flex; align-items: center; margin-bottom: 24px; }
    .step {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; color: var(--gray-400); font-weight: 500;
    }
    .step.active { color: var(--gray-800); font-weight: 700; }
    .sn {
      width: 28px; height: 28px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700;
      background: var(--gray-200); color: var(--gray-500);
    }
    .step.active .sn { background: var(--primary); color: var(--white); }
    .step-line { flex: 1; height: 2px; background: var(--gray-200); margin: 0 16px; max-width: 100px; }

    .create-body { display: flex; gap: 20px; }
    .create-main { flex: 1; }
    .form-card { padding: 20px; margin-bottom: 16px; }
    .form-card h3 { font-size: 16px; margin-bottom: 16px; }
    .form-row { display: flex; gap: 12px; }
    .form-row .form-group { flex: 1; }
    
    .form-group { margin-bottom: 16px; position: relative; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: var(--gray-700); margin-bottom: 8px; }
    .form-control {
      width: 100%; padding: 10px 14px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm);
      font-size: 14px; outline: none; transition: all 0.2s ease;
      font-family: inherit;
    }
    .form-control:focus { border-color: #FF7B54; box-shadow: 0 0 0 3px rgba(255,123,84,0.1); }
    .form-select {
      width: 100%; padding: 10px 32px 10px 14px; border: 1px solid var(--gray-200); border-radius: var(--radius-sm);
      font-size: 14px; background: var(--white); outline: none; cursor: pointer; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 10px center; background-size: 14px;
    }

    .media-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .upload-box {
      border: 2px dashed var(--gray-300);
      border-radius: var(--radius-md);
      padding: 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .upload-icon { font-size: 32px; }
    .upload-meta { font-size: 12px; color: var(--gray-400); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }

    .create-sidebar { width: 300px; flex-shrink: 0; }
    .publish-card { padding: 20px; margin-bottom: 16px; }
    .publish-card h3 { font-size: 16px; margin-bottom: 12px; }
    .pub-status { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 14px; }
    .cat-select { padding: 10px 14px; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); font-size: 14px; }
    .split-info { margin-top: 16px; }
    .split-info h4 { font-size: 14px; margin-bottom: 6px; }
    .success { color: var(--success); }

    .checklist { padding: 16px; background: var(--primary-bg); border-color: transparent; }
    .checklist h4 { font-size: 14px; margin-bottom: 12px; color: var(--primary); }
    .check-item { font-size: 13px; padding: 3px 0; color: var(--gray-400); }
    .check-item.done { color: var(--success); }
  `]
})
export class CreateCourseComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  categories: any[] = [];
  editId: string | null = null;
  isInitialLoading = false;
  isSaving = false;

  // Form Fields
  title = '';
  description = '';
  price = 0;
  selectedCategory = '';
  selectedLang = 'Tiếng Việt';
  selectedLevel = 'Tất cả cấp độ';
  status = 'Draft';
  thoiGianHocDuKien: number | null = null;
  thoiGianChoPhepTre: number | null = null;

  // Static options
  languages = ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Nhật', 'Tiếng Hàn', 'Song ngữ (Việt - Anh)'];
  levels = ['Tất cả cấp độ', 'Cơ bản (Cho người mới)', 'Trung bình', 'Nâng cao', 'Chuyên gia'];

  coverFileName = '';
  chapters: any[] = [];
  announcements: any[] = [];

  ngOnInit() {
    this.editId = this.route.snapshot.paramMap.get('id');

    // Load categories first
    this.api.getCategories().subscribe(res => {
      this.categories = res?.data || res || [];
      if (!this.editId && this.categories.length > 0) {
        this.selectedCategory = this.categories[0].maTheLoai || this.categories[0].MaTheLoai;
      }
    });

    if (this.editId) {
      this.loadCourseData(Number(this.editId));
    }
  }

  loadCourseData(id: number) {
    this.isInitialLoading = true;
    this.api.getCourseById(id).subscribe({
      next: (res) => {
        // Many APIs return data wrapped in 'data' field
        const course = res.data || res;
        if (course) {
          this.title = course.tieuDe || course.TieuDe || '';
          this.description = course.moTa || course.MoTa || '';
          this.price = course.giaGoc || course.GiaGoc || 0;
          this.selectedCategory = course.maTheLoai || course.MaTheLoai || course.theLoai?.maTheLoai || course.TheLoai?.MaTheLoai || '';
          this.status = course.tinhTrang || course.TinhTrang || 'Draft';
          this.thoiGianHocDuKien = course.thoiGianHocDuKien || course.ThoiGianHocDuKien || null;
          this.thoiGianChoPhepTre = course.thoiGianChoPhepTre || course.ThoiGianChoPhepTre || null;
        }

        // Tải danh sách chương
        this.api.getCourseChapters(id).subscribe({
          next: (chaps) => {
            this.chapters = chaps.data || chaps || [];
            this.isInitialLoading = false;
          },
          error: () => this.isInitialLoading = false
        });

        // Tải thông báo
        this.loadAnnouncements(id);
      },
      error: () => {
        this.isInitialLoading = false;
        Swal.fire('Lỗi', 'Không thể tải thông tin khóa học.', 'error');
        this.router.navigate(['/instructor/courses']);
      }
    });
  }

  onCoverChange(event: any) {
    if (!this.editId) return;
    const file = event.target.files[0];
    if (file) {
      this.coverFileName = file.name;
      this.api.uploadCourseCover(Number(this.editId), file).subscribe({
        next: () => Swal.fire('Thành công', 'Đã tải lên ảnh bìa', 'success'),
        error: (err) => Swal.fire('Lỗi', 'Không thể tải lên ảnh: ' + (err.error?.message || ''), 'error')
      });
    }
  }

  showCreateChapter() {
    Swal.fire({
      title: 'Tạo chương mới',
      input: 'text',
      inputLabel: 'Tiêu đề chương',
      inputPlaceholder: 'Nhập tiêu đề chương...',
      showCancelButton: true,
      confirmButtonText: 'Tạo',
      cancelButtonText: 'Hủy',
      preConfirm: (val) => {
        if (!val) { Swal.showValidationMessage('Vui lòng nhập tiêu đề!'); }
        return val;
      }
    }).then((result) => {
      if (result.isConfirmed && this.editId) {
        this.api.createChapter(Number(this.editId), { tieuDe: result.value }).subscribe({
          next: () => {
            Swal.fire('Thành công', 'Đã thêm chương mới', 'success');
            this.api.getCourseChapters(Number(this.editId)).subscribe((res) => this.chapters = res.data || res || []);
          },
          error: () => Swal.fire('Lỗi', 'Không thể tạo chương', 'error')
        });
      }
    });
  }

  showCreateLesson(chapterId: number) {
    Swal.fire({
      title: 'Thêm bài học mới',
      input: 'textarea',
      inputLabel: 'Tiêu đề / Lý thuyết bài học',
      inputPlaceholder: 'Nhập nội dung bài học...',
      showCancelButton: true,
      confirmButtonText: 'Tạo',
      cancelButtonText: 'Hủy',
      preConfirm: (val) => {
        if (!val) { Swal.showValidationMessage('Vui lòng nhập lý thuyết!'); }
        return val;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.createLesson(chapterId, { lyThuyet: result.value }).subscribe({
          next: () => {
            Swal.fire('Thành công', 'Đã thêm bài học mới', 'success');
            if (this.editId) this.api.getCourseChapters(Number(this.editId)).subscribe((res) => this.chapters = res.data || res || []);
          },
          error: () => Swal.fire('Lỗi', 'Không thể tạo bài học', 'error')
        });
      }
    });
  }

  onVideoChange(event: any, lessonId: number) {
    const file = event.target.files[0];
    if (file) {
      Swal.fire({
        title: 'Đang tải lên...',
        text: 'Đang tải video lên Cloudinary, vui lòng đợi...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading() }
      });
      this.api.uploadLessonVideo(lessonId, file).subscribe({
        next: () => {
          Swal.fire('Thành công', 'Đã tải upload video', 'success');
          if (this.editId) this.api.getCourseChapters(Number(this.editId)).subscribe((res) => this.chapters = res.data || res || []);
        },
        error: (err) => Swal.fire('Lỗi', 'Tải video thất bại: ' + (err.error?.message || ''), 'error')
      });
    }
  }

  onPdfChange(event: any, lessonId: number) {
    const file = event.target.files[0];
    if (file) {
      Swal.fire({
        title: 'Đang tải lên...',
        text: 'Đang tải tài liệu lên Cloudinary, vui lòng đợi...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading() }
      });
      this.api.uploadLessonPdf(lessonId, file).subscribe({
        next: () => {
          Swal.fire('Thành công', 'Đã tải upload tài liệu', 'success');
          if (this.editId) this.api.getCourseChapters(Number(this.editId)).subscribe((res) => this.chapters = res.data || res || []);
        },
        error: (err) => Swal.fire('Lỗi', 'Tải tài liệu thất bại: ' + (err.error?.message || ''), 'error')
      });
    }
  }

  loadAnnouncements(id: number) {
    this.api.getInstructorCourseAnnouncements(id).subscribe(res => {
      this.announcements = res || [];
    });
  }

  showCreateAnnouncement() {
    Swal.fire({
      title: 'Viết thông báo',
      html: `
        <input id="tb-title" class="swal2-input" placeholder="Tiêu đề thông báo">
        <textarea id="tb-content" class="swal2-textarea" placeholder="Nội dung..."></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Đăng thông báo',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        const title = (document.getElementById('tb-title') as HTMLInputElement).value;
        const content = (document.getElementById('tb-content') as HTMLTextAreaElement).value;
        if (!title || !content) { Swal.showValidationMessage('Vui lòng nhập đủ thông tin!'); }
        return { tieuDe: title, noiDung: content };
      }
    }).then((result) => {
      if (result.isConfirmed && this.editId) {
        this.api.createAnnouncement(Number(this.editId), result.value).subscribe({
          next: () => {
            Swal.fire('Thành công', 'Đã đăng thông báo', 'success');
            this.loadAnnouncements(Number(this.editId));
          },
          error: () => Swal.fire('Lỗi', 'Không thể đăng thông báo', 'error')
        });
      }
    });
  }

  deleteAnnouncement(id: number) {
    Swal.fire({
      title: 'Xóa thông báo?',
      text: 'Bạn có chắc chắn muốn xóa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa'
    }).then((result) => {
      if (result.isConfirmed && this.editId) {
        this.api.deleteAnnouncement(id).subscribe({
          next: () => {
            Swal.fire('Đã xóa', '', 'success');
            this.loadAnnouncements(Number(this.editId));
          },
          error: () => Swal.fire('Lỗi', 'Không thể xóa', 'error')
        });
      }
    });
  }

  getStatusLabel(): string {
    const map: Record<string, string> = {
      'Published': 'Đã xuất bản',
      'Draft': 'Bản nháp',
      'Pending': 'Chờ duyệt',
      'Rejected': 'Bị từ chối'
    };
    return map[this.status] || 'Bản nháp';
  }

  saveCourse() {
    if (!this.title) {
      Swal.fire('Thông báo', 'Vui lòng nhập tiêu đề khóa học', 'warning');
      return;
    }

    this.isSaving = true;
    const data = {
      tieuDe: this.title,
      moTa: this.description,
      giaGoc: this.price,
      maTheLoai: Number(this.selectedCategory),
      ngonNgu: this.selectedLang,
      capDo: this.selectedLevel,
      thoiGianHocDuKien: this.thoiGianHocDuKien
    };

    const request = this.editId
      ? this.api.updateCourse(Number(this.editId), data)
      : this.api.createCourse(data);

    request.subscribe({
      next: (res) => {
        this.isSaving = false;
        Swal.fire('Thành công', this.editId ? 'Đã cập nhật khóa học' : 'Đã tạo khóa học mới! Bạn có thể tải ảnh bìa và thêm nội dung.', 'success');
        if (this.editId) {
          this.router.navigate(['/instructor/courses']);
        } else {
          // Chuyển sang chế độ edit để upload ảnh bìa & thêm chương
          const newId = res.courseId;
          this.router.navigate(['/instructor/courses/edit', newId]);
        }
      },
      error: (err) => {
        this.isSaving = false;
        let errMsg = err.error?.message;
        if (!errMsg && err.error?.errors) {
          // Lấy tất cả các lỗi validation (nếu có)
          errMsg = Object.values(err.error.errors).flat().join('\n');
        }
        if (!errMsg && err.message) errMsg = err.message;

        Swal.fire('Lỗi', errMsg || 'Lỗi ' + err.status + ' - Có lỗi xảy ra khi lưu', 'error');
      }
    });
  }

  submitForReview() {
    if (!this.editId) return;

    Swal.fire({
      title: 'Xác nhận gửi duyệt?',
      text: "Khóa học sẽ được gửi cho quản trị viên xem xét. Đảm bảo bạn đã hoàn tất nội dung.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#5B63D3',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Đúng, gửi duyệt!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isSaving = true;
        this.api.submitCourseForReview(Number(this.editId)).subscribe({
          next: (res) => {
            this.isSaving = false;
            Swal.fire('Thành công', res.message, 'success');
            this.status = 'Pending';
            this.router.navigate(['/instructor/courses']);
          },
          error: (err) => {
            this.isSaving = false;
            let msg = 'Có lỗi xảy ra khi gửi duyệt.';
            if (err.error?.message) msg = err.error.message;
            else if (typeof err.error === 'string') msg = err.error;
            else if (err.message) msg = err.message;

            Swal.fire('Thất bại', msg, 'error');
          }
        });
      }
    });
  }
}

