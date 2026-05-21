import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, CourseCardComponent],
  template: `
    <app-header />

    <section class="dash-hero">
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px;">
          <div>
            <span class="dash-badge"><i class="fa-solid fa-robot" style="margin-right: 8px;"></i> AI đã cập nhật gợi ý mới cho bạn!</span>
            <h1>Chào mừng trở lại! <i class="fa-solid fa-hand" style="font-size: 24px; color: #FBBF24;"></i></h1>
            <p>Tiếp tục hành trình học tập của bạn</p>
          </div>
          <a routerLink="/purchase-history" class="btn btn-outline btn-sm" style="color: white; border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-receipt"></i> Lịch sử mua hàng
          </a>
        </div>
      </div>
    </section>

    <div class="container dash-content">
      <div class="my-stats">
        <div class="my-stat-modern card">
          <div class="stat-content">
            <span class="st-val primary">{{ dataService.enrolledCourses().length }}</span>
            <span class="st-lbl">Đang học</span>
          </div>
          <div class="stat-icon-modern bg-blue">
            <i class="fa-solid fa-book-open-reader"></i>
          </div>
        </div>
        <div class="my-stat-modern card">
          <div class="stat-content">
            <span class="st-val success">{{ completedCoursesCount }}</span>
            <span class="st-lbl">Hoàn thành</span>
          </div>
          <div class="stat-icon-modern bg-green">
            <i class="fa-solid fa-circle-check"></i>
          </div>
        </div>
        <div class="my-stat-modern card">
          <div class="stat-content">
            <span class="st-val orange">{{ dataService.enrolledCourses().length * 15 }}h</span>
            <span class="st-lbl">Tổng giờ học</span>
          </div>
          <div class="stat-icon-modern bg-orange">
            <i class="fa-solid fa-stopwatch"></i>
          </div>
        </div>
        <div class="my-stat-modern card">
          <div class="stat-content">
            <span class="st-val purple">{{ dataService.certificates().length }}</span>
            <span class="st-lbl">Chứng chỉ</span>
          </div>
          <div class="stat-icon-modern bg-purple">
            <i class="fa-solid fa-award"></i>
          </div>
        </div>
      </div>

      <div *ngIf="dataService.enrolledCourses().length === 0" class="empty-state card">
         <div class="empty-icon"><i class="fa-solid fa-graduation-cap"></i></div>
         <h3>Bạn chưa đăng ký khóa học nào</h3>
         <p>Hãy khám phá các khóa học thú vị và bắt đầu hành trình học tập của bạn.</p>
         <a routerLink="/course" class="btn btn-primary">Khám phá khóa học</a>
      </div>

      <section class="dash-search">
        <div class="search-bar">
          <span><i class="fa-solid fa-magnifying-glass"></i></span>
          <input type="text" placeholder="Tìm kiếm khóa học mới..." class="form-input" style="border:none">
          <div class="search-cat">Tất cả danh mục ▾</div>
          <button class="btn btn-primary btn-sm"><i class="fa-solid fa-magnifying-glass"></i> Tìm kiếm</button>
        </div>
      </section>

      <section class="section" *ngIf="ongoingCourses.length > 0">
        <div class="section-header section-header-inline">
          <h2><i class="fa-solid fa-play-circle"></i> Tiếp tục học tập</h2>
          <button *ngIf="ongoingCourses.length > 2" class="btn btn-outline btn-sm section-toggle section-toggle-primary" (click)="showAllOngoing = !showAllOngoing">
            {{ showAllOngoing ? 'Ẩn bớt ▴' : 'Xem tất cả (' + ongoingCourses.length + ') ▾' }}
          </button>
        </div>
        <div class="enrolled-grid">
          <div *ngFor="let ec of (showAllOngoing ? ongoingCourses : ongoingCourses.slice(0, 2))" 
               class="enrolled-card card" 
               (click)="!isExpired(ec) ? goToLearn(ec.course?.id, $event) : null"
               style="cursor: pointer; position: relative;">
            <div class="ec-icon" [class.expired-overlay]="isExpired(ec)">
              <img *ngIf="ec.course?.image && ec.course!.image!.length > 5" [src]="ec.course?.image" (error)="ec.course!.image = ''" alt="course" style="width: 100%; height: 100%; object-fit: cover;">
              <div *ngIf="!ec.course?.image || ec.course!.image!.length <= 5" style="font-size: 32px; display:flex; justify-content:center; align-items:center; width:100%; height:100%"><i class="fa-solid fa-box"></i></div>
              <div *ngIf="isExpired(ec)" class="expired-tag">HẾT HẠN</div>
            </div>
            <div class="ec-info">
              <h3 [class.muted]="isExpired(ec)">{{ ec.course?.title }}</h3>
              <p>{{ ec.course?.instructor }} • {{ ec.course?.modules }} chương</p>
              
              <div class="expiry-info" *ngIf="ec.endDate" [style.color]="isExpired(ec) ? '#ef4444' : '#f59e0b'" style="font-size: 11px; margin-bottom: 4px; font-weight: 600;">
                <i class="fa-solid fa-clock"></i> {{ isExpired(ec) ? 'Đã hết hạn: ' : 'Hết hạn: ' }}{{ ec.endDate | date:'dd/MM/yyyy' }}
              </div>
              
              <span class="progress-text">Tiến độ: {{ ec.progress }}%</span>
              <div class="progress-bar"><div class="fill" [style.width.%]="ec.progress" [style.background]="isExpired(ec) ? '#94a3b8' : ''"></div></div>
            </div>
            
            <button *ngIf="!isExpired(ec)" (click)="goToLearn(ec.course?.id, $event)" 
                    class="btn btn-primary btn-sm"
                    style="white-space: nowrap; z-index: 2;">► Tiếp tục</button>
            <button *ngIf="isExpired(ec)" (click)="goToCourseDetail(ec.course?.id, $event)" 
                    class="btn btn-danger btn-sm"
                    style="white-space: nowrap; z-index: 2; background: #ef4444; border-color: #ef4444;">Mua lại</button>
          </div>
        </div>
      </section>

      <section class="section" *ngIf="completedCourses.length > 0">
        <div class="section-header section-header-inline">
          <h2><i class="fa-solid fa-circle-check" style="color: #10B981;"></i> Đã hoàn thành</h2>
          <button *ngIf="completedCourses.length > 2" class="btn btn-outline btn-sm section-toggle section-toggle-success" (click)="showAllCompleted = !showAllCompleted">
            {{ showAllCompleted ? 'Ẩn bớt ▴' : 'Xem tất cả (' + completedCourses.length + ') ▾' }}
          </button>
        </div>
        <div class="enrolled-grid">
          <div *ngFor="let ec of (showAllCompleted ? completedCourses : completedCourses.slice(0, 2))" 
               class="enrolled-card card" 
               (click)="!isExpired(ec) ? goToLearn(ec.course?.id, $event) : null"
               style="cursor: pointer; position: relative;">
            <div class="ec-icon" [class.expired-overlay]="isExpired(ec)">
              <img *ngIf="ec.course?.image && ec.course!.image!.length > 5" [src]="ec.course?.image" (error)="ec.course!.image = ''" alt="course" style="width: 100%; height: 100%; object-fit: cover;">
              <div *ngIf="!ec.course?.image || ec.course!.image!.length <= 5" style="font-size: 32px; display:flex; justify-content:center; align-items:center; width:100%; height:100%"><i class="fa-solid fa-box"></i></div>
              <div *ngIf="isExpired(ec)" class="expired-tag">HẾT HẠN</div>
            </div>
            <div class="ec-info">
              <h3 [class.muted]="isExpired(ec)">{{ ec.course?.title }}</h3>
              <p>{{ ec.course?.instructor }} • {{ ec.course?.modules }} chương</p>
              
              <div class="expiry-info" *ngIf="ec.endDate" [style.color]="isExpired(ec) ? '#ef4444' : '#f59e0b'" style="font-size: 11px; margin-bottom: 4px; font-weight: 600;">
                <i class="fa-solid fa-clock"></i> {{ isExpired(ec) ? 'Đã hết hạn: ' : 'Hết hạn: ' }}{{ ec.endDate | date:'dd/MM/yyyy' }}
              </div>
              
              <span class="progress-text" style="color: #10B981; font-weight: 600;"><i class="fa-solid fa-check"></i> Hoàn thành 100%</span>
              <div class="progress-bar"><div class="fill" style="width: 100%; background: linear-gradient(90deg, #10B981, #059669);"></div></div>
            </div>
            
            <button *ngIf="!isExpired(ec)" (click)="goToLearn(ec.course?.id, $event)" 
                    class="btn btn-outline btn-sm"
                    style="white-space: nowrap; z-index: 2;">Xem lại</button>
            <button *ngIf="isExpired(ec)" (click)="goToCourseDetail(ec.course?.id, $event)" 
                    class="btn btn-danger btn-sm"
                    style="white-space: nowrap; z-index: 2; background: #ef4444; border-color: #ef4444;">Mua lại</button>
          </div>
        </div>
      </section>

      <section class="section" *ngIf="dataService.certificates().length > 0">
        <div class="section-header section-header-inline">
          <h2><i class="fa-solid fa-trophy" style="color: #8B5CF6;"></i> Chứng chỉ của tôi</h2>
          <button *ngIf="dataService.certificates().length > 2" class="btn btn-outline btn-sm section-toggle section-toggle-purple" (click)="showAllCertificates = !showAllCertificates">
            {{ showAllCertificates ? 'Ẩn bớt ▴' : 'Xem tất cả (' + dataService.certificates().length + ') ▾' }}
          </button>
        </div>
        <div class="cert-grid">
          <div *ngFor="let cert of (showAllCertificates ? dataService.certificates() : dataService.certificates().slice(0, 2))" class="cert-card card">
            <div class="cert-icon-modern"><i class="fa-solid fa-certificate"></i></div>
            <div class="cert-info">
              <strong>{{ cert.courseName }}</strong>
              <span>{{ cert.source }} • {{ cert.date }}</span>
            </div>
            <button class="btn btn-primary btn-sm" (click)="downloadCert(cert)">👁️ Xem & In</button>
          </div>
        </div>
      </section>

      <section class="section recommendation-section" *ngIf="authService.isLoggedIn()">
        <div class="recommendation-panel card">
          <div class="section-header recommendation-header">
            <div>
              <span class="recommendation-chip">AI cá nhân hóa</span>
              <h2><i class="fa-solid fa-sparkles"></i> Gợi ý dành riêng cho bạn</h2>
              <p class="section-subtitle">Dựa trên hồ sơ và nội dung bạn đã đánh giá, hệ thống chỉ lấy các khóa học chưa từng được bạn đánh giá.</p>
            </div>
            <a routerLink="/ai-recommendations" class="see-all">Xem tất cả →</a>
          </div>

          <div *ngIf="loadingPersonalized" class="course-grid recommendation-loading-grid">
            <div *ngFor="let item of skeletonCards" class="recommendation-skeleton card"></div>
          </div>

          <div *ngIf="!loadingPersonalized && personalizedRecommendations.length > 0" class="course-grid">
            <app-course-card
              *ngFor="let c of personalizedRecommendations"
              [course]="c"
              [showCartBtn]="true"
            />
          </div>

          <div *ngIf="!loadingPersonalized && personalizedRecommendations.length === 0" class="recommendation-empty">
            <div class="recommendation-empty-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
            <h3>Chưa có đủ dữ liệu để cá nhân hóa sâu hơn</h3>
            <p>Hãy đánh giá thêm vài khóa học để AI gợi ý sát hơn với nhu cầu của bạn.</p>
          </div>
        </div>

        <div class="recommendation-panel card">
          <div class="section-header recommendation-header">
            <div>
              <span class="recommendation-chip recommendation-chip-secondary">Tiếp tục học tập</span>
              <h2><i class="fa-solid fa-layer-group"></i> Học viên cũng mua các khóa học tương tự</h2>
              <p class="section-subtitle">Tổng hợp từ các khóa học bạn đã mua và đang học dở, ưu tiên các khóa chưa hoàn thành, chưa có chứng chỉ và có thể mở rộng thêm điều kiện chưa đánh giá.</p>
            </div>
            <a routerLink="/course" class="see-all">Khám phá thêm →</a>
          </div>

          <div *ngIf="loadingRelated" class="course-grid recommendation-loading-grid">
            <div *ngFor="let item of skeletonCards" class="recommendation-skeleton card"></div>
          </div>

          <div *ngIf="!loadingRelated && relatedRecommendations.length > 0" class="course-grid">
            <app-course-card
              *ngFor="let c of relatedRecommendations"
              [course]="c"
              [showCartBtn]="true"
            />
          </div>

          <div *ngIf="!loadingRelated && relatedRecommendations.length === 0" class="recommendation-empty">
            <div class="recommendation-empty-icon"><i class="fa-solid fa-book-bookmark"></i></div>
            <h3>Chưa có gợi ý tương tự phù hợp</h3>
            <p>Khi bạn học thêm hoặc hoàn thiện dữ liệu tiến độ, hệ thống sẽ gợi ý chính xác hơn từ các khóa đang theo học.</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dash-hero {
      background: #ffffff;
      color: #0f172a;
      padding: 40px 0 32px;
      border-bottom: 1px solid var(--gray-200);
    }
    .dash-badge {
      display: inline-block;
      background: var(--primary-bg);
      color: var(--primary);
      padding: 6px 16px;
      border-radius: 16px;
      font-size: 13px;
      margin-bottom: 16px;
      font-weight: 700;
      border: 1px solid rgba(234, 88, 12, 0.2);
    }
    .dash-hero h1 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 6px;
      color: #0f172a;
    }
    .dash-hero p {
      color: var(--gray-500);
    }

    .dash-content { padding: 24px 0 60px; }

    .my-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 28px;
    }
    .my-stat-modern {
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: none;
      background: var(--white);
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      border-radius: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .my-stat-modern:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    .st-val { font-size: 32px; font-weight: 800; line-height: 1.2; margin-bottom: 4px; }
    .st-val.primary { color: #3B82F6; }
    .st-val.success { color: #10B981; }
    .st-val.orange { color: #F59E0B; }
    .st-val.purple { color: #8B5CF6; }
    .st-lbl { font-size: 14px; color: var(--gray-500); font-weight: 500; }

    .stat-icon-modern {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    .bg-blue { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
    .bg-green { background: rgba(16, 185, 129, 0.1); color: #10B981; }
    .bg-orange { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
    .bg-purple { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; }

    .empty-state {
      padding: 40px;
      text-align: center;
      background: var(--white);
      border-radius: var(--radius-lg);
      margin-bottom: 28px;
    }
    .empty-icon { font-size: 48px; margin-bottom: 16px; color: var(--gray-400); }
    .empty-state h3 { margin-bottom: 8px; }
    .empty-state p { color: var(--gray-500); margin-bottom: 24px; }

    .dash-search { margin-bottom: 28px; }
    .search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      padding: 0 16px;
      background: var(--white);
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .search-cat {
      padding: 10px 16px;
      border-left: 1px solid var(--gray-200);
      white-space: nowrap;
      font-size: 13px;
      color: var(--gray-500);
    }

    .section { margin-bottom: 32px; }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 16px;
    }
    .section-header h2, .section h2 { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
    .section-header h2 { margin-bottom: 0; }
    .section-header-inline { display: flex; justify-content: space-between; align-items: center; }
    .section-toggle {
      border: none;
      font-weight: 600;
      background: transparent;
    }
    .section-toggle-primary { color: var(--primary); }
    .section-toggle-success { color: #10B981; }
    .section-toggle-purple { color: #8B5CF6; }
    .see-all { color: var(--primary); font-weight: 600; font-size: 14px; }
    .section-subtitle {
      margin: 8px 0 0;
      color: var(--gray-500);
      font-size: 14px;
      line-height: 1.6;
      max-width: 720px;
    }

    .enrolled-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .btn-link-sm {
      background: none;
      border: none;
      color: var(--primary);
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    }
    .btn-link-sm:hover {
      background: rgba(0,0,0,0.05);
      text-decoration: underline;
    }
    .enrolled-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      transition: all 0.2s ease;
    }
    .enrolled-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      border-color: var(--primary-light);
    }
    .ec-icon {
      width: 60px;
      height: 60px;
      background: var(--primary-bg);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    .ec-info { flex: 1; }
    .ec-info h3 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
    .ec-info p { font-size: 12px; color: var(--gray-500); margin-bottom: 6px; }
    .progress-text { font-size: 12px; color: var(--gray-500); }
    .progress-bar {
      height: 6px;
      background: var(--gray-200);
      border-radius: 3px;
      margin-top: 6px;
      overflow: hidden;
    }
    .progress-bar .fill {
      height: 100%;
      background: var(--primary);
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    .completed-text {
      color: #10B981;
      font-weight: 600;
    }
    .completed-fill {
      width: 100%;
      background: linear-gradient(90deg, #10B981, #059669);
    }

    .cert-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .cert-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: var(--primary-bg);
      border-color: transparent;
    }
    .cert-icon-modern {
      width: 48px;
      height: 48px;
      background: rgba(139, 92, 246, 0.1);
      color: var(--primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }
    .cert-info { flex: 1; }
    .cert-info strong { display: block; font-size: 14px; }
    .cert-info span { font-size: 12px; color: var(--gray-500); }

    .recommendation-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .recommendation-panel {
      padding: 22px;
      border-radius: 20px;
      border: 1px solid rgba(91, 99, 211, 0.08);
      background:
        linear-gradient(180deg, rgba(91, 99, 211, 0.03), rgba(255,255,255,0.95)),
        var(--white);
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
    }
    .recommendation-header {
      align-items: flex-start;
      margin-bottom: 18px;
    }
    .recommendation-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(91, 99, 211, 0.12);
      color: var(--primary);
      border-radius: 999px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .recommendation-chip-secondary {
      background: rgba(16, 185, 129, 0.12);
      color: #059669;
    }
    .course-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .recommendation-loading-grid { min-height: 260px; }
    .recommendation-skeleton {
      min-height: 260px;
      border-radius: 18px;
      border: 1px solid var(--gray-200);
      background: linear-gradient(110deg, #f8fafc 8%, #eef2ff 18%, #f8fafc 33%);
      background-size: 200% 100%;
      animation: loadingShimmer 1.4s linear infinite;
    }
    .recommendation-empty {
      border: 1px dashed var(--gray-200);
      border-radius: 18px;
      padding: 28px;
      text-align: center;
      background: rgba(248, 250, 252, 0.9);
    }
    .recommendation-empty-icon {
      width: 58px;
      height: 58px;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: var(--primary);
      background: rgba(91, 99, 211, 0.1);
      margin-bottom: 12px;
    }
    .recommendation-empty h3 {
      margin-bottom: 8px;
      font-size: 16px;
    }
    .recommendation-empty p {
      margin: 0;
      color: var(--gray-500);
      line-height: 1.6;
    }

    @keyframes loadingShimmer {
      to {
        background-position-x: -200%;
      }
    }

    @media (max-width: 1200px) {
      .my-stats,
      .course-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .my-stats,
      .enrolled-grid,
      .cert-grid,
      .course-grid {
        grid-template-columns: 1fr;
      }

      .search-bar,
      .section-header,
      .recommendation-header {
        flex-direction: column;
        align-items: stretch;
      }

      .search-cat {
        border-left: none;
        border-top: 1px solid var(--gray-200);
        width: 100%;
        padding-left: 0;
      }

      .enrolled-card,
      .cert-card {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  public dataService = inject(DataService);
  public authService = inject(AuthService);
  private apiService = inject(ApiService);

  showAllOngoing = false;
  showAllCompleted = false;
  showAllCertificates = false;

  loadingPersonalized = false;
  loadingRelated = false;

  skeletonCards = [1, 2, 3, 4];

  personalizedRecommendations: any[] = [];
  relatedRecommendations: any[] = [];
  goToCourseDetail(courseId: any, event?: Event) {
    if (event) event.stopPropagation();
    if (courseId) {
      this.router.navigate(['/course', courseId]);
    }
  }

  isExpired(ec: any): boolean {
    if (!ec.endDate) return false;
    return new Date(ec.endDate) < new Date();
  }

  goToLearn(courseId: any, event: Event) {
    event.stopPropagation();
    if (courseId) {
      this.router.navigate(['/learn', courseId, 'lesson', 1]);
    }
  }

  get completedCourses() {
    return this.dataService.enrolledCourses().filter(c => c.progress === 100);
  }

  get completedCoursesCount() {
    return this.completedCourses.length;
  }

  get ongoingCourses() {
    return this.dataService.enrolledCourses().filter(c => (c.progress || 0) < 100);
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) return;

    this.dataService.loadMyCourses();
    this.dataService.loadCertificates();
    this.loadRecommendationSections();
  }

  private loadRecommendationSections() {
    this.apiService.getUserProfile().pipe(
      catchError(() => of(null))
    ).subscribe((profile: any) => {
      const userId = Number(profile?.maNguoiDung ?? profile?.id ?? 0);
      if (!userId) return;

      this.loadPersonalizedRecommendations(userId);
      this.loadRelatedRecommendationsFromLearningState();
    });
  }

  private loadPersonalizedRecommendations(userId: number) {
    this.loadingPersonalized = true;

    this.apiService.getUserProfileRecommendations(userId).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingPersonalized = false)
    ).subscribe((res: any) => {
      const rawItems = this.normalizeArrayResponse(res);
      this.personalizedRecommendations = this.dedupeCourses(
        rawItems.map(item => this.mapRecommendationCourse(item))
      ).slice(0, 4);
    });
  }

  private loadRelatedRecommendationsFromLearningState() {
    this.loadingRelated = true;

    forkJoin({
      myCourses: this.apiService.getMyCourses(1, 100).pipe(catchError(() => of({ data: [] }))),
      certificates: this.apiService.getCertificates().pipe(catchError(() => of([])))
    }).pipe(
      finalize(() => this.loadingRelated = false)
    ).subscribe(({ myCourses, certificates }) => {
      const enrolled = this.normalizeArrayResponse(myCourses);
      const certs = this.normalizeArrayResponse(certificates);

      const certificateCourseIds = new Set(
        certs
          .map((c: any) => Number(c?.khoaHoc?.maKhoaHoc ?? c?.maKhoaHoc ?? c?.courseId ?? c?.CourseId ?? 0))
          .filter(Boolean)
      );

      const ownedCourseIds = new Set(
        enrolled
          .map((t: any) => Number(t?.khoaHoc?.maKhoaHoc ?? t?.maKhoaHoc ?? t?.courseId ?? t?.CourseId ?? 0))
          .filter(Boolean)
      );

      const sourceCourseIds = enrolled
        .filter((t: any) => {
          const courseId = Number(t?.khoaHoc?.maKhoaHoc ?? t?.maKhoaHoc ?? t?.courseId ?? t?.CourseId ?? 0);
          const progress = Number(t?.phanTramTienDo ?? t?.progress ?? 0);
          const isRated = Boolean(t?.daDanhGia ?? t?.isRated ?? t?.khoaHoc?.daDanhGia ?? t?.course?.daDanhGia ?? false);

          return !!courseId
            && progress < 100
            && !certificateCourseIds.has(courseId)
            && !isRated;
        })
        .map((t: any) => Number(t?.khoaHoc?.maKhoaHoc ?? t?.maKhoaHoc ?? t?.courseId ?? t?.CourseId ?? 0))
        .filter(Boolean);

      if (!sourceCourseIds.length) {
        this.relatedRecommendations = [];
        return;
      }

      const uniqueSourceIds = [...new Set(sourceCourseIds)].slice(0, 6);

      forkJoin(
        uniqueSourceIds.map(courseId =>
          this.apiService.getSimilarCourses(courseId).pipe(catchError(() => of([])))
        )
      ).subscribe((results: any[]) => {
        const excludeIds = new Set<number>([
          ...Array.from(ownedCourseIds),
          ...Array.from(certificateCourseIds),
          ...uniqueSourceIds
        ]);

        const merged = results
          .flatMap((group: any) => this.normalizeArrayResponse(group))
          .map(item => this.mapRecommendationCourse(item))
          .filter(course => !!course.id && !excludeIds.has(Number(course.id)));

        this.relatedRecommendations = this.sortCoursesByScore(
          this.dedupeCourses(merged)
        ).slice(0, 4);
      });
    });
  }

  private normalizeArrayResponse(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  }

  private mapRecommendationCourse(item: any) {
    const id = Number(item?.courseId ?? item?.CourseId ?? item?.maKhoaHoc ?? item?.id ?? 0);
    const totalReviews = Number(item?.totalReviews ?? item?.TotalReviews ?? item?.soLuongDanhGia ?? 0);
    const rating = Number(item?.averageRating ?? item?.AverageRating ?? item?.rating ?? 0);
    const originalPrice = Number(item?.originalPrice ?? item?.OriginalPrice ?? item?.price ?? item?.giaGoc ?? 0);
    const score = Number(item?.score ?? item?.Score ?? item?.finalScore ?? 0);
    const title = item?.title ?? item?.Title ?? item?.tieuDe ?? 'Chưa có tiêu đề';

    return {
      ...item,
      id,
      title,
      slug: this.toSlug(title),
      instructor: item?.instructor ?? item?.Instructor ?? item?.giangVien ?? 'Đang cập nhật',
      rating,
      reviewCount: this.formatCount(totalReviews),
      price: originalPrice,
      originalPrice,
      image: item?.image ?? item?.Image ?? item?.anhUrl ?? item?.urlAnh ?? '',
      category: item?.category ?? 'Gợi ý AI',
      level: item?.level ?? 'Tất cả cấp độ',
      modules: Number(item?.modules ?? item?.soLuongChuong ?? 0),
      students: totalReviews,
      description: item?.description ?? item?.moTa ?? '',
      score
    };
  }

  private dedupeCourses(courses: any[]) {
    const bestById = new Map<number, any>();

    for (const course of courses) {
      const id = Number(course?.id ?? 0);
      if (!id) continue;

      const current = bestById.get(id);
      if (!current || Number(course?.score ?? 0) > Number(current?.score ?? 0)) {
        bestById.set(id, course);
      }
    }

    return this.sortCoursesByScore(Array.from(bestById.values()));
  }

  private sortCoursesByScore(courses: any[]) {
    return [...courses].sort((a, b) => Number(b?.score ?? 0) - Number(a?.score ?? 0));
  }

  private toSlug(str: string): string {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private formatCount(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return `${n}`;
  }

  downloadCert(cert: any) {
    const studentName = this.authService.currentUser()?.userName || 'Học viên';

    // Tạo giao diện chứng chỉ
    const certHtml = `
      <div id="print-cert" style="
        padding: 40px;
        border: 15px solid #1e293b;
        background: #f8fafc;
        text-align: center;
        position: relative;
        font-family: 'Times New Roman', serif;
        box-shadow: inset 0 0 0 5px #cbd5e1;
      ">
        <div style="position: absolute; top: 30px; left: 30px; width: 60px; height: 60px; background: #f59e0b; border-radius: 50%; opacity: 0.2;"></div>
        <div style="position: absolute; bottom: 30px; right: 30px; width: 100px; height: 100px; border: 5px solid #3b82f6; border-radius: 50%; opacity: 0.1;"></div>

        <h1 style="color: #0f172a; font-size: 42px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">Chứng Chỉ Hoàn Thành</h1>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 30px; text-transform: uppercase;">Giấy chứng nhận này được trao cho</p>

        <h2 style="color: #1d4ed8; font-size: 36px; margin-bottom: 20px; font-style: italic; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; display: inline-block; min-width: 300px;">
          ${studentName}
        </h2>

        <p style="color: #475569; font-size: 18px; margin-bottom: 15px;">Đã xuất sắc hoàn thành khóa học:</p>
        <h3 style="color: #0f172a; font-size: 28px; margin-bottom: 30px;">${cert.courseName}</h3>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px;">
          <div style="text-align: left;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">Mã chứng chỉ: ${cert.id}</p>
            <p style="margin: 5px 0 0; font-size: 14px; color: #64748b;">Ngày cấp: ${cert.date}</p>
          </div>
          <div style="text-align: center;">
            <div style="font-family: 'Brush Script MT', cursive; font-size: 32px; color: #0f172a; margin-bottom: 5px;">EduLearn</div>
            <div style="border-top: 1px solid #94a3b8; width: 150px; margin: 0 auto; padding-top: 5px; font-size: 14px; color: #475569;">Đại diện EduLearn</div>
          </div>
        </div>
      </div>

      <style>
        @media print {
          body * { visibility: hidden; }
          #swal2-html-container, #swal2-html-container * { visibility: visible; }
          #swal2-html-container { position: absolute; left: 0; top: 0; width: 100%; }
          .swal2-popup { box-shadow: none !important; }
          .swal2-actions { display: none !important; }
        }
      </style>
    `;

    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        html: certHtml,
        width: 800,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: '<i class="fa-solid fa-print"></i> In chứng chỉ',
        cancelButtonText: 'Đóng',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          window.print();
        }
      });
    });
  }
}
