import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="learn-layout" *ngIf="courseData">
      <!-- Sidebar Curriculum -->
      <aside class="learn-sidebar">
        <div class="sidebar-header">
          <a routerLink="/dashboard" class="back-link"><i class="fa-solid fa-arrow-left"></i> Quay lại</a>
          <h3>{{ courseData.tieuDe }}</h3>
          <div class="progress-info">
            Tiến độ: <strong>{{ courseData.phanTramTienDo | number:'1.0-0' }}%</strong>
            <div class="progress-bar"><div class="fill" [style.width.%]="courseData.phanTramTienDo"></div></div>
          </div>
        </div>

        <div *ngFor="let ch of courseData.chuongs; let ci = index" class="chapter">
          <div class="chapter-header">
            <span>Ch.{{ ci + 1 }}: {{ ch.tieuDe }}</span>
            <span class="ch-toggle"><i class="fa-solid fa-clipboard-list"></i></span>
          </div>
          <div *ngFor="let lesson of ch.baiHocs"
               class="lesson-item"
               [class.completed]="lesson.daHoanThanh"
               [class.current]="lesson.maBaiHoc === currentLessonId"
               [class.locked]="isLessonLocked(lesson)"
               (click)="selectLesson(lesson, courseData.maKhoaHoc)">

            <span class="lesson-icon">
              <!-- ========================================== -->
              <!-- Hiện Icon Ổ Khóa nếu bài học bị khóa -->
              <!-- ========================================== -->
              <i *ngIf="!lesson.daHoanThanh && isLessonLocked(lesson)" class="fa-solid fa-lock" style="color: var(--danger)"></i>
              <i *ngIf="lesson.daHoanThanh" class="fa-solid fa-circle-check" style="color: #10B981"></i>
              <i *ngIf="!lesson.daHoanThanh && !isLessonLocked(lesson) && lesson.maBaiHoc === currentLessonId" class="fa-solid fa-circle-play" style="color: var(--primary-light)"></i>
              <i *ngIf="!lesson.daHoanThanh && !isLessonLocked(lesson) && lesson.maBaiHoc !== currentLessonId" class="fa-regular fa-circle" style="color: var(--gray-500)"></i>
            </span>
            <span class="lesson-name">{{ getLessonTitle(lesson) }}</span>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="learn-main">
        <!-- Top Bar -->
        <div class="learn-topbar">
          <span>EduLearn | {{ courseData.tieuDe }}</span>
          <div class="topbar-right">
            <button class="topbar-btn" (click)="openRating()">
              <i class="fa-solid fa-star" style="color: #fccc29"></i> Đánh giá
            </button>
            <span class="topbar-sep">|</span>
            <button class="topbar-btn" (click)="showProgressDetail()">
              <i class="fa-solid fa-chart-pie"></i> Tiến độ {{ courseData.phanTramTienDo | number:'1.0-0' }}%
            </button>
            <span class="topbar-sep">|</span>
            <button class="topbar-btn" (click)="shareLink()">
              <i class="fa-solid fa-share-nodes"></i> Chia sẻ
            </button>
            <span class="topbar-sep">|</span>
            <a class="topbar-btn" [routerLink]="['/dashboard']">
              <i class="fa-solid fa-gear"></i>
            </a>
          </div>
        </div>

        <!-- Video Player / Content Area -->
        <div class="video-player">
          <div class="video-placeholder" *ngIf="!currentLesson?.linkVideo">

            <!-- ========================================== -->
            <!-- 🟢 THÊM MỚI: HIỂN THỊ TRẮC NGHIỆM VÀ SỬA UI THÀNH DẠNG CARD CHỌN DỄ DÀNG -->
            <!-- ========================================== -->
            <div *ngIf="parsedQuiz" class="quiz-container" style="width: 100%; max-width: 800px; padding: 40px; background: white; color: var(--gray-800); border-radius: 8px; margin: 20px; overflow-y: auto; text-align: left; max-height: calc(100vh - 120px); box-sizing: border-box;">
              <h2 style="font-size: 24px; margin-bottom: 10px; color: var(--text-dark);"><i class="fa-solid fa-clipboard-question"></i> Bài Trắc Nghiệm Đánh Giá</h2>
              <p style="margin-bottom: 24px; color: var(--danger); font-weight: bold; font-size: 15px;">Điểm yêu cầu để qua môn: {{ parsedQuiz.passingScore }}%</p>

              <div *ngFor="let q of parsedQuiz.questions; let i = index" style="margin-bottom: 24px; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid var(--primary); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <p style="font-weight: 600; margin-bottom: 16px; font-size: 16px;">Câu {{ i + 1 }}: {{ q.text }}</p>

                <div *ngFor="let opt of q.options; let optIdx = index" style="margin-bottom: 10px;">
                  <!-- UI Nút chọn dạng Thẻ Card, đổi màu khi Click -->
                  <label style="cursor: pointer; display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--gray-200); transition: all 0.2s;"
                         [style.background]="(currentLesson.daHoanThanh && q.correctIdx == optIdx) ? 'rgba(16, 185, 129, 0.1)' : (quizAnswers[i] == optIdx ? 'rgba(91, 99, 211, 0.1)' : 'white')"
                         [style.border-color]="(currentLesson.daHoanThanh && q.correctIdx == optIdx) ? 'var(--success)' : (quizAnswers[i] == optIdx ? 'var(--primary)' : 'var(--gray-200)')">

                    <input type="radio" [name]="'quiz_q_'+i" [value]="optIdx" [(ngModel)]="quizAnswers[i]" [disabled]="currentLesson.daHoanThanh" style="transform: scale(1.3);">
                    <span style="font-size: 15px; flex: 1;">{{ opt }}</span>

                    <!-- Hiển thị đáp án đúng nếu đã qua bài để học sinh xem lại -->
                    <span *ngIf="currentLesson.daHoanThanh && q.correctIdx == optIdx" style="color: var(--success); font-weight: bold; font-size: 13px;">
                      <i class="fa-solid fa-check-circle"></i> Đáp án đúng
                    </span>
                  </label>
                </div>
              </div>

              <div *ngIf="!currentLesson.daHoanThanh" style="margin-top: 30px;">
                <button class="btn btn-primary" style="padding: 12px 30px; font-size: 16px; width: 100%; box-shadow: 0 4px 12px rgba(91,99,211,0.3);" (click)="submitQuiz()">Nộp Bài & Chấm Điểm</button>
              </div>

              <!-- Khu vực báo kết quả -->
              <div *ngIf="quizSubmitted || currentLesson.daHoanThanh" style="margin-top: 30px; padding: 20px; border-radius: 8px;" [ngStyle]="{'background': quizScore >= parsedQuiz.passingScore || currentLesson.daHoanThanh ? '#d1fae5' : '#fee2e2'}">
                <h4 [ngStyle]="{'color': quizScore >= parsedQuiz.passingScore || currentLesson.daHoanThanh ? '#065f46' : '#991b1b'}">
                  <i class="fa-solid fa-chart-bar"></i> Kết quả: {{ currentLesson.daHoanThanh ? 'Đã vượt qua (Bạn có thể đi tiếp bài sau)' : quizScore + '%' }}
                </h4>
                <p *ngIf="!currentLesson.daHoanThanh && quizScore < parsedQuiz.passingScore" style="color: #991b1b; margin-top: 8px;">
                  Chưa đạt đủ điểm yêu cầu. Hãy chọn lại đáp án và nộp lại bài nhé!
                </p>
              </div>
            </div>
            <!-- ================== KẾT THÚC THÊM MỚI ================== -->


            <div class="no-video-msg" *ngIf="!parsedQuiz && !currentLesson?.lyThuyet && !currentLesson?.baiTap">
              <i class="fa-solid fa-file-lines" style="font-size: 48px; margin-bottom: 16px; color: var(--gray-500)"></i>
              <p>Bài học này không có video</p>
            </div>

            <!-- Nội dung lý thuyết (Ẩn đi nếu là bài Trắc nghiệm) -->
            <div class="reading-content" *ngIf="!parsedQuiz && (currentLesson?.lyThuyet || currentLesson?.baiTap)" style="width: 100%; max-width: 800px; padding: 40px; background: white; color: var(--gray-800); border-radius: 8px; margin: 20px; overflow-y: auto; text-align: left; max-height: calc(100vh - 120px); box-sizing: border-box;">
              <h2 style="font-size: 24px; margin-bottom: 20px; color: var(--text-dark);">{{ getLessonTitle(currentLesson) }}</h2>

              <div *ngIf="currentLesson?.lyThuyet" style="margin-bottom: 30px;">
                <h4 style="font-size: 16px; color: var(--primary); margin-bottom: 12px;"><i class="fa-solid fa-book"></i> Lý thuyết</h4>
                <div [innerHTML]="formatContent(currentLesson.lyThuyet)" style="line-height: 1.8; font-size: 15px;"></div>
              </div>

              <div *ngIf="currentLesson?.baiTap" style="padding: 20px; background: rgba(91,99,211,0.05); border-left: 4px solid var(--primary); border-radius: 4px; margin-bottom: 30px;">
                <h4 style="font-size: 16px; color: var(--primary); margin-bottom: 12px;"><i class="fa-solid fa-pen-to-square"></i> Bài tập</h4>
                <div [innerHTML]="formatContent(currentLesson.baiTap)" style="line-height: 1.8; font-size: 15px;"></div>
              </div>

              <div *ngIf="currentLesson?.linkTaiLieu" style="padding: 20px; background: rgba(16,185,129,0.05); border-left: 4px solid var(--success); border-radius: 4px;">
                <h4 style="font-size: 16px; color: var(--success); margin-bottom: 12px;"><i class="fa-solid fa-file-arrow-down"></i> Tài liệu đính kèm</h4>
                <a [href]="getDocumentUrl(currentLesson.linkTaiLieu)" target="_blank" class="btn btn-success btn-sm" style="text-decoration: none;">
                   <i class="fa-solid fa-download"></i> Tải xuống tài liệu
                </a>
              </div>
            </div>
          </div>
          <div class="video-container" *ngIf="currentLesson?.linkVideo">
            <video controls [src]="getVideoUrl(currentLesson!.linkVideo)" style="width:100%;height:100%;background:#000"></video>
          </div>
          <div class="video-info" *ngIf="currentLesson">
            <span>{{ getCurrentChapterTitle() }} <i class="fa-solid fa-chevron-right" style="font-size:10px"></i> {{ getLessonTitle(currentLesson) }}</span>
          </div>
        </div>
      </main>

      <!-- Right Panel -->
      <aside class="learn-panel">
        <div class="panel-tabs">
          <button class="p-tab" [class.active]="panelTab === 'overview'" (click)="panelTab = 'overview'">Tổng quan</button>
          <button class="p-tab" [class.active]="panelTab === 'notes'" (click)="panelTab = 'notes'">Ghi chú</button>
        </div>

        <div class="panel-content" *ngIf="panelTab === 'overview' && currentLesson">
          <h3>{{ getLessonTitle(currentLesson) }}</h3>

          <!-- ========================================== -->
          <!-- Báo Chú Ý nếu đang xem bài Trắc Nghiệm -->
          <!-- ========================================== -->
          <div *ngIf="parsedQuiz" style="margin-bottom: 16px; padding: 12px; background: #fffbeb; border-left: 3px solid #f59e0b; font-size: 13px; color: #b45309; border-radius: 4px;">
            <i class="fa-solid fa-circle-info"></i> Bạn cần hoàn thành bài trắc nghiệm ở màn hình chính để mở khóa bài học tiếp theo!
          </div>

          <ng-container *ngIf="!parsedQuiz">
            <!-- Lý thuyết -->
            <div class="theory-content" *ngIf="currentLesson.lyThuyet">
              <div [innerHTML]="formatContent(currentLesson.lyThuyet)"></div>
            </div>

            <!-- Bài tập -->
            <div class="exercise-section" *ngIf="currentLesson.baiTap">
              <h4><i class="fa-solid fa-pen-to-square"></i> Bài tập</h4>
              <div class="exercise-content" [innerHTML]="formatContent(currentLesson.baiTap)"></div>
            </div>

            <!-- Tài liệu -->
            <div class="document-section" *ngIf="currentLesson.linkTaiLieu" style="margin-bottom: 20px; padding: 16px; background: rgba(16,185,129,0.05); border-radius: 8px; border-left: 3px solid var(--success);">
              <h4 style="font-size: 14px; margin-bottom: 10px; color: var(--success);"><i class="fa-solid fa-file-arrow-down"></i> Tài liệu đính kèm</h4>
              <a [href]="getDocumentUrl(currentLesson.linkTaiLieu)" target="_blank" class="btn btn-outline" style="width: 100%; border-color: var(--success); color: var(--success); text-decoration: none; display: inline-block; text-align: center;">
                <i class="fa-solid fa-download"></i> Tải xuống / Xem tài liệu
              </a>
            </div>

            <div *ngIf="!currentLesson.lyThuyet && !currentLesson.baiTap && !currentLesson.linkTaiLieu" class="empty-content">
              <i class="fa-solid fa-book-open" style="font-size: 32px; color: var(--gray-400); margin-bottom: 8px"></i>
              <p>Chưa có nội dung cho bài học này.</p>
            </div>
          </ng-container>

          <!-- Nav buttons -->
          <div class="nav-buttons">
            <button class="btn btn-outline" (click)="goToPrevLesson()" [disabled]="!hasPrevLesson()">
              <i class="fa-solid fa-arrow-left"></i> Bài trước
            </button>

            <!-- Nút Hoàn thành ẩn đi nếu là bài Trắc nghiệm (Bắt buộc phải bấm Nộp bài mới hoàn thành được) -->
            <button class="btn btn-primary" *ngIf="!currentLesson.daHoanThanh && !parsedQuiz" (click)="completeLesson()">
              Hoàn thành <i class="fa-solid fa-arrow-right"></i>
            </button>

            <button class="btn btn-success" *ngIf="currentLesson.daHoanThanh && hasNextLesson()" (click)="goToNextLesson()">
              Bài tiếp theo <i class="fa-solid fa-arrow-right"></i>
            </button>
            <button class="btn btn-warning" *ngIf="currentLesson.daHoanThanh && !hasNextLesson()" (click)="downloadCertificate()" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none;">
              <i class="fa-solid fa-award"></i> Nhận chứng chỉ
            </button>
          </div>
        </div>

        <div class="panel-content" *ngIf="panelTab === 'notes'">
          <div class="empty-content">
            <i class="fa-solid fa-sticky-note" style="font-size: 32px; color: var(--gray-400); margin-bottom: 8px"></i>
            <p>Tính năng ghi chú sẽ sớm ra mắt.</p>
          </div>
        </div>
      </aside>
    </div>

    <!-- Loading & Error -->
    <div *ngIf="loading" class="loading-screen">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 32px; color: var(--primary)"></i>
      <p>Đang tải nội dung khóa học...</p>
    </div>
    <div *ngIf="!loading && !courseData" class="error-screen">
      <i class="fa-solid fa-triangle-exclamation" style="font-size: 48px; color: var(--danger); margin-bottom: 16px"></i>
      <h2>Không thể tải khóa học</h2>
      <p>{{ errorMsg }}</p>
      <a routerLink="/dashboard" class="btn btn-primary" style="margin-top: 16px">Quay lại trang học tập</a>
    </div>
  `,
  styles: [`
    /* ============================================== */
    /* CSS CŨ ĐƯỢC GIỮ NGUYÊN HOÀN TOÀN               */
    /* ============================================== */
    .learn-layout { display: flex; height: 100vh; overflow: hidden; }
    .learn-sidebar { width: 280px; background: var(--gray-800); color: var(--white); overflow-y: auto; flex-shrink: 0; }
    .sidebar-header { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .back-link { font-size: 12px; color: var(--gray-400); text-decoration: none; display: inline-block; margin-bottom: 8px; transition: color 0.2s; }
    .back-link:hover { color: var(--white); }
    .back-link i { margin-right: 4px; }
    .sidebar-header h3 { font-size: 14px; margin-bottom: 8px; line-height: 1.4; }
    .progress-info { font-size: 12px; color: var(--gray-400); }
    .progress-info strong { color: var(--white); }
    .progress-bar { margin-top: 4px; background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; }
    .progress-bar .fill { height: 100%; background: var(--primary); border-radius: 2px; transition: width 0.3s; }
    .chapter { border-bottom: 1px solid rgba(255,255,255,0.05); }
    .chapter-header { padding: 12px 16px; display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--gray-400); }

    .lesson-item { display: flex; align-items: center; gap: 10px; padding: 8px 16px 8px 24px; font-size: 13px; color: var(--gray-400); cursor: pointer; transition: all 0.2s; }
    .lesson-item:hover { background: rgba(255,255,255,0.05); }
    .lesson-item.completed { color: var(--gray-500); }
    .lesson-item.current { color: var(--primary-light, #a5b4fc); background: rgba(91, 99, 211, 0.15); font-weight: 600; }
    .lesson-item.locked { opacity: 0.4; cursor: not-allowed; } /* THÊM CHO TRẮC NGHIỆM */

    .lesson-icon { font-size: 14px; width: 20px; text-align: center; flex-shrink: 0; }

    .learn-main { flex: 1; display: flex; flex-direction: column; background: #0D0D0D; }
    .learn-topbar { display: flex; justify-content: space-between; padding: 10px 20px; background: var(--gray-800); color: var(--gray-400); font-size: 13px; }
    .topbar-right i { margin: 0 2px; }
    .topbar-right { display: flex; align-items: center; gap: 4px; }
    .topbar-btn { background: none; border: none; color: var(--gray-400); font-size: 13px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: all 0.2s; text-decoration: none; }
    .topbar-btn:hover { color: var(--white); background: rgba(255,255,255,0.1); }
    .topbar-sep { color: var(--gray-600); }
    .video-player { flex: 1; display: flex; flex-direction: column; }
    .video-placeholder, .video-container { flex: 1; display: flex; align-items: center; justify-content: center; background: #1a1a2e; }
    .no-video-msg { text-align: center; color: var(--gray-400); }
    .video-info { padding: 8px 20px; color: var(--gray-400); font-size: 13px; text-align: center; background: rgba(0,0,0,0.3); }

    .learn-panel { width: 360px; background: var(--white); overflow-y: auto; flex-shrink: 0; border-left: 1px solid var(--gray-200); }
    .panel-tabs { display: flex; border-bottom: 2px solid var(--gray-200); }
    .p-tab { flex: 1; padding: 12px; background: none; font-size: 13px; font-weight: 600; color: var(--gray-400); border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; cursor: pointer; }
    .p-tab.active { color: var(--primary); border-bottom-color: var(--primary); }
    .panel-content { padding: 20px; }
    .panel-content h3 { font-size: 16px; margin-bottom: 12px; }
    .theory-content { font-size: 14px; color: var(--gray-700); line-height: 1.7; margin-bottom: 20px; white-space: pre-wrap; word-wrap: break-word; }
    .exercise-section { margin-bottom: 20px; padding: 16px; background: rgba(91,99,211,0.05); border-radius: 8px; border-left: 3px solid var(--primary); }
    .exercise-section h4 { font-size: 14px; margin-bottom: 8px; color: var(--primary); }
    .exercise-section h4 i { margin-right: 6px; }
    .exercise-content { font-size: 14px; color: var(--gray-700); line-height: 1.7; white-space: pre-wrap; }
    .empty-content { text-align: center; padding: 40px 20px; color: var(--gray-500); }
    .nav-buttons { display: flex; gap: 10px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--gray-200); }
    .nav-buttons .btn { flex: 1; }
    .btn-success { background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; }
    .btn-success:hover { background: linear-gradient(135deg, #059669, #047857); }

    .loading-screen, .error-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; color: var(--gray-600); }
    .loading-screen p, .error-screen p { margin-top: 12px; }
  `]
})
export class LearnComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);

  courseData: any = null;
  currentLesson: any = null;
  currentLessonId = 0;
  loading = true;
  errorMsg = '';
  panelTab: 'overview' | 'notes' = 'overview';

  isVideoFinished = false;
  isExerciseCompleted = false;

  private allLessons: any[] = [];

  // ==========================================
  // 🟢 THÊM MỚI: BIẾN CHO TRẮC NGHIỆM
  // ==========================================
  parsedQuiz: any = null;
  quizAnswers: number[] = [];
  quizSubmitted = false;
  quizScore = 0;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const courseId = +(params.get('slug') || 0);
      const lessonId = +(params.get('id') || 0);
      this.currentLessonId = lessonId;
      if (courseId) {
        this.loadCourseContent(courseId, lessonId);
      }
    });
  }

  loadCourseContent(courseId: number, lessonId: number) {
    this.loading = true;
    this.api.getCourseContent(courseId).subscribe({
      next: (data: any) => {
        this.courseData = data;
        this.buildLessonList();

        // Chọn bài học theo ID hoặc bài đầu tiên
        if (lessonId && this.allLessons.some(l => l.maBaiHoc === lessonId)) {
          this.selectLesson(this.allLessons.find(l => l.maBaiHoc === lessonId), courseId);
        } else if (this.allLessons.length > 0) {
          // Chọn bài chưa hoàn thành đầu tiên hoặc bài đầu
          const firstIncomplete = this.allLessons.find(l => !l.daHoanThanh);
          const firstTarget = firstIncomplete ? firstIncomplete : this.allLessons[0];
          this.selectLesson(firstTarget, courseId);
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Không thể tải nội dung khóa học.';
      }
    });
  }

  private buildLessonList() {
    this.allLessons = [];
    if (this.courseData?.chuongs) {
      for (const ch of this.courseData.chuongs) {
        for (const lesson of (ch.baiHocs || [])) {
          this.allLessons.push(lesson);
        }
      }
    }
  }

  // ==========================================
  // 🟢 THÊM MỚI: HÀM PARSE VÀ KIỂM TRA KHÓA BÀI
  // ==========================================
  parseQuiz(baiTapString: string | undefined | null): any {
    if (!baiTapString) return null;
    try {
      const data = JSON.parse(baiTapString);
      if (data && data.isQuiz) return data;
    } catch(e) {}
    return null;
  }

  isLessonLocked(targetLesson: any): boolean {
    if (!this.courseData?.chuongs) return false;

    // Tìm index của chương chứa bài học mà người dùng ĐANG MUỐN XEM
    let targetChapIdx = -1;
    for (let i = 0; i < this.courseData.chuongs.length; i++) {
      if (this.courseData.chuongs[i].baiHocs?.includes(targetLesson)) {
        targetChapIdx = i; break;
      }
    }

    if (targetChapIdx <= 0) return false; // Chương đầu tiên luôn cho xem

    // Lặp qua tất cả các chương TRƯỚC ĐÓ
    for (let i = 0; i < targetChapIdx; i++) {
      const chap = this.courseData.chuongs[i];
      if (!chap.baiHocs) continue;

      // Tìm xem chương này có bài Quiz nào chưa làm hoặc chưa đậu không?
      const hasIncompleteQuiz = chap.baiHocs.some((l: any) => {
        if (!l.daHoanThanh) {
          const q = this.parseQuiz(l.baiTap);
          return q !== null; // Là quiz nhưng chưa vượt qua => bị khóa!
        }
        return false;
      });

      if (hasIncompleteQuiz) return true; // KHÓA CỬA! Không cho học chương tiếp theo!
    }
    return false;
  }

  // ==========================================
  // 🟢 SỬA LẠI: HÀM SELECT LESSON ĐỂ XỬ LÝ TRẮC NGHIỆM
  // ==========================================
  selectLesson(lesson: any, courseId: number) {
    // Nếu bị khóa => Báo lỗi và không cho load
    if (this.isLessonLocked(lesson)) {
      Swal.fire('Chương này đã bị khóa', 'Bạn phải vượt qua bài kiểm tra đánh giá của chương trước để có thể mở khóa nội dung này!', 'warning');
      return;
    }

    this.currentLessonId = lesson.maBaiHoc;
    this.currentLesson = lesson;
    this.panelTab = 'overview';
    this.isVideoFinished = false;
    this.isExerciseCompleted = false;

    // Load Quiz nếu có
    this.parsedQuiz = this.parseQuiz(lesson.baiTap);
    if (this.parsedQuiz) {
      this.quizAnswers = new Array(this.parsedQuiz.questions.length).fill(-1); // -1 là chưa chọn
      this.quizSubmitted = false;
      this.quizScore = 0;
    }
  }

  // ==========================================
  // 🟢 THÊM MỚI: HÀM NỘP BÀI TRẮC NGHIỆM VÀ CHẤM ĐIỂM
  // ==========================================
  submitQuiz() {
    if (this.quizAnswers.includes(-1)) {
      Swal.fire('Chưa hoàn thành', 'Vui lòng đánh dấu chọn đáp án cho tất cả các câu hỏi!', 'warning');
      return;
    }

    let correctCount = 0;
    this.parsedQuiz.questions.forEach((q: any, i: number) => {
      // Ép kiểu string để compare tuyệt đối an toàn
      if (this.quizAnswers[i].toString() === q.correctIdx.toString()) {
        correctCount++;
      }
    });

    this.quizScore = Math.round((correctCount / this.parsedQuiz.questions.length) * 100);
    this.quizSubmitted = true;

    if (this.quizScore >= this.parsedQuiz.passingScore) {
      Swal.fire('Xuất sắc!', `Bạn đạt ${this.quizScore}%. Đã mở khóa chương tiếp theo!`, 'success');
      this.completeLesson(); // tự động gọi API hoàn thành bài học
    } else {
      Swal.fire('Cố gắng lên', `Bạn chỉ đạt ${this.quizScore}%. (Yêu cầu ${this.parsedQuiz.passingScore}%). Vui lòng xem lại kiến thức và làm lại bài!`, 'error');
    }
  }

  onVideoEnded() {
    this.isVideoFinished = true;
  }

  canCompleteLesson(): boolean {
    return true;
  }

  getLessonTitle(lesson: any): string {
    if (!lesson) return 'Bài học';

    // Nếu là Quiz thì hiển thị tên riêng
    if (this.parseQuiz(lesson.baiTap)) {
      return 'Bài Trắc Nghiệm Đánh Giá';
    }

    if (lesson.lyThuyet && lesson.lyThuyet.length > 0) {
      const firstLine = lesson.lyThuyet.split('\n')[0].trim();
      return firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;
    }
    return 'Bài học #' + lesson.maBaiHoc;
  }

  getCurrentChapterTitle(): string {
    if (!this.courseData?.chuongs) return '';
    for (let i = 0; i < this.courseData.chuongs.length; i++) {
      const ch = this.courseData.chuongs[i];
      if (ch.baiHocs?.some((l: any) => l.maBaiHoc === this.currentLessonId)) {
        return 'Ch.' + (i + 1) + ': ' + ch.tieuDe;
      }
    }
    return '';
  }

  getVideoUrl(linkVideo: string): string {
    if (!linkVideo) return '';
    if (linkVideo.startsWith('http')) return linkVideo;
    return 'http://localhost:5128' + linkVideo;
  }

  getDocumentUrl(linkTaiLieu: string): string {
    if (!linkTaiLieu) return '';
    if (linkTaiLieu.startsWith('http')) return linkTaiLieu;
    return 'http://localhost:5128' + linkTaiLieu;
  }

  formatContent(text: string): SafeHtml {
    if (!text) return '';
    const htmlWithBr = text.replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(htmlWithBr);
  }

  completeLesson() {
    if (!this.currentLesson) return;
    this.api.completeLesson(this.currentLessonId).subscribe({
      next: (res: any) => {
        this.currentLesson.daHoanThanh = true;
        if (res.phanTramTienDo !== undefined) {
          this.courseData.phanTramTienDo = res.phanTramTienDo;
        }

        // Không hiện thông báo nếu vừa mới làm Quiz xong (tránh trùng popup)
        if (!this.parsedQuiz) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: res.message || 'Đã hoàn thành bài học!',
            showConfirmButton: false,
            timer: 2000
          });
        }

        if (this.hasNextLesson()) {
          setTimeout(() => this.goToNextLesson(), 1000);
        } else {
          if (this.courseData.phanTramTienDo >= 100 || this.allLessons.every(l => l.daHoanThanh)) {
            Swal.fire({
              title: '🎉 Chúc mừng!',
              text: 'Bạn đã hoàn thành xuất sắc toàn bộ khóa học này. Hệ thống đã ghi nhận và đang cấp chứng chỉ cho bạn.',
              icon: 'success',
              confirmButtonText: 'Xem chứng chỉ',
              confirmButtonColor: '#f59e0b',
              allowOutsideClick: false
            }).then(() => {
              this.router.navigate(['/dashboard']);
            });
          }
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: err.error?.message || 'Không thể hoàn thành bài học.',
          confirmButtonColor: '#5a67d8'
        });
      }
    });
  }

  hasPrevLesson(): boolean {
    const idx = this.allLessons.findIndex(l => l.maBaiHoc === this.currentLessonId);
    return idx > 0;
  }

  hasNextLesson(): boolean {
    const idx = this.allLessons.findIndex(l => l.maBaiHoc === this.currentLessonId);
    return idx < this.allLessons.length - 1;
  }

  goToPrevLesson() {
    const idx = this.allLessons.findIndex(l => l.maBaiHoc === this.currentLessonId);
    if (idx > 0) {
      const prev = this.allLessons[idx - 1];
      this.selectLesson(prev, this.courseData.maKhoaHoc);
    }
  }

  goToNextLesson() {
    const idx = this.allLessons.findIndex(l => l.maBaiHoc === this.currentLessonId);
    if (idx < this.allLessons.length - 1) {
      const next = this.allLessons[idx + 1];
      this.selectLesson(next, this.courseData.maKhoaHoc);
    }
  }

  openRating() {
    this.router.navigate(['/course', this.courseData.maKhoaHoc], { fragment: 'reviews' });
  }

  showProgressDetail() {
    const total = this.allLessons.length;
    const completed = this.allLessons.filter(l => l.daHoanThanh).length;
    const remaining = total - completed;
    Swal.fire({
      title: '<i class="fa-solid fa-chart-pie"></i> Chi tiết tiến độ',
      html: `
        <div style="text-align:left; padding: 8px 0;">
          <p style="margin:8px 0"><strong>Khóa học:</strong> ${this.courseData.tieuDe}</p>
          <p style="margin:8px 0"><strong>Tổng bài học:</strong> ${total}</p>
          <p style="margin:8px 0; color:#10B981"><strong>Đã hoàn thành:</strong> ${completed}/${total}</p>
          <p style="margin:8px 0; color:#F59E0B"><strong>Còn lại:</strong> ${remaining} bài</p>
          <div style="margin-top:12px; background:#e5e7eb; border-radius:8px; height:12px; overflow:hidden">
            <div style="height:100%; background:linear-gradient(90deg,#10B981,#059669); border-radius:8px; width:${this.courseData.phanTramTienDo}%"></div>
          </div>
          <p style="text-align:center; margin-top:8px; font-weight:700; font-size:18px; color:#5a67d8">${this.courseData.phanTramTienDo | 0}%</p>
        </div>
      `,
      confirmButtonColor: '#5a67d8',
      confirmButtonText: 'Tiếp tục học'
    });
  }

  downloadCertificate() {
    const studentName = this.authService.currentUser()?.userName || 'Học viên';
    const courseName = this.courseData?.tieuDe || 'Khóa học lập trình';

    let instructorName = 'Đại diện EduLearn';
    if (this.courseData?.chuongs && this.courseData.chuongs[0] && this.courseData.chuongs[0].giangVien) {
      instructorName = this.courseData.chuongs[0].giangVien;
    }

    const currentDate = new Date().toLocaleDateString('vi-VN');
    const signatureStyle = "font-family: 'Brush Script MT', 'Dancing Script', cursive; font-size: 32px; color: #0f172a;";

    const certHtml = `
      <div id="pdf-cert-container" style="
        width: 1000px;
        height: 700px;
        padding: 50px;
        box-sizing: border-box;
        border: 20px solid #1e293b;
        background: #f8fafc;
        text-align: center;
        position: relative;
        font-family: 'Times New Roman', serif;
        box-shadow: inset 0 0 0 8px #cbd5e1;
        overflow: hidden;
      ">
        <div style="position: absolute; top: 30px; left: 30px; width: 100px; height: 100px; background: #f59e0b; border-radius: 50%; opacity: 0.1;"></div>
        <div style="position: absolute; bottom: -50px; right: -50px; width: 250px; height: 250px; border: 15px solid #3b82f6; border-radius: 50%; opacity: 0.05;"></div>
        <div style="position: absolute; top: 100px; right: 80px; width: 50px; height: 50px; background: #10b981; transform: rotate(45deg); opacity: 0.1;"></div>

        <div style="position: relative; z-index: 10;">
          <h1 style="color: #0f172a; font-size: 52px; margin: 40px 0 10px; text-transform: uppercase; letter-spacing: 3px;">Chứng Chỉ Hoàn Thành</h1>
          <p style="color: #64748b; font-size: 20px; margin-bottom: 40px; text-transform: uppercase; letter-spacing: 1px;">Giấy chứng nhận này được trao cho</p>

          <h2 style="color: #1d4ed8; font-size: 46px; margin-bottom: 25px; font-style: italic; border-bottom: 3px solid #cbd5e1; padding-bottom: 15px; display: inline-block; min-width: 400px; font-weight: bold;">
            ${studentName}
          </h2>

          <p style="color: #475569; font-size: 22px; margin-bottom: 20px;">Đã xuất sắc hoàn thành khóa học:</p>
          <h3 style="color: #0f172a; font-size: 34px; margin-bottom: 60px; font-weight: bold; padding: 0 40px;">${courseName}</h3>

          <div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 40px; position: absolute; bottom: 40px; width: 100%; box-sizing: border-box; left: 0;">
            <div style="text-align: left;">
              <p style="margin: 0; font-size: 16px; color: #64748b;">Mã chứng chỉ: CERT-${Math.floor(Math.random() * 90000) + 10000}</p>
              <p style="margin: 8px 0 0; font-size: 16px; color: #64748b;">Ngày cấp: ${currentDate}</p>
            </div>

            <div style="text-align: center; margin-bottom: 10px;">
              <div style="width: 80px; height: 80px; background: url('https://img.icons8.com/color/96/000000/guarantee.png') center/cover; margin: 0 auto;"></div>
            </div>

            <div style="text-align: center;">
              <div style="${signatureStyle}">${instructorName}</div>
              <div style="border-top: 1px solid #94a3b8; width: 180px; margin: 5px auto 0; padding-top: 8px; font-size: 16px; color: #475569;">Giảng viên khóa học</div>
            </div>
          </div>
        </div>
      </div>
    `;

    Swal.fire({
      title: 'Đang tạo chứng chỉ...',
      text: 'Vui lòng đợi giây lát để hệ thống xuất file PDF',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.innerHTML = certHtml;
    document.body.appendChild(tempDiv);

    const targetElement = document.getElementById('pdf-cert-container') as HTMLElement;

    setTimeout(() => {
      html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, (pdf.internal.pageSize.getHeight() - pdfHeight) / 2, pdfWidth, pdfHeight);

        pdf.save(`ChungChi_${this.courseData?.maKhoaHoc || 'KhoaHoc'}.pdf`);

        document.body.removeChild(tempDiv);
        Swal.close();

        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Chứng chỉ của bạn đã được tải xuống máy tính!',
          timer: 3000,
          showConfirmButton: false
        });
      }).catch(err => {
        console.error('Lỗi khi tạo PDF:', err);
        document.body.removeChild(tempDiv);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể tạo chứng chỉ ngay lúc này. Vui lòng thử lại sau.'
        });
      });
    }, 500);
  }

  shareLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Đã sao chép link khóa học!',
        showConfirmButton: false,
        timer: 2000
      });
    });
  }
}
