import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InstructorLayoutComponent } from '../../../layouts/instructor-layout/instructor-layout.component';
import { ApiService } from '../../../core/services/api.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, FormsModule, InstructorLayoutComponent],
  template: `
    <app-instructor-layout>
      <div class="header-section">
        <h1 class="page-title">
          <i class="fa-solid" [class.fa-magic]="!editId" [class.fa-pen-to-square]="editId"></i> 
          {{ editId ? 'Chỉnh sửa khóa học' : 'Thiết kế khóa học mới' }}
        </h1>
        <p class="subtitle">Tạo nên những nội dung học tập chất lượng cao và chia sẻ kiến thức của bạn với thế giới.</p>
      </div>

      <div *ngIf="isInitialLoading" class="loading-overlay">
        <div class="loader"></div>
        <p>Đang chuẩn bị không gian sáng tạo của bạn...</p>
      </div>

      <!-- Enhanced Stepper -->
      <div class="modern-stepper" *ngIf="!isInitialLoading">
        <div class="m-step active">
          <div class="m-sn">1</div>
          <div class="m-label">Thông tin cơ bản</div>
        </div>
        <div class="m-connector active"></div>
        <div class="m-step" [class.active]="editId">
          <div class="m-sn">2</div>
          <div class="m-label">Nội dung bài giảng</div>
        </div>
        <div class="m-connector"></div>
        <div class="m-step">
          <div class="m-sn">3</div>
          <div class="m-label">Giá & Xuất bản</div>
        </div>
      </div>

      <div class="create-container" *ngIf="!isInitialLoading">
        <!-- Main Form -->
        <div class="create-content">
          <div class="glass-card main-card">
            <div class="card-header">
              <i class="fa-solid fa-circle-info"></i>
              <h3>Thông tin tổng quan</h3>
            </div>
            
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Tiêu đề khóa học <span class="required">*</span></label>
                <input type="text" class="modern-input" [(ngModel)]="title" placeholder="Ví dụ: Làm chủ Data Science trong 30 ngày">
              </div>
              
              <div class="form-group">
                <label>Ngôn ngữ giảng dạy</label>
                <div class="select-wrapper">
                  <select class="modern-select" [(ngModel)]="selectedLang">
                    <option *ngFor="let lang of languages" [value]="lang">{{ lang }}</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Cấp độ phù hợp</label>
                <div class="select-wrapper">
                  <select class="modern-select" [(ngModel)]="selectedLevel">
                    <option *ngFor="let lvl of levels" [value]="lvl">{{ lvl }}</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Danh mục khóa học</label>
                <div class="select-wrapper">
                  <select class="modern-select" [(ngModel)]="selectedCategory">
                    <option *ngFor="let cat of categories" [value]="(cat.maTheLoai || cat.MaTheLoai).toString()">{{ cat.ten || cat.Ten }}</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Thời hạn (Tháng)</label>
                <input type="number" class="modern-input" [(ngModel)]="thoiGianHocDuKien" placeholder="Ví dụ: 6">
              </div>

              <div class="form-group full-width">
                <label>Mô tả ngắn gọn</label>
                <textarea class="modern-textarea" rows="4" [(ngModel)]="description" placeholder="Học viên sẽ đạt được những kỹ năng gì sau khóa học này?"></textarea>
              </div>
            </div>
          </div>

          <div class="glass-card media-card">
            <div class="card-header">
              <i class="fa-solid fa-photo-film"></i>
              <h3>Hình ảnh & Thương hiệu</h3>
            </div>
            <div class="upload-area" (click)="coverInput.click()" [class.has-file]="coverFileName || currentAnhUrl">
              <!-- Image Preview -->
              <div *ngIf="currentAnhUrl" class="image-preview-container">
                <img [src]="currentAnhUrl" class="cover-preview-img">
                <div class="image-overlay">
                  <i class="fa-solid fa-camera-rotate"></i>
                  <span>Thay đổi hình ảnh</span>
                </div>
              </div>

              <!-- Default Upload Content (Only show if no image) -->
              <div *ngIf="!currentAnhUrl" class="upload-content">
                <div class="icon-circle">
                  <i class="fa-solid" [class.fa-image]="!coverFileName" [class.fa-check-circle]="coverFileName"></i>
                </div>
                <div class="upload-text">
                  <strong>{{ coverFileName || 'Tải lên ảnh bìa khóa học' }}</strong>
                  <span>{{ coverFileName ? 'Nhấn để thay đổi hình ảnh' : 'Tỷ lệ khuyến nghị 16:9 (JPG, PNG)' }}</span>
                </div>
                <button class="btn-upload">Chọn tệp</button>
              </div>
              <input type="file" #coverInput style="display:none" accept="image/*" (change)="onCoverChange($event)">
            </div>
            <p *ngIf="!editId" class="error-hint"><i class="fa-solid fa-triangle-exclamation"></i> Lưu thông tin cơ bản trước khi tải ảnh!</p>
          </div>

          <div class="glass-card curriculum-card">
            <div class="card-header">
              <div class="title-with-icon">
                <i class="fa-solid fa-layer-group"></i>
                <h3>Cấu trúc bài giảng</h3>
              </div>
              <button class="btn-add-chapter" (click)="showCreateChapter()" [disabled]="!editId">
                <i class="fa-solid fa-plus-circle"></i> Thêm chương mới
              </button>
            </div>
            
            <div *ngIf="!editId" class="empty-state">
              <i class="fa-solid fa-lock"></i>
              <p>Hãy lưu thông tin cơ bản để bắt đầu xây dựng bài giảng của bạn.</p>
            </div>
            
            <div class="chapter-list" *ngIf="editId">
              <div class="chapter-item" 
                   *ngFor="let ch of chapters; let i = index" 
                   draggable="true"
                   (dragstart)="onChapterDragStart(i)"
                   (dragover)="onDragOver($event)"
                   (drop)="onChapterDrop(i)">
                
                <div class="chapter-header">
                  <div class="chapter-info">
                    <div class="drag-handle"><i class="fa-solid fa-grip-lines"></i></div>
                    <div class="chapter-meta">
                      <span class="chapter-number">Chương {{ i + 1 }}</span>
                      <h4 (click)="editChapterTitle(ch)">{{ ch.tieuDe || ch.TieuDe }} <i class="fa-solid fa-pen"></i></h4>
                    </div>
                  </div>
                  <div class="chapter-actions">
                    <button class="btn-add-lesson" (click)="showCreateLesson(ch.maChuong || ch.MaChuong)">
                      <i class="fa-solid fa-plus"></i> Thêm bài học
                    </button>
                    <button class="icon-btn delete-chapter" (click)="deleteChapter(ch.maChuong || ch.MaChuong)" title="Xóa chương">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>

                <div class="lesson-container" 
                     (dragover)="onDragOver($event)" 
                     (drop)="onLessonDrop(i, (ch.baiHocs ? ch.baiHocs.length : (ch.BaiHocs ? ch.BaiHocs.length : 0)))">
                  
                  <div class="lesson-card" 
                       *ngFor="let lesson of ch.baiHocs || ch.BaiHocs; let li = index" 
                       draggable="true"
                       (dragstart)="onLessonDragStart($event, i, li)"
                       (dragover)="onDragOver($event)"
                       (drop)="onLessonDrop(i, li); $event.stopPropagation()">
                    
                    <div class="lesson-main">
                      <div class="lesson-drag"><i class="fa-solid fa-ellipsis-vertical"></i></div>
                      <div class="lesson-content">
                        <div class="lesson-title" (click)="editLessonTitle(lesson, ch.maChuong || ch.MaChuong)">
                          {{ lesson.lyThuyet || lesson.LyThuyet || 'Bài học không tên' }} <i class="fa-solid fa-pen"></i>
                        </div>
                        <div class="lesson-desc" *ngIf="lesson.baiTap || lesson.BaiTap">
                          {{ (lesson.baiTap || lesson.BaiTap).length > 120 ? (lesson.baiTap || lesson.BaiTap).substring(0, 120) + '...' : (lesson.baiTap || lesson.BaiTap) }}
                        </div>
                        <div class="lesson-assets">
                          <div class="asset-tag previewable" *ngIf="lesson.linkVideo || lesson.LinkVideo" (click)="previewVideo(lesson.linkVideo || lesson.LinkVideo)">
                            <i class="fa-solid fa-play-circle"></i> Video
                          </div>
                          <div class="asset-tag previewable pdf-tag" *ngIf="lesson.linkTaiLieu || lesson.LinkTaiLieu" (click)="previewPdf(lesson.linkTaiLieu || lesson.LinkTaiLieu)">
                            <i class="fa-solid fa-file-pdf"></i> Tài liệu PDF
                          </div>
                        </div>
                      </div>
                      
                      <div class="lesson-actions">
                        <div class="upload-btns">
                          <button class="icon-btn video" (click)="vInp.click()" title="Cập nhật Video"><i class="fa-solid fa-film"></i></button>
                          
                          <button class="icon-btn pdf" (click)="pInp.click()" title="Cập nhật PDF">
                            <i class="fa-solid fa-file-pdf"></i>
                          </button>

                          <input type="file" #vInp style="display:none" accept="video/*" (change)="onVideoChange($event, lesson.maBaiHoc || lesson.MaBaiHoc)">
                          <input type="file" #pInp style="display:none" accept=".pdf" (change)="onPdfChange($event, lesson.maBaiHoc || lesson.MaBaiHoc)">
                        </div>
                        <button class="icon-btn delete" (click)="deleteLesson(lesson.maBaiHoc || lesson.MaBaiHoc)" title="Xóa bài học"><i class="fa-solid fa-trash-can"></i></button>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="!(ch.baiHocs || ch.BaiHocs) || (ch.baiHocs || ch.BaiHocs).length === 0" class="lesson-empty">
                    <i class="fa-solid fa-arrow-down-long"></i>
                    Thả bài học vào đây để sắp xếp vào chương này
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Sidebar -->
        <aside class="create-sticky-sidebar">
          <div class="glass-card status-card">
            <h3>Trạng thái & Xuất bản</h3>
            <div class="status-badge" [attr.data-status]="status">
              <i class="fa-solid fa-circle"></i> {{ getStatusLabel() }}
            </div>
            
            <div class="price-input-group">
              <label>Giá niêm yết (VND)</label>
              <div class="price-wrapper">
                <input type="number" [(ngModel)]="price" placeholder="0">
                <span>đ</span>
              </div>
            </div>
            
            <button class="btn-primary-gradient" (click)="saveCourse()" [disabled]="isSaving">
              <i class="fa-solid fa-circle-notch fa-spin" *ngIf="isSaving"></i>
              <i class="fa-solid fa-rocket" *ngIf="!isSaving"></i>
              {{ editId ? 'Cập nhật thay đổi' : 'Khởi tạo khóa học' }}
            </button>

            <button *ngIf="editId && (status === 'Draft' || status === 'Rejected')" 
                    class="btn-outline-glow" 
                    (click)="submitForReview()"
                    [disabled]="isSaving">
              <i class="fa-solid fa-paper-plane"></i> Gửi kiểm duyệt ngay
            </button>
          </div>

          <div class="glass-card checklist-card">
            <h4><i class="fa-solid fa-list-check"></i> Tiến độ hoàn thiện</h4>
            <div class="checklist-items">
              <div class="c-item" [class.done]="title">
                <i class="fa-solid" [class.fa-circle-check]="title" [class.fa-circle]="!title"></i> Tiêu đề khóa học
              </div>
              <div class="c-item" [class.done]="description">
                <i class="fa-solid" [class.fa-circle-check]="description" [class.fa-circle]="!description"></i> Nội dung mô tả
              </div>
              <div class="c-item" [class.done]="coverFileName">
                <i class="fa-solid" [class.fa-circle-check]="coverFileName" [class.fa-circle]="!coverFileName"></i> Hình ảnh đại diện
              </div>
              <div class="c-item" [class.done]="price > 0">
                <i class="fa-solid" [class.fa-circle-check]="price > 0" [class.fa-circle]="!price"></i> Thiết lập giá bán
              </div>
              <div class="c-item" [class.done]="chapters.length > 0">
                <i class="fa-solid" [class.fa-circle-check]="chapters.length > 0" [class.fa-circle]="!chapters.length"></i> Ít nhất 1 chương
              </div>
            </div>
          </div>
        </aside>
      </div>
    </app-instructor-layout>
  `,
  styles: [`
    :host { --primary: #FF7B54; --primary-light: #FF9F80; --primary-dark: #E86A45; --bg-slate: #F8FAFC; }
    
    .header-section { margin-bottom: 32px; }
    .page-title { font-size: 28px; font-weight: 800; color: #1E293B; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; }
    .page-title i { color: var(--primary); }
    .subtitle { color: #64748B; font-size: 15px; }

    .modern-stepper { display: flex; align-items: center; margin-bottom: 40px; background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
    .m-step { display: flex; align-items: center; gap: 12px; }
    .m-sn { width: 32px; height: 32px; border-radius: 10px; background: #F1F5F9; color: #94A3B8; display: flex; align-items: center; justify-content: center; font-weight: 700; transition: all 0.3s; }
    .asset-tag.previewable { cursor: pointer; background: #E0F2FE; color: #0369A1; border: 1px solid #BAE6FD; }
    .asset-tag.previewable:hover { background: #0369A1; color: white; transform: scale(1.05); }
    
    .asset-tag.pdf-tag { background: #DCFCE7; color: #15803D; border-color: #BBF7D0; }
    .asset-tag.pdf-tag:hover { background: #15803D; color: white; }

    .m-step.active .m-sn { background: var(--primary); color: white; transform: scale(1.1); box-shadow: 0 4px 12px rgba(255,123,84,0.3); }
    .m-step.active .m-label { color: #1E293B; }
    .m-connector { flex: 1; height: 3px; background: #F1F5F9; margin: 0 20px; border-radius: 2px; }
    .m-connector.active { background: var(--primary-light); }

    .create-container { display: flex; gap: 24px; }
    .create-content { flex: 1; display: flex; flex-direction: column; gap: 24px; }
    
    .glass-card { background: white; border-radius: 20px; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 10px 30px rgba(0,0,0,0.02); transition: all 0.3s ease; }
    .glass-card:hover { border-color: var(--primary-light); }
    .card-header { padding: 24px; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center; }
    .card-header h3 { font-size: 18px; font-weight: 700; color: #334155; margin: 0; display: flex; align-items: center; gap: 10px; }
    .card-header i { color: var(--primary); font-size: 20px; }

    .form-grid { padding: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .full-width { grid-column: span 2; }
    .form-group label { display: block; font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 10px; }
    .required { color: #EF4444; }

    .modern-input, .modern-textarea, .modern-select {
      width: 100%; padding: 12px 16px; border: 2px solid #F1F5F9; border-radius: 12px; font-size: 14px; outline: none; transition: all 0.2s; background: #F8FAFC;
    }
    .modern-input:focus, .modern-textarea:focus, .modern-select:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(255,123,84,0.1); }
    
    .upload-area { margin: 24px; border: 2px dashed #CBD5E1; border-radius: 16px; padding: 40px; cursor: pointer; transition: all 0.3s; background: #F8FAFC; text-align: center; }
    .upload-area:hover { border-color: var(--primary); background: rgba(255,123,84,0.02); }
    .upload-area.has-file { border-color: #10B981; background: #F8FAFC; padding: 0; overflow: hidden; height: 220px; }
    
    .image-preview-container { position: relative; width: 100%; height: 100%; }
    .cover-preview-img { width: 100%; height: 100%; object-fit: cover; }
    .image-overlay { 
      position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.4); display: flex; flex-direction: column; 
      align-items: center; justify-content: center; color: white; gap: 8px;
      opacity: 0; transition: 0.3s;
    }
    .image-preview-container:hover .image-overlay { opacity: 1; }
    .image-overlay i { font-size: 24px; }
    .image-overlay span { font-weight: 600; font-size: 14px; }

    .icon-circle { width: 64px; height: 64px; background: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px; color: #94A3B8; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .has-file .icon-circle { color: #10B981; }
    .upload-text strong { display: block; color: #334155; margin-bottom: 4px; }
    .upload-text span { font-size: 12px; color: #94A3B8; }
    .btn-upload { margin-top: 20px; padding: 8px 24px; background: white; border: 1px solid #E2E8F0; border-radius: 8px; font-weight: 600; color: #475569; }

    .btn-add-chapter { padding: 10px 18px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; color: #475569; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .btn-add-chapter:hover { background: var(--primary); color: white; border-color: var(--primary); }

    .chapter-item { background: #F8FAFC; border-radius: 16px; border: 1px solid #E2E8F0; margin: 24px; overflow: hidden; cursor: grab; }
    .chapter-header { padding: 16px 20px; background: white; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; }
    .chapter-info { display: flex; align-items: center; gap: 16px; }
    .drag-handle { color: #CBD5E1; }
    .chapter-number { font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; }
    .chapter-meta h4 { font-size: 15px; font-weight: 700; color: #1E293B; margin: 0; cursor: pointer; }
    .chapter-meta h4 i { font-size: 12px; opacity: 0; transition: 0.2s; }
    .chapter-meta h4:hover i { opacity: 1; color: var(--primary); }

    .lesson-container { padding: 16px; min-height: 50px; }
    .lesson-card { background: white; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 12px; transition: all 0.2s; cursor: grab; }
    .lesson-card:hover { border-color: var(--primary-light); box-shadow: 0 4px 12px rgba(0,0,0,0.03); transform: translateY(-2px); }
    .lesson-main { display: flex; align-items: center; padding: 14px; gap: 14px; }
    .lesson-drag { color: #E2E8F0; }
    .lesson-content { flex: 1; }
    .lesson-title { font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .lesson-title i { font-size: 11px; opacity: 0; transition: 0.2s; color: var(--primary); }
    .lesson-title:hover i { opacity: 1; }
    .lesson-desc { font-size: 13px; color: #64748B; margin-bottom: 8px; line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .lesson-assets { display: flex; gap: 8px; }
    .asset-tag { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: #F1F5F9; color: #64748B; display: flex; align-items: center; gap: 4px; }
    
    .lesson-actions { display: flex; align-items: center; gap: 12px; }
    .chapter-actions { display: flex; gap: 8px; align-items: center; }
    .btn-add-lesson { background: #F1F5F9; color: #475569; padding: 6px 14px; border-radius: 12px; border: 1px solid #E2E8F0; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
    .btn-add-lesson:hover { background: #E2E8F0; color: #1E293B; transform: translateY(-1px); }
    .btn-add-lesson i { font-size: 14px; color: var(--primary); }

    .icon-btn.delete-chapter { width: 32px; height: 32px; border: 1px solid transparent; color: #94A3B8; background: transparent; transition: all 0.3s; }
    .icon-btn.delete-chapter:hover { color: #EF4444; background: #FEF2F2; border-color: #FEE2E2; transform: rotate(8deg) scale(1.1); }

    .upload-btns { display: flex; gap: 6px; align-items: center; }
    .icon-btn.video:hover, .icon-btn.pdf:hover { color: #0369A1; border-color: #0369A1; background: #E0F2FE; }
    .chapter-select { font-size: 11px; padding: 6px 10px; border-radius: 8px; border: 1px solid #F1F5F9; color: #64748B; cursor: pointer; }

    .create-sticky-sidebar { width: 320px; position: sticky; top: 24px; display: flex; flex-direction: column; gap: 24px; height: fit-content; }
    .status-card { padding: 24px; }
    .status-card h3 { font-size: 16px; font-weight: 700; color: #334155; margin-bottom: 16px; }
    .status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-bottom: 24px; }
    .status-badge[data-status="Published"] { background: #DCFCE7; color: #166534; }
    .status-badge[data-status="Draft"] { background: #F1F5F9; color: #475569; }
    .status-badge[data-status="Rejected"] { background: #FEE2E2; color: #991B1B; }
    
    .price-input-group { margin-bottom: 24px; }
    .price-wrapper { position: relative; display: flex; align-items: center; }
    .price-wrapper input { width: 100%; padding: 12px 40px 12px 16px; border: 2px solid #F1F5F9; border-radius: 12px; font-weight: 700; font-size: 18px; color: #1E293B; outline: none; }
    .price-wrapper span { position: absolute; right: 16px; font-weight: 700; color: #94A3B8; }

    .btn-primary-gradient { width: 100%; height: 52px; background: linear-gradient(135deg, #FF7B54, #FF5C2E); border: none; border-radius: 14px; color: white; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 24px rgba(255,123,84,0.3); transition: all 0.3s; margin-bottom: 12px; }
    .btn-primary-gradient:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(255,123,84,0.4); }
    .btn-outline-glow { width: 100%; height: 48px; background: white; border: 2px solid #FF7B54; border-radius: 14px; color: #FF7B54; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .btn-outline-glow:hover { background: #FF7B54; color: white; }

    .checklist-card { padding: 24px; }
    .checklist-card h4 { font-size: 15px; font-weight: 700; color: #334155; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .checklist-card h4 i { color: var(--primary); font-size: 18px; }

    .checklist-items { display: flex; flex-direction: column; gap: 14px; }
    .c-item { font-size: 13.5px; color: #64748B; display: flex; align-items: center; gap: 12px; transition: all 0.3s; line-height: 1.4; }
    .c-item.done { color: #10B981; font-weight: 600; }
    .c-item i { font-size: 16px; width: 20px; text-align: center; }

    .loading-overlay { padding: 100px; text-align: center; color: #64748B; }
    .loader { width: 48px; height: 48px; border: 5px solid #F1F5F9; border-bottom-color: var(--primary); border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; margin-bottom: 16px; }
    @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* Custom Swal Form */
    .swal-form { text-align: left; }
    .swal-field { margin-bottom: 16px; }
    .swal-field label { display: block; font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 6px; }
    .swal2-input, .swal2-textarea { margin: 0 !important; width: 100% !important; box-sizing: border-box; }
    .swal2-textarea { height: 120px !important; }
  `]
})
export class CreateCourseComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

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

  languages = ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Nhật', 'Tiếng Hàn', 'Song ngữ (Việt - Anh)'];
  levels = ['Tất cả cấp độ', 'Cơ bản (Cho người mới)', 'Trung bình', 'Nâng cao', 'Chuyên gia'];

  coverFileName = '';
  currentAnhUrl = '';
  chapters: any[] = [];
  announcements: any[] = [];

  // Drag & Drop State
  draggedChapterIndex: number | null = null;
  draggedLesson: { chapterIndex: number, lessonIndex: number } | null = null;

  ngOnInit() {
    console.log('NG_ON_INIT_START');
    this.editId = this.route.snapshot.paramMap.get('id');
    this.loadInitialData();
  }

  loadInitialData() {
    this.isInitialLoading = true;
    console.log('--- FETCHING DATA --- ID:', this.editId);

    const categories$ = this.api.getCategories();

    if (this.editId) {
      const course$ = this.api.getCourseById(Number(this.editId));
      forkJoin([categories$, course$]).subscribe({
        next: ([catRes, courseRes]) => {
          console.log('CAT_RES:', catRes);
          console.log('COURSE_RES:', courseRes);

          // Xử lý Categories
          this.categories = catRes?.data || catRes || [];

          // Xử lý Course - Thử mọi cách để lấy object
          const course = courseRes?.course || courseRes?.data || courseRes;
          if (course && typeof course === 'object') {
            console.log('COURSE_OBJECT_FOUND:', course);

            this.title = course.tieuDe || course.TieuDe || '';
            this.description = course.moTa || course.MoTa || '';
            this.price = course.giaGoc || course.GiaGoc || 0;
            this.status = course.tinhTrang || course.TinhTrang || 'Draft';
            this.thoiGianHocDuKien = course.thoiGianHocDuKien || course.ThoiGianHocDuKien || null;

            // Lấy ID Danh mục (Thử cả snake_case và PascalCase)
            let catId = course.maTheLoai || course.MaTheLoai || (course.theLoai?.maTheLoai) || (course.TheLoai?.MaTheLoai) || '';
            this.selectedCategory = catId.toString();

            // Cập nhật tên file ảnh bìa nếu đã có URL
            const anhUrl = course.anhUrl || course.AnhUrl;
            if (anhUrl) {
              this.coverFileName = 'Đã có ảnh bìa';
              this.currentAnhUrl = anhUrl; // Lưu URL để hiển thị
            }
          }

          this.isInitialLoading = false;
          this.cdr.detectChanges();

          // Load chapters
          this.api.getCourseChapters(Number(this.editId)).subscribe(chaps => {
            console.log('Dữ liệu Chapters:', chaps);
            this.chapters = chaps.data || chaps || [];
            this.cdr.detectChanges();
          });
          this.loadAnnouncements(Number(this.editId));
        },
        error: (err) => {
          console.error('LỖI KHI TẢI DỮ LIỆU:', err);
          this.isInitialLoading = false;
          Swal.fire('Lỗi', 'Không thể tải dữ liệu từ Server.', 'error');
        }
      });
    } else {
      categories$.subscribe(res => {
        this.categories = res?.data || res || [];
        if (this.categories.length > 0) {
          this.selectedCategory = (this.categories[0].maTheLoai || this.categories[0].MaTheLoai).toString();
        }
        this.isInitialLoading = false;
        this.cdr.detectChanges();
      });
    }
  }

  onCoverChange(event: any) {
    if (!this.editId) return;
    const file = event.target.files[0];
    if (file) {
      this.coverFileName = file.name;

      // Tạo preview tạm thời bằng FileReader
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentAnhUrl = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);

      this.api.uploadCourseCover(Number(this.editId), file).subscribe({
        next: () => Swal.fire('Thành công', 'Đã tải lên ảnh bìa', 'success'),
        error: (err) => Swal.fire('Lỗi', 'Không thể tải lên ảnh bìa', 'error')
      });
    }
  }

  showCreateChapter() {
    Swal.fire({
      title: 'Tạo chương mới',
      input: 'text',
      inputLabel: 'Tiêu đề chương',
      showCancelButton: true,
      preConfirm: (val) => {
        if (!val) { Swal.showValidationMessage('Vui lòng nhập tiêu đề!'); }
        return val;
      }
    }).then((result) => {
      if (result.isConfirmed && this.editId) {
        this.api.createChapter(Number(this.editId), { tieuDe: result.value }).subscribe({
          next: () => {
            this.api.getCourseChapters(Number(this.editId)).subscribe(res => {
              this.chapters = res.data || res || [];
              this.cdr.detectChanges();
            });
          }
        });
      }
    });
  }

  showCreateLesson(chapterId: number) {
    Swal.fire({
      title: 'Thêm bài học mới',
      html: `
        <div class="swal-form">
          <div class="swal-field">
            <label>Tên bài học</label>
            <input id="swal-lesson-title" class="swal2-input" placeholder="Nhập tên bài học...">
          </div>
          <div class="swal-field">
            <label>Nội dung / Mô tả</label>
            <textarea id="swal-lesson-content" class="swal2-textarea" placeholder="Nhập nội dung bài học..."></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Tạo bài học',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        const title = (document.getElementById('swal-lesson-title') as HTMLInputElement).value;
        const content = (document.getElementById('swal-lesson-content') as HTMLTextAreaElement).value;
        if (!title) { Swal.showValidationMessage('Vui lòng nhập tên bài học!'); return false; }
        return { title, content };
      }
    }).then((result) => {
      if (result.isConfirmed && this.editId) {
        this.api.createLesson(chapterId, { 
          lyThuyet: result.value.title, 
          baiTap: result.value.content 
        }).subscribe({
          next: () => this.refreshChapters()
        });
      }
    });
  }

  editChapterTitle(ch: any) {
    Swal.fire({
      title: 'Đổi tên chương',
      input: 'text',
      inputValue: ch.tieuDe || ch.TieuDe,
      showCancelButton: true
    }).then(res => {
      if (res.isConfirmed && res.value) {
        this.api.updateChapter(ch.maChuong || ch.MaChuong, { tieuDe: res.value }).subscribe(() => {
          this.refreshChapters();
        });
      }
    });
  }

  changeLessonChapter(lesson: any, event: any) {
    const targetChapterId = Number(event.target.value);
    if (!targetChapterId) return;

    this.api.updateLesson(lesson.maBaiHoc || lesson.MaBaiHoc, { maChuong: targetChapterId }).subscribe({
      next: () => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã chuyển bài học!', showConfirmButton: false, timer: 2000 });
        this.refreshChapters();
      }
    });
  }

  moveChapterUp(idx: number) {
    if (idx <= 0) return;
    const temp = this.chapters[idx];
    this.chapters[idx] = this.chapters[idx - 1];
    this.chapters[idx - 1] = temp;
    this.cdr.detectChanges();
    // Ghi chú: Hiện tại DB chưa có trường ViTri, khi nào có ta sẽ gọi API updateViTri ở đây.
  }

  moveChapterDown(idx: number) {
    if (idx >= this.chapters.length - 1) return;
    const temp = this.chapters[idx];
    this.chapters[idx] = this.chapters[idx + 1];
    this.chapters[idx + 1] = temp;
    this.cdr.detectChanges();
  }

  moveLessonUp(chapIdx: number, lesIdx: number) {
    if (lesIdx <= 0) return;
    const lessons = this.chapters[chapIdx].baiHocs || this.chapters[chapIdx].BaiHocs;
    const temp = lessons[lesIdx];
    lessons[lesIdx] = lessons[lesIdx - 1];
    lessons[lesIdx - 1] = temp;
    this.cdr.detectChanges();
  }

  moveLessonDown(chapIdx: number, lesIdx: number) {
    const lessons = this.chapters[chapIdx].baiHocs || this.chapters[chapIdx].BaiHocs;
    if (lesIdx >= lessons.length - 1) return;
    const temp = lessons[lesIdx];
    lessons[lesIdx] = lessons[lesIdx + 1];
    lessons[lesIdx + 1] = temp;
    this.cdr.detectChanges();
  }

  // --- HTML5 DRAG & DROP HANDLERS ---
  onDragOver(event: DragEvent) {
    event.preventDefault(); // Cho phép thả
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  // Chapter Drag
  onChapterDragStart(idx: number) {
    this.draggedChapterIndex = idx;
    this.draggedLesson = null;
  }

  onChapterDrop(targetIdx: number) {
    if (this.draggedChapterIndex !== null && this.draggedChapterIndex !== targetIdx) {
      const item = this.chapters.splice(this.draggedChapterIndex, 1)[0];
      this.chapters.splice(targetIdx, 0, item);
      this.cdr.detectChanges();
    }
    this.draggedChapterIndex = null;
  }

  // Lesson Drag
  onLessonDragStart(event: DragEvent, chapIdx: number, lesIdx: number) {
    event.stopPropagation(); // QUAN TRỌNG: Ngăn không cho sự kiện kéo lan ra Chương
    this.draggedLesson = { chapterIndex: chapIdx, lessonIndex: lesIdx };
    this.draggedChapterIndex = null;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onLessonDrop(targetChapIdx: number, targetLesIdx: number) {
    if (this.draggedLesson) {
      const sourceChap = this.chapters[this.draggedLesson.chapterIndex];
      const targetChap = this.chapters[targetChapIdx];
      const sourceLessons = sourceChap.baiHocs || sourceChap.BaiHocs;
      const targetLessons = targetChap.baiHocs || targetChap.BaiHocs;

      const [lesson] = sourceLessons.splice(this.draggedLesson.lessonIndex, 1);

      // Nếu thả sang chương khác, cập nhật DB
      if (this.draggedLesson.chapterIndex !== targetChapIdx) {
        const targetChapterId = targetChap.maChuong || targetChap.MaChuong;
        this.api.updateLesson(lesson.maBaiHoc || lesson.MaBaiHoc, { maChuong: targetChapterId }).subscribe();
      }

      targetLessons.splice(targetLesIdx, 0, lesson);
      this.cdr.detectChanges();
    }
    this.draggedLesson = null;
  }

  // Preview Logic
  previewVideo(url: string) {
    Swal.fire({
      title: 'Xem trước bài giảng Video',
      html: `
        <div style="width:100%; aspect-ratio:16/9; background:#000; border-radius:12px; overflow:hidden;">
          <video id="previewPlayer" controls autoplay style="width:100%; height:100%;">
            <source src="${url}" type="video/mp4">
            Trình duyệt của bạn không hỗ trợ trình phát video.
          </video>
        </div>
      `,
      width: '800px',
      showCloseButton: true,
      showConfirmButton: false,
      didOpen: () => {
        const video = document.getElementById('previewPlayer') as HTMLVideoElement;
        if (video) video.src = url;
      }
    });
  }

  previewPdf(url: string) {
    Swal.fire({
      title: 'Tài liệu bài học (PDF)',
      html: `
        <iframe src="${url}" style="width:100%; height:600px; border:none; border-radius:8px;"></iframe>
      `,
      width: '900px',
      showCloseButton: true,
      showConfirmButton: false
    });
  }

  deleteLesson(id: number) {
    Swal.fire({
      title: 'Xác nhận xóa bài học?',
      text: 'Bài học này sẽ bị gỡ bỏ vĩnh viễn.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#EF4444'
    }).then(result => {
      if (result.isConfirmed) {
        this.api.deleteLesson(id).subscribe(() => {
          this.refreshChapters();
          Swal.fire('Đã xóa', 'Bài học đã được loại bỏ.', 'success');
        });
      }
    });
  }

  deleteChapter(id: number) {
    Swal.fire({
      title: 'Xác nhận xóa chương?',
      text: 'Toàn bộ bài học trong chương này cũng sẽ bị xóa vĩnh viễn!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa tất cả',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#EF4444'
    }).then(result => {
      if (result.isConfirmed) {
        this.api.deleteChapter(id).subscribe(() => {
          this.refreshChapters();
          Swal.fire('Đã xóa', 'Chương và các bài học đã được loại bỏ.', 'success');
        });
      }
    });
  }

  editLessonTitle(lesson: any, chapterId: number) {
    Swal.fire({
      title: 'Chỉnh sửa bài học',
      html: `
        <div class="swal-form">
          <div class="swal-field">
            <label>Tên bài học</label>
            <input id="swal-edit-lesson-title" class="swal2-input" value="${lesson.lyThuyet || lesson.LyThuyet || ''}" placeholder="Nhập tên bài học...">
          </div>
          <div class="swal-field">
            <label>Nội dung / Mô tả</label>
            <textarea id="swal-edit-lesson-content" class="swal2-textarea" placeholder="Nhập nội dung bài học...">${lesson.baiTap || lesson.BaiTap || ''}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lưu thay đổi',
      cancelButtonText: 'Hủy',
      preConfirm: () => {
        const title = (document.getElementById('swal-edit-lesson-title') as HTMLInputElement).value;
        const content = (document.getElementById('swal-edit-lesson-content') as HTMLTextAreaElement).value;
        if (!title) { Swal.showValidationMessage('Vui lòng nhập tên bài học!'); return false; }
        return { title, content };
      }
    }).then(result => {
      if (result.isConfirmed) {
        const updateData = {
          maChuong: chapterId,
          lyThuyet: result.value.title,
          baiTap: result.value.content
        };
        this.api.updateLesson(lesson.maBaiHoc || lesson.MaBaiHoc, updateData).subscribe(() => {
          this.refreshChapters();
          Swal.fire('Thành công', 'Đã cập nhật bài học.', 'success');
        });
      }
    });
  }

  private refreshChapters() {
    if (this.editId) {
      this.api.getCourseChapters(Number(this.editId)).subscribe(res => {
        this.chapters = res.data || res || [];
        this.cdr.detectChanges();
      });
    }
  }

  onVideoChange(event: any, lessonId: number) {
    const file = event.target.files[0];
    if (file && this.editId) {
      Swal.fire({
        title: 'Đang tải lên...',
        text: 'Đang tải video lên Cloudinary (có thể mất vài phút), vui lòng không đóng trình duyệt...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading() }
      });
      this.api.uploadLessonVideo(lessonId, file).subscribe({
        next: () => {
          Swal.fire('Thành công', 'Đã tải lên video', 'success');
          this.api.getCourseChapters(Number(this.editId)).subscribe(res => {
            this.chapters = res.data || res || [];
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error('Video upload error:', err);
          const msg = err.error?.message || err.message || 'Lỗi không xác định';
          Swal.fire('Lỗi', 'Tải lên video thất bại: ' + msg, 'error');
        }
      });
    }
  }

  onPdfChange(event: any, lessonId: number) {
    const file = event.target.files[0];
    if (file && this.editId) {
      Swal.fire({
        title: 'Đang tải lên...',
        text: 'Đang tải tài liệu PDF, vui lòng đợi...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading() }
      });
      this.api.uploadLessonPdf(lessonId, file).subscribe({
        next: () => {
          Swal.fire('Thành công', 'Đã tải lên tài liệu', 'success');
          this.api.getCourseChapters(Number(this.editId)).subscribe(res => {
            this.chapters = res.data || res || [];
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error('PDF upload error:', err);
          const msg = err.error?.message || err.message || 'Lỗi không xác định';
          Swal.fire('Lỗi', 'Tải lên tài liệu thất bại: ' + msg, 'error');
        }
      });
    }
  }

  loadAnnouncements(id: number) {
    this.api.getInstructorCourseAnnouncements(id).subscribe(res => {
      this.announcements = res || [];
      this.cdr.detectChanges();
    });
  }

  showCreateAnnouncement() {
    Swal.fire({
      title: 'Viết thông báo',
      html: '<input id="t-t" class="swal2-input" placeholder="Tiêu đề"><textarea id="t-c" class="swal2-textarea" placeholder="Nội dung"></textarea>',
      preConfirm: () => {
        const t = (document.getElementById('t-t') as HTMLInputElement).value;
        const c = (document.getElementById('t-c') as HTMLTextAreaElement).value;
        return { tieuDe: t, noiDung: c };
      }
    }).then(res => {
      if (res.isConfirmed && this.editId) {
        this.api.createAnnouncement(Number(this.editId), res.value).subscribe(() => this.loadAnnouncements(Number(this.editId)));
      }
    });
  }

  deleteAnnouncement(id: number) {
    if (confirm('Xóa thông báo này?')) {
      this.api.deleteAnnouncement(id).subscribe(() => this.loadAnnouncements(Number(this.editId!)));
    }
  }

  getStatusLabel() {
    const map: any = { 'Published': 'Đã xuất bản', 'Draft': 'Bản nháp', 'Pending': 'Chờ duyệt', 'Rejected': 'Bị từ chối' };
    return map[this.status] || 'Bản nháp';
  }

  saveCourse() {
    this.isSaving = true;
    const data = {
      tieuDe: this.title, moTa: this.description, giaGoc: this.price,
      maTheLoai: Number(this.selectedCategory), ngonNgu: this.selectedLang,
      capDo: this.selectedLevel, thoiGianHocDuKien: this.thoiGianHocDuKien
    };
    const req = this.editId ? this.api.updateCourse(Number(this.editId), data) : this.api.createCourse(data);
    req.subscribe({
      next: () => {
        this.isSaving = false;
        Swal.fire('Thành công', 'Đã lưu khóa học', 'success');
        this.router.navigate(['/instructor/courses']);
      },
      error: () => { this.isSaving = false; Swal.fire('Lỗi', 'Không thể lưu', 'error'); }
    });
  }

  submitForReview() {
    if (!this.editId) return;
    this.api.submitCourseForReview(Number(this.editId)).subscribe({
      next: () => { Swal.fire('Thành công', 'Đã gửi duyệt', 'success'); this.router.navigate(['/instructor/courses']); },
      error: (err) => Swal.fire('Lỗi', err.error?.message || 'Không thể gửi duyệt', 'error')
    });
  }
}
