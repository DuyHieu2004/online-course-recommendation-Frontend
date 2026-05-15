import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { DataService } from '../../core/services/data.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CourseDetail, Review } from '../../core/models/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  template: `
    <app-header />
    <div class="detail-page" *ngIf="course">
      <div class="container">
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          Trang chủ › {{ course.theLoai?.ten || 'Danh mục' }} › {{ course.tieuDe }}
        </div>

        <!-- Hero -->
        <section class="detail-hero">
          <div class="hero-left">
            <div class="tag-row">
              <span class="badge badge-primary">{{ course.theLoai?.ten || 'Lập trình' }}</span>
              <span class="badge" style="background:var(--gray-200);color:var(--gray-600)">Tất cả cấp độ</span>
            </div>
            <h1>{{ course.tieuDe }}</h1>
            <p class="desc">{{ course.tieuDePhu || course.moTa || 'Khóa học tuyệt vời này giúp bạn nâng cao kỹ năng.' }}</p>
            <div class="meta-row">
              <span><i class="fa-solid fa-star" style="color: #fccc29;"></i> {{ course.tbdanhGia | number:'1.1-1' }} ({{ course.soLuongDanhGia }} đánh giá)</span>
              <span><i class="fa-solid fa-users"></i> {{ course.soHocVien | number }} học viên</span>
              <span><i class="fa-solid fa-box"></i> {{ course.soLuongBaiHoc }} bài học</span>
              <span><i class="fa-solid fa-calendar-days"></i> {{ course.ngayCapNhat ? (course.ngayCapNhat | date:'yyyy') : '2024' }}</span>
            </div>
            <div class="instructor-row" *ngIf="course.giangVien?.length">
              Giảng viên: <strong>{{ course.giangVien![0].ten }}</strong>
            </div>
          </div>
        </section>

        <!-- Content -->
        <div class="detail-body">
          <div class="detail-main">
            <!-- Tabs -->
            <div class="tabs">
              <button class="tab" [class.active]="activeTab === 'overview'" (click)="activeTab = 'overview'">Tổng quan</button>
              <button class="tab" [class.active]="activeTab === 'content'" (click)="activeTab = 'content'">Nội dung</button>
              <button class="tab" [class.active]="activeTab === 'reviews'" (click)="activeTab = 'reviews'">Đánh giá</button>
              <button class="tab" [class.active]="activeTab === 'instructor'" (click)="activeTab = 'instructor'">Giảng viên</button>
            </div>

            <!-- Content: Overview -->
            <div *ngIf="activeTab === 'overview'" class="tab-content">
               <div class="learn-section">
                <h3>Về khóa học này</h3>
                <p style="color: var(--gray-600); line-height: 1.6; margin-bottom: 24px;">
                  {{ course.moTa || 'Chưa có thông tin mô tả chi tiết.' }}
                </p>

                <h3 *ngIf="course.kiNang">Kỹ năng bạn sẽ đạt được</h3>
                <div class="learn-grid" *ngIf="course.kiNang">
                  <div class="learn-item" *ngFor="let skill of course.kiNang.split(',')">
                    <i class="fa-solid fa-circle-check" style="color: var(--success)"></i> {{ skill.trim() }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Content: Curriculum -->
            <div *ngIf="activeTab === 'content'" class="tab-content">
              <h3>Nội dung khóa học</h3>
              <p style="margin-bottom: 16px; color: var(--gray-600)">{{ course.soLuongChuong }} chương • {{ course.soLuongBaiHoc }} bài học</p>
              
              <div class="chapter-list">
                <div class="chapter-item card" *ngFor="let chapter of course.chuongs; let i = index">
                  <div class="chapter-header">
                    <h4>Chương {{ i + 1 }}: {{ chapter.tieuDe }}</h4>
                    <span class="chapter-meta">{{ chapter.baiHocs?.length || 0 }} bài học</span>
                  </div>
                  <div class="chapter-lessons">
                    <div class="lesson-item" *ngFor="let lesson of chapter.baiHocs">
                      <span class="lesson-icon" *ngIf="lesson.linkVideo"><i class="fa-solid fa-play"></i></span>
                      <span class="lesson-icon" *ngIf="!lesson.linkVideo"><i class="fa-solid fa-file-lines"></i></span>
                      <span class="lesson-title">{{ lesson.lyThuyet ? lesson.lyThuyet.substring(0, 50) + '...' : 'Bài học' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content: Reviews -->
            <div *ngIf="activeTab === 'reviews'" class="tab-content review-section">
              <h3><i class="fa-solid fa-comments" style="color: var(--primary)"></i> Đánh giá từ học viên</h3>

              <!-- Rating Summary -->
              <div class="rating-summary card" *ngIf="reviews.length">
                <div class="rating-big">
                  <span class="big-number">{{ course.tbdanhGia | number:'1.1-1' }}</span>
                  <div class="big-stars">
                    <i *ngFor="let s of starsArr" class="fa-solid fa-star" [style.color]="s <= (course.tbdanhGia || 0) ? '#fccc29' : '#e5e7eb'"></i>
                  </div>
                  <span class="rating-count">{{ course.soLuongDanhGia }} đánh giá</span>
                </div>
              </div>

              <!-- Form đánh giá: chỉ hiện khi đã mua và chưa đánh giá -->
              <div class="add-review card" *ngIf="isLoggedIn && isEnrolled && !hasReviewed" [class.locked]="!isCompleted && enrollmentProgress < 100">
                <div class="lock-overlay" *ngIf="!isCompleted && enrollmentProgress < 100">
                  <div class="lock-box">
                    <i class="fa-solid fa-lock"></i>
                    <p>Bạn cần hoàn thành 100% khóa học để thực hiện đánh giá.</p>
                    <div class="progress-mini">
                      <div class="fill" [style.width.%]="enrollmentProgress"></div>
                    </div>
                    <span>Tiến độ hiện tại: {{ enrollmentProgress | number:'1.0-0' }}%</span>
                  </div>
                </div>

                <h4><i class="fa-solid fa-pen-to-square"></i> Viết đánh giá của bạn</h4>
                <div class="star-picker">
                  <label>Điểm đánh giá (Chọn từ 1-5 sao)</label>
                  <div class="stars-input" style="display: flex; gap: 8px; margin-top: 8px;">
                    <span *ngFor="let s of [1,2,3,4,5]" 
                          (click)="reviewRating = s" 
                          style="font-size: 32px; cursor: pointer;"
                          [style.color]="s <= reviewRating ? '#fccc29' : '#e5e7eb'">
                      ★
                    </span>
                    <span style="align-self: center; margin-left: 10px; font-weight: bold; color: var(--gray-600)">{{ reviewRating }} sao</span>
                  </div>
                </div>
                <div class="review-input" style="margin-top: 15px;">
                  <label>Bình luận của bạn</label>
                  <textarea [(ngModel)]="reviewText" rows="3" class="form-control" [placeholder]="'Cảm nghĩ của bạn về khóa học này...'"></textarea>
                </div>
                <div style="margin-top: 15px;">
                  <button class="btn btn-primary" (click)="submitReview()" [disabled]="reviewSubmitting || (!isCompleted && enrollmentProgress < 100)" style="padding: 10px 25px; font-weight: bold;">
                    {{ reviewSubmitting ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ' }}
                  </button>
                </div>
              </div>

              <!-- Đã đánh giá -->
              <div *ngIf="isLoggedIn && isEnrolled && hasReviewed" class="already-reviewed">
                <i class="fa-solid fa-circle-check"></i> Bạn đã đánh giá khóa học này rồi. Cảm ơn bạn!
              </div>

              <!-- Chưa mua -->
              <div *ngIf="isLoggedIn && !isEnrolled" class="need-purchase">
                <div class="purchase-msg">
                   <i class="fa-solid fa-cart-arrow-down"></i>
                   <span>Mua khóa học này để có thể đánh giá nội dung.</span>
                </div>
              </div>

              <!-- Chưa đăng nhập -->
              <div *ngIf="!isLoggedIn" class="need-login">
                <i class="fa-solid fa-right-to-bracket"></i> <a routerLink="/login">Đăng nhập</a> để đánh giá khóa học này.
              </div>

              <!-- Danh sách đánh giá -->
              <div *ngIf="!reviews.length" class="no-reviews">
                <i class="fa-solid fa-message" style="font-size: 24px; color: var(--gray-400); margin-bottom: 8px"></i>
                <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
              </div>
              <div class="review-card card" *ngFor="let review of reviews; let i = index" [class.my-review]="i === 0 && hasReviewed && review.nguoiDanhGia?.maNguoiDung === authService.currentUser()?.userId">
                <div class="review-header">
                  <div class="avatar" [style.background]="getAvatarColor(review.nguoiDanhGia?.ten)">
                    {{ getInitials(review.nguoiDanhGia?.ten) }}
                  </div>
                  <div class="review-meta">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                       <strong>{{ review.nguoiDanhGia?.ten || 'Học viên ẩn danh' }}</strong>
                       <span class="badge badge-success" *ngIf="i === 0 && hasReviewed && review.nguoiDanhGia?.maNguoiDung === authService.currentUser()?.userId" style="font-size: 10px;">Đánh giá của tôi</span>
                    </div>
                    <div class="review-stars">
                      <i *ngFor="let s of [1,2,3,4,5]" class="fa-solid fa-star" [style.color]="s <= (review.rating || 0) ? '#fccc29' : '#e5e7eb'" style="font-size: 12px"></i>
                      <span class="review-date">{{ review.ngayDanhGia | date:'dd/MM/yyyy' }}</span>
                    </div>
                  </div>
                </div>
                <p class="review-text">{{ review.binhLuan || 'Người dùng không để lại bình luận.' }}</p>
              </div>
            </div>

            <!-- Content: Instructor -->
            <div *ngIf="activeTab === 'instructor'" class="tab-content">
               <h3 style="margin-bottom: 24px;"><i class="fa-solid fa-chalkboard-user" style="color: var(--primary); margin-right: 8px;"></i> Đội ngũ Giảng viên</h3>
               
               <!-- Fallback when no instructor is assigned -->
               <div *ngIf="!course.giangVien || course.giangVien.length === 0" style="padding: 40px 20px; text-align: center; border: 1px dashed var(--gray-300); border-radius: var(--radius-md); background: var(--gray-50);">
                 <i class="fa-solid fa-user-graduate" style="font-size: 48px; color: var(--gray-400); margin-bottom: 16px; display: block;"></i>
                 <h4 style="color: var(--gray-600); margin-bottom: 8px;">Thông tin đang cập nhật</h4>
                 <p style="color: var(--gray-500); font-size: 14px;">Giảng viên cho khóa học này sẽ được bổ sung trong thời gian sớm nhất.</p>
               </div>

               <!-- Instructor list -->
               <div class="instructor-card card" *ngFor="let ins of course.giangVien" style="margin-bottom: 20px; padding: 24px;">
                 <div class="ins-header" style="display: flex; gap: 20px; align-items: flex-start;">
                   <div class="ins-avatar" style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; background: var(--gray-100); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                     <img *ngIf="ins.linkAnhDaiDien" [src]="ins.linkAnhDaiDien" alt="{{ins.ten}}" style="width: 100%; height: 100%; object-fit: cover;">
                     <span *ngIf="!ins.linkAnhDaiDien" style="font-size: 32px; color: var(--gray-500); font-weight: bold;">{{ getInitials(ins.ten) }}</span>
                   </div>
                   <div class="ins-info" style="flex: 1;">
                     <h4 style="margin: 0 0 4px 0; font-size: 20px; color: var(--text-dark);">{{ ins.ten || 'Giảng viên' }}</h4>
                     <p style="color: var(--primary); font-size: 14px; font-weight: 500; margin: 0 0 12px 0;">
                       <i class="fa-solid fa-star" style="color: #fccc29; margin-right: 4px;"></i> Giảng viên
                     </p>
                     <p *ngIf="ins.tieuSu" style="color: var(--gray-600); font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-line;">{{ ins.tieuSu }}</p>
                     <p *ngIf="!ins.tieuSu" style="color: var(--gray-500); font-size: 14px; margin: 0; font-style: italic;">Chưa có thông tin tiểu sử.</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="detail-sidebar">
            <div class="price-card card">
              <div class="price-image">
                <img *ngIf="course.anhUrl && course.anhUrl.startsWith('http')" [src]="course.anhUrl" alt="Course" style="width: 100%; height: 100%; object-fit: cover;" (error)="course.anhUrl = ''">
                <div *ngIf="!course.anhUrl || !course.anhUrl.startsWith('http')" style="font-size: 64px; display:flex; justify-content:center; align-items:center; height:100%"><i class="fa-solid fa-book"></i></div>
              </div>
              <div class="price-info">
                <span class="price-main">{{ getDiscountedPrice(course) | number }}đ</span>
                <span class="price-original" *ngIf="course.khuyenMai">{{ course.giaGoc | number }}đ</span>
                
                <ng-container *ngIf="isEnrolled">
                  <div class="completed-badge" *ngIf="isCompleted" style="text-align: center; padding: 12px; margin-bottom: 12px; background: rgba(34, 197, 94, 0.1); color: var(--success); border-radius: 8px; font-weight: 700; border: 1px solid rgba(34, 197, 94, 0.2);">
                    <i class="fa-solid fa-trophy" style="margin-right: 8px;"></i> Đã hoàn thành 100%
                  </div>
                  <a [routerLink]="['/learn', courseId, 'lesson', 1]" class="btn btn-success btn-lg" style="width:100%; text-align:center; text-decoration:none;">
                    <i class="fa-solid fa-play"></i> Vào học ngay
                  </a>
                  <div class="enrolled-badge">
                    <i class="fa-solid fa-circle-check"></i> Bạn đã sở hữu khóa học này
                  </div>
                </ng-container>

                <ng-container *ngIf="!isEnrolled">
                  <!-- Case: Expired -->
                  <div *ngIf="isExpired" style="margin-bottom: 12px;">
                    <button class="btn btn-danger btn-lg" style="width:100%; background: #ef4444; border-color: #ef4444;" (click)="addToCart()" [disabled]="cartLoading">
                       <i class="fa-solid fa-rotate-left"></i> Mua lại để tiếp tục học
                    </button>
                    <div class="expired-badge" style="text-align: center; padding: 8px; margin-top: 8px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-radius: 4px; font-size: 12px; font-weight: 600;">
                      <i class="fa-solid fa-triangle-exclamation"></i> Khóa học của bạn đã hết hạn
                    </div>
                  </div>

                  <!-- Case: Not enrolled yet -->
                  <button *ngIf="!isExpired" class="btn btn-primary btn-lg" style="width:100%" (click)="addToCart()" [disabled]="cartLoading">
                    <ng-container *ngIf="!cartLoading"><i class="fa-solid fa-cart-shopping"></i> Thêm vào giỏ hàng</ng-container>
                    <ng-container *ngIf="cartLoading"><i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...</ng-container>
                  </button>
                </ng-container>
                <button class="btn btn-outline" style="width:100%;margin-top:8px" (click)="toggleLike()" [ngClass]="{'liked': isLiked}">
                  <span *ngIf="!isLiked"><i class="fa-regular fa-heart"></i> Thêm vào yêu thích</span>
                  <span *ngIf="isLiked" style="color: #e53e3e;"><i class="fa-solid fa-heart"></i> Đã yêu thích</span>
                </button>
                <p class="refund"><i class="fa-solid fa-lock"></i> Hoàn tiền 30 ngày</p>
                <ul class="features">
                  <li><i class="fa-solid fa-check" style="color: var(--success)"></i> Truy cập mọi lúc mọi nơi</li>
                  <li><i class="fa-solid fa-check" style="color: var(--success)"></i> Học trên nhiều thiết bị</li>
                  <li><i class="fa-solid fa-check" style="color: var(--success)"></i> Chứng chỉ hoàn thành</li>
                  <li><i class="fa-solid fa-check" style="color: var(--success)"></i> Tài liệu tải về</li>
                </ul>
              </div>
            </div>

            <div class="related-section" *ngIf="similarCourses.length">
              <h4>Gợi ý cho bạn</h4>
              <div class="related-item card" *ngFor="let c of similarCourses" style="cursor: pointer" (click)="goToCourse(c.courseId)">
                <div class="related-icon" style="font-size: 18px"><i class="fa-solid fa-bullseye"></i></div>
                <div class="related-info">
                  <strong>{{ c.title }}</strong>
                  <span class="price-sm">{{ c.score | number:'1.2-2' }} điểm phù hợp</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
    <div *ngIf="!course && !loading" style="padding: 100px; text-align: center; color: var(--gray-500);">
      <h2>Không tìm thấy khóa học</h2>
      <a routerLink="/course" style="color: var(--primary); margin-top: 16px; display: inline-block;">Quay lại danh sách</a>
    </div>
    <div *ngIf="loading" style="padding: 100px; text-align: center;">
      <h2>Đang tải thông tin...</h2>
    </div>
  `,
  styles: [`
    .detail-page { background: var(--gray-50); min-height: calc(100vh - 72px); }
    .breadcrumb {
      padding: 16px 0;
      font-size: 13px;
      color: var(--gray-500);
    }
    .detail-hero {
      background: linear-gradient(135deg, var(--primary), #3D4399);
      color: var(--white);
      padding: 32px;
      border-radius: var(--radius-lg);
      margin-bottom: 24px;
    }
    .tag-row {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .detail-hero h1 {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .desc {
      opacity: 0.85;
      font-size: 15px;
      margin-bottom: 16px;
    }
    .meta-row {
      display: flex;
      gap: 20px;
      font-size: 13px;
      opacity: 0.9;
      margin-bottom: 12px;
    }
    .instructor-row {
      font-size: 14px;
    }
    .detail-body {
      display: flex;
      gap: 24px;
      padding-bottom: 60px;
    }
    .detail-main { flex: 1; }
    .tabs {
      display: flex;
      border-bottom: 2px solid var(--gray-200);
      margin-bottom: 24px;
    }
    .tab {
      padding: 12px 20px;
      background: none;
      font-size: 14px;
      font-weight: 600;
      color: var(--gray-500);
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: var(--transition);
      cursor: pointer;
    }
    .tab.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }
    .tab-content {
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .learn-section, .review-section {
      margin-bottom: 28px;
    }
    .learn-section h3, .review-section h3 {
      font-size: 18px;
      margin-bottom: 16px;
    }
    .learn-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .learn-item {
      font-size: 14px;
      color: var(--gray-600);
      background: var(--white);
      padding: 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--gray-200);
    }
    .chapter-item {
      margin-bottom: 16px;
      border-radius: var(--radius-sm);
      overflow: hidden;
    }
    .chapter-header {
      padding: 16px;
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .chapter-header h4 { font-size: 15px; margin: 0; }
    .chapter-meta { font-size: 13px; color: var(--gray-500); }
    .chapter-lessons {
      padding: 12px 16px;
    }
    .lesson-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      font-size: 14px;
      color: var(--gray-700);
      border-bottom: 1px solid var(--gray-100);
    }
    .lesson-item:last-child {
      border-bottom: none;
    }
    .lesson-icon { color: var(--gray-400); font-size: 12px; }
    .review-card {
      padding: 16px;
      margin-bottom: 16px;
    }
    .review-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }
    .avatar {
      width: 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; color: white; font-size: 14px;
    }
    .rating-summary {
      padding: 20px;
      margin-bottom: 20px;
      text-align: center;
      background: linear-gradient(135deg, rgba(91,99,211,0.05), rgba(91,99,211,0.1));
      border: 1px solid rgba(91,99,211,0.15);
    }
    .big-number { font-size: 48px; font-weight: 800; color: var(--primary); display: block; }
    .big-stars { font-size: 20px; margin: 4px 0; }
    .big-stars i { margin: 0 2px; }
    .rating-count { font-size: 13px; color: var(--gray-500); }
    .add-review {
      padding: 24px;
      margin-bottom: 20px;
      background: var(--gray-50);
      border: 1px dashed var(--gray-300);
      position: relative;
    }
    .add-review.locked {
      filter: grayscale(1);
      pointer-events: none;
    }
    .lock-overlay {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(255,255,255,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      pointer-events: all;
      border-radius: var(--radius-md);
    }
    .lock-box {
      background: white;
      padding: 20px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      text-align: center;
      max-width: 300px;
    }
    .lock-box i { font-size: 32px; color: var(--gray-400); margin-bottom: 12px; }
    .lock-box p { font-size: 14px; font-weight: 600; color: var(--gray-700); margin-bottom: 12px; }
    .lock-box span { font-size: 12px; color: var(--gray-500); }
    .progress-mini {
      height: 6px; background: var(--gray-200); border-radius: 3px; margin-bottom: 6px; overflow: hidden;
    }
    .progress-mini .fill { height: 100%; background: var(--primary); }

    .add-review h4 { margin: 0 0 16px; font-size: 15px; }
    .add-review h4 i { margin-right: 6px; color: var(--primary); }
    .star-picker { margin-bottom: 16px; }
    .star-picker label, .review-input label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; }
    .stars-input { display: flex; align-items: center; gap: 4px; }
    .star-pick { font-size: 24px; color: #e5e7eb; cursor: pointer; transition: all 0.15s; }
    .star-pick.active { color: #fccc29; }
    .star-pick:hover { transform: scale(1.2); }
    .star-label { margin-left: 8px; font-size: 13px; color: var(--gray-500); font-weight: 600; }
    .review-input { margin-bottom: 16px; }
    .review-input textarea {
      width: 100%; padding: 12px; border: 1px solid var(--gray-300);
      border-radius: var(--radius-sm); font-size: 14px; resize: vertical;
    }
    .review-input textarea:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 3px rgba(91,99,211,0.1); }
    
    .review-card.my-review {
      border: 2px solid rgba(16, 185, 129, 0.3);
      background: rgba(16, 185, 129, 0.02);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
    }

    .already-reviewed, .need-purchase, .need-login, .no-reviews {
      padding: 24px 20px;
      border-radius: var(--radius-md);
      font-size: 14px;
      margin-bottom: 24px;
      text-align: center;
    }
    .already-reviewed { background: rgba(16,185,129,0.1); color: #059669; font-weight: 600; }
    .already-reviewed i { margin-right: 8px; font-size: 18px; }
    
    .need-purchase { 
      background: var(--gray-100); 
      border: 1px solid var(--gray-200);
      color: var(--gray-600); 
    }
    .purchase-msg { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .purchase-msg i { font-size: 24px; color: var(--primary); }
    .need-login { background: rgba(91,99,211,0.08); color: var(--primary); }
    .need-login i { margin-right: 4px; }
    .need-login a { color: var(--primary); font-weight: 700; text-decoration: underline; }
    .no-reviews { color: var(--gray-500); padding: 32px 20px; }
    .review-card { padding: 16px; margin-bottom: 12px; }
    .review-meta { flex: 1; }
    .review-stars { display: flex; align-items: center; gap: 2px; margin-top: 2px; }
    .review-date { font-size: 11px; margin-left: 6px; color: var(--gray-400); }
    .review-text { font-size: 14px; color: var(--gray-600); line-height: 1.5; margin: 8px 0 0; }
    .instructor-card {
      padding: 24px;
    }
    .ins-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .ins-avatar {
      width: 64px; height: 64px; border-radius: 50%;
      background: var(--gray-200);
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .ins-avatar img {
      width: 100%; height: 100%; object-fit: cover;
    }
    .detail-sidebar {
      width: 340px;
      flex-shrink: 0;
    }
    .price-card {
      position: sticky;
      top: 72px;
      overflow: hidden;
    }
    .price-image {
      height: 160px;
      background: var(--primary-bg);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .price-info {
      padding: 20px;
    }
    .price-main {
      font-size: 28px;
      font-weight: 800;
      color: var(--primary);
      display: block;
    }
    .price-original {
      text-decoration: line-through;
      color: var(--gray-400);
      font-size: 14px;
      display: block;
      margin-bottom: 16px;
    }
    .refund {
      text-align: center;
      font-size: 12px;
      color: var(--gray-500);
      margin: 12px 0;
    }
    .features {
      list-style: none;
    }
    .features li {
      font-size: 13px;
      padding: 4px 0;
      color: var(--gray-600);
    }
    .features li i {
      margin-right: 6px;
    }
    .enrolled-badge {
      text-align: center;
      padding: 12px;
      margin-top: 8px;
      background: rgba(16, 185, 129, 0.1);
      color: #10B981;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 600;
    }
    .enrolled-badge i {
      margin-right: 4px;
    }
    .btn-success {
      background: linear-gradient(135deg, #10B981, #059669);
      color: white;
      border: none;
      display: inline-block;
    }
    .btn-success:hover {
      background: linear-gradient(135deg, #059669, #047857);
    }
    .related-section {
      margin-top: 24px;
    }
    .related-section h4 {
      font-size: 16px;
      margin-bottom: 12px;
    }
    .related-item {
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      transition: transform 0.2s;
    }
    .related-item:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
    .related-icon {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-bg);
      border-radius: var(--radius-sm);
    }
    .related-info {
      flex: 1;
    }
    .related-info strong {
      display: block;
      font-size: 13px;
    }
    .price-sm {
      color: var(--success);
      font-size: 12px;
    }
  `]
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private dataService = inject(DataService);
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  courseId!: number;
  course: CourseDetail | null = null;
  loading = true;
  activeTab: 'overview' | 'content' | 'reviews' | 'instructor' = 'overview';

  reviews: Review[] = [];
  similarCourses: any[] = [];
  cartLoading = false;
  isLiked = false;
  isEnrolled = false;
  isExpired = false;
  enrollmentProgress = 0;
  isCompleted = false;
  hasReviewed = false;
  myReview: Review | null = null;
  starsArr = [1, 2, 3, 4, 5];
  reviewSubmitting = false;
  reviewText = '';
  reviewRating = 5;

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.courseId = +id;
        this.loadCourseData();
        this.loadReviews();
        this.loadSimilarCourses();
        this.checkLikeStatus();
        this.checkEnrolledStatus();
      }
    });
  }

  checkLikeStatus() {
    if (this.authService.isLoggedIn()) {
      this.apiService.getLikedCourses().subscribe({
        next: (likes: any[]) => {
          this.isLiked = likes.some((l: any) => l.maKhoaHoc === this.courseId || l.MaKhoaHoc === this.courseId);
        }
      });
    }
  }

  loadCourseData() {
    this.loading = true;
    console.log('[CourseDetail] Loading course data for id:', this.courseId);
    this.apiService.getCourseById(this.courseId).subscribe({
      next: (res) => {
        console.log('[CourseDetail] API response received:', res);

        // Bóc tách object (Thử các trường hợp bọc dữ liệu của API)
        let data = res?.course || res?.data || res;

        // Cập nhật trạng thái người dùng
        this.isEnrolled = res?.isEnrolled ?? false;
        this.isExpired = res?.isExpired ?? false;
        this.isCompleted = res?.isCompleted ?? false;
        this.myReview = res?.userReview ?? null;
        if (this.myReview) this.hasReviewed = true;

        if (data && typeof data === 'object') {
          // Chuẩn hóa dữ liệu: Đảm bảo có cả camelCase và PascalCase cho Template
          this.course = {
            ...data,
            maKhoaHoc: data.maKhoaHoc || data.MaKhoaHoc,
            tieuDe: data.tieuDe || data.TieuDe || 'Khóa học',
            moTa: data.moTa || data.MoTa || 'Chưa có thông tin mô tả chi tiết.',
            giaGoc: data.giaGoc || data.GiaGoc || 0,
            anhUrl: data.anhUrl || data.AnhUrl || '',
            tbdanhGia: data.tbdanhGia || data.TbdanhGia || 0,
            soLuongDanhGia: data.soLuongDanhGia || data.SoLuongDanhGia || 0,
            soHocVien: data.soHocVien || data.SoHocVien || 0,
            soLuongBaiHoc: data.soLuongBaiHoc || data.SoLuongBaiHoc || 0,
            soLuongChuong: data.soLuongChuong || data.SoLuongChuong || 0,
            theLoai: data.theLoai || data.TheLoai || null,
            giangVien: data.giangVien || data.GiangVien || [],
            // Chuẩn hóa Chương và Bài học bên trong
            chuongs: (data.chuongs || data.Chuongs || []).map((ch: any) => ({
              ...ch,
              maChuong: ch.maChuong || ch.MaChuong,
              tieuDe: ch.tieuDe || ch.TieuDe,
              baiHocs: ch.baiHocs || ch.BaiHocs || []
            }))
          } as CourseDetail;
        } else {
          this.course = null;
        }

        this.loading = false;
        // Nếu đã học rồi thì lấy lại tiến độ chính xác
        if (this.isEnrolled) {
          this.checkEnrolledStatus();
        }
        this.cdr.detectChanges();
        console.log('[CourseDetail] course set, loading =', this.loading);
      },
      error: (err) => {
        console.error('[CourseDetail] API error:', err);
        this.course = null;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadReviews() {
    this.apiService.getCourseReviews(this.courseId).subscribe({
      next: (res: any) => {
        let allReviews = res?.data || res || [];

        if (this.authService.isLoggedIn()) {
          const currentUserId = this.authService.currentUser()?.userId;
          // Tìm đánh giá của tôi
          const myReviewIdx = allReviews.findIndex((r: any) => r.nguoiDanhGia?.maNguoiDung === currentUserId);

          if (myReviewIdx !== -1) {
            const myReview = allReviews.splice(myReviewIdx, 1)[0];
            this.reviews = [myReview, ...allReviews];
            this.hasReviewed = true;
          } else {
            this.reviews = allReviews;
            this.hasReviewed = false;
          }
        } else {
          this.reviews = allReviews;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.reviews = [];
        this.cdr.detectChanges();
      }
    });
  }

  checkIfUserReviewed() {
    if (this.authService.isLoggedIn() && this.reviews && Array.isArray(this.reviews)) {
      const currentUserId = this.authService.currentUser()?.userId;
      // Match by exact user ID instead of name
      this.hasReviewed = this.reviews.some((r: any) => r.nguoiDanhGia?.maNguoiDung === currentUserId);
    }
  }

  loadSimilarCourses() {
    this.apiService.getSimilarCourses(this.courseId).subscribe({
      next: (res) => {
        this.similarCourses = res || [];
      },
      error: () => {
        this.similarCourses = [];
      }
    });
  }

  checkEnrolledStatus() {
    if (this.authService.isLoggedIn()) {
      this.apiService.getMyCourses(1, 100).subscribe({
        next: (res: any) => {
          const data = Array.isArray(res) ? res : (res.data || []);
          const enrollment = data.find((t: any) => t.khoaHoc?.maKhoaHoc === this.courseId);
          this.isEnrolled = !!enrollment;
          this.enrollmentProgress = enrollment?.phanTramTienDo ?? 0;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cdr.detectChanges();
        }
      });
    }
  }

  goToCourse(id: number) {
    this.router.navigate(['/course', id]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addToCart() {
    if (!this.authService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Yêu cầu đăng nhập',
        text: 'Vui lòng đăng nhập để thêm vào giỏ hàng.',
        confirmButtonColor: '#5a67d8',
        confirmButtonText: 'Đến trang đăng nhập'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    this.cartLoading = true;
    this.dataService.addToCart(this.courseId).subscribe({
      next: () => {
        this.cartLoading = false;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Đã thêm vào giỏ hàng!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        this.dataService.loadCart();
      },
      error: (err) => {
        this.cartLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: err.error?.message || 'Có lỗi xảy ra.',
          confirmButtonColor: '#5a67d8'
        });
      }
    });
  }

  toggleLike() {
    if (!this.authService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Yêu cầu đăng nhập',
        text: 'Vui lòng đăng nhập để lưu khóa học yêu thích.',
        confirmButtonColor: '#5a67d8',
      }).then((result) => {
        if (result.isConfirmed) this.router.navigate(['/login']);
      });
      return;
    }
    this.apiService.toggleLike(this.courseId).subscribe({
      next: (res) => {
        this.isLiked = res.liked;
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.message, showConfirmButton: false, timer: 2000 });
      },
      error: () => Swal.fire('Lỗi', 'Không thể thao tác yêu thích', 'error')
    });
  }

  submitReview() {
    if (!this.reviewText.trim()) {
      Swal.fire('Lỗi', 'Vui lòng nhập nội dung đánh giá', 'warning');
      return;
    }
    this.reviewSubmitting = true;
    this.apiService.rateCourse(this.courseId, this.reviewRating, this.reviewText).subscribe({
      next: (res) => {
        this.reviewSubmitting = false;
        Swal.fire('Thành công', res.message, 'success');
        this.reviewText = '';
        this.reviewRating = 5;
        this.hasReviewed = true;
        this.loadReviews();
        this.loadCourseData(); // Reload course score
      },
      error: (err) => {
        this.reviewSubmitting = false;
        Swal.fire('Lỗi', err.error?.message || 'Không thể gửi đánh giá', 'error');
      }
    });
  }

  getAvatarColor(name?: string): string {
    if (!name) return '#94a3b8';
    const colors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getDiscountedPrice(course: CourseDetail): number {
    if (!course.khuyenMai || !course.khuyenMai.phanTramGiam) return course.giaGoc || 0;
    return Math.round((course.giaGoc || 0) * (1 - course.khuyenMai.phanTramGiam / 100));
  }

  getInitials(name?: string): string {
    if (!name) return 'HV';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  getStars(rating?: number): string {
    if (!rating) return '★★★★★';
    const num = Math.round(rating);
    return '★'.repeat(num) + '☆'.repeat(5 - num);
  }
}
