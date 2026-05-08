import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, CourseCardComponent, PaginationComponent],
  template: `
    <app-header />
    <div class="container my-page">
      <h1><i class="fa-solid fa-book"></i> Học tập của tôi</h1>

      <!-- Stats -->
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

      <div *ngIf="dataService.enrolledCourses().length === 0" style="padding: 40px; text-align: center; background: var(--white); border-radius: var(--radius-lg); margin-bottom: 32px;">
         <div style="font-size: 48px; margin-bottom: 16px;"><i class="fa-solid fa-graduation-cap"></i></div>
         <h3>Bạn chưa đăng ký khóa học nào</h3>
         <p style="color: var(--gray-500); margin-bottom: 24px;">Hãy khám phá các khóa học thú vị và bắt đầu hành trình học tập của bạn.</p>
         <a routerLink="/course" class="btn btn-primary">Khám phá khóa học</a>
      </div>

      <!-- Current Courses -->
      <section class="section" *ngIf="dataService.enrolledCourses().length > 0">
        <h2>Khóa học đang học</h2>
        <div class="enrolled-grid">
          <div *ngFor="let ec of dataService.enrolledCourses()" class="enrolled-card card">
            <div class="ec-icon">
              <img *ngIf="ec.course?.image && ec.course!.image!.length > 5" [src]="ec.course?.image" (error)="ec.course!.image = ''" alt="course" style="width: 100%; height: 100%; object-fit: cover;">
              <div *ngIf="!ec.course?.image || ec.course!.image!.length <= 5" style="font-size: 32px; display:flex; justify-content:center; align-items:center; width:100%; height:100%"><i class="fa-solid fa-box"></i></div>
            </div>
            <div class="ec-info">
              <h3>{{ ec.course?.title }}</h3>
              <p>{{ ec.course?.instructor }} • {{ ec.course?.modules }} chương</p>
              <div class="date-info" *ngIf="ec.endDate">
                 <span [class.text-danger]="isExpired(ec.endDate)">Ngày kết thúc: {{ ec.endDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <span class="progress-text">Tiến độ: {{ ec.progress }}%</span>
              <div class="progress-bar"><div class="fill" [style.width.%]="ec.progress"></div></div>
            </div>
            <a [routerLink]="['/learn', ec.course?.id || 'course', 'lesson', 1]" class="btn btn-primary btn-sm">► Tiếp tục</a>
          </div>
        </div>
        
        <!-- Pagination -->
        <app-pagination 
          [currentPage]="dataService.currentMyCoursesPage()"
          [totalItems]="dataService.myCoursesTotal()"
          [pageSize]="10"
          (pageChange)="onPageChange($event)">
        </app-pagination>
      </section>

      <!-- Certificates -->
      <section class="section" *ngIf="dataService.certificates().length > 0">
        <div class="section-header">
          <h2><i class="fa-solid fa-trophy"></i> Chứng chỉ của tôi</h2>
          <button class="btn btn-outline btn-sm" (click)="showAllCertificates = !showAllCertificates">
            {{ showAllCertificates ? 'Thu gọn' : 'Xem tất cả (' + dataService.certificates().length + ')' }}
          </button>
        </div>
        <div class="cert-grid" *ngIf="showAllCertificates">
          <div *ngFor="let cert of dataService.certificates()" class="cert-card card">
            <div class="cert-icon-modern"><i class="fa-solid fa-certificate"></i></div>
            <div class="cert-info">
              <strong>{{ cert.courseName }}</strong>
              <span>{{ cert.source }} • {{ cert.date }}</span>
            </div>
            <button class="btn btn-primary btn-sm"><i class="fa-solid fa-download"></i> Tải về</button>
          </div>
        </div>
      </section>

      <!-- AI Suggestions -->
      <section class="section">
        <h2> AI gợi ý học tiếp</h2>
        <div class="course-grid">
          <app-course-card *ngFor="let c of dataService.courses().slice(0, 4)" [course]="c" [showCartBtn]="true" />
        </div>
      </section>
    </div>
  `,
  styles: [`
    .my-page { padding: 24px 0 60px; min-height: calc(100vh - 72px); }
    .my-page h1 { font-size: 22px; margin-bottom: 20px; }
    .my-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 36px;
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
    
    .stat-footer {
      font-size: 12px;
      color: var(--success);
      margin-top: 4px;
    }
    .section { margin-bottom: 32px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h2 { font-size: 18px; font-weight: 700; margin: 0; }
    .enrolled-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .enrolled-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }
    .ec-icon {
      width: 60px; height: 60px;
      background: var(--primary-bg);
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .ec-info { flex: 1; }
    .ec-info h3 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
    .ec-info p { font-size: 12px; color: var(--gray-500); margin-bottom: 6px; }
    .date-info { font-size: 12px; margin-bottom: 6px; }
    .text-danger { color: #dc3545; font-weight: bold; }
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

    .course-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
  `]
})
export class MyCoursesComponent implements OnInit {
  public dataService = inject(DataService);
  private authService = inject(AuthService);

  showAllCertificates = false;

  get completedCoursesCount() {
    return this.dataService.enrolledCourses().filter(c => c.progress === 100).length;
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.dataService.loadMyCourses();
      this.dataService.loadCertificates();
    }
  }

  onPageChange(page: number) {
    this.dataService.loadMyCourses(page);
  }

  isExpired(dateString?: string): boolean {
    if (!dateString) return false;
    return new Date(dateString).getTime() < new Date().getTime();
  }
}
