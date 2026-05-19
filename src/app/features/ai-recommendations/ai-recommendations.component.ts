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
  selector: 'app-ai-recommendations',
  standalone: true,
  imports: [CommonModule, HeaderComponent, CourseCardComponent, RouterLink],
  template: `
    <app-header />
    <div class="ai-page">
      <div class="bg-glow glow-1"></div>
      <div class="bg-glow glow-2"></div>

      <div class="container" style="padding-top: 40px;">

        <div *ngIf="!authService.isLoggedIn()" class="empty-msg text-center mt-5" style="padding: 60px 20px;">
          <div class="icon-pulse mx-auto mb-3" style="width: 60px; height: 60px; font-size: 28px;"><i class="fa-solid fa-lock"></i></div>
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Đăng nhập để xem gợi ý</h2>
          <p style="color: var(--clr-text-muted);">Hệ thống AI cần phân tích hành vi của bạn để có thể đưa ra các khóa học phù hợp nhất.</p>
          <a routerLink="/login" class="btn-join" style="display: inline-block; margin-top: 16px;">Đăng nhập ngay</a>
        </div>

        <ng-container *ngIf="authService.isLoggedIn()">
          <section class="ai-section">
            <div class="section-header">
              <div class="icon-pulse"><i class="fa-solid fa-fire"></i></div>
              <div>
                <h2>Những khóa học thịnh hành nhất</h2>
                <p class="text-muted" style="margin-top: 4px; font-size: 14px;">Gợi ý dựa trên những học viên có sở thích tương đồng với bạn.</p>
              </div>
            </div>

            <div *ngIf="loadingTrending" class="course-grid">
              <div *ngFor="let i of skeletonCards" class="recommendation-skeleton"></div>
            </div>

            <div *ngIf="!loadingTrending && trendingCourses.length > 0" class="course-grid">
              <app-course-card
                *ngFor="let course of trendingCourses"
                [course]="course"
                [showCartBtn]="true">
              </app-course-card>
            </div>
            <div *ngIf="!loadingTrending && trendingCourses.length === 0" class="empty-msg">
              Chưa có đủ dữ liệu học viên tương đồng để đề xuất thịnh hành cho bạn.
            </div>
          </section>

          <section class="ai-section mt-5">
            <div class="section-header">
              <div class="icon-pulse blue"><i class="fa-solid fa-address-card"></i></div>
              <div>
                <h2>Người học tương tự bạn cũng xem</h2>
                <p class="text-muted" style="margin-top: 4px; font-size: 14px;">Đề xuất cá nhân hóa chuyên sâu dựa trên các đánh giá của bạn.</p>
              </div>
            </div>

            <div *ngIf="loadingProfile" class="course-grid">
              <div *ngFor="let i of skeletonCards" class="recommendation-skeleton"></div>
            </div>

            <div *ngIf="!loadingProfile && profileCourses.length > 0" class="course-grid">
              <app-course-card
                *ngFor="let course of profileCourses"
                [course]="course"
                [showCartBtn]="true">
              </app-course-card>
            </div>
            <div *ngIf="!loadingProfile && profileCourses.length === 0" class="empty-msg">
              Hãy tương tác và đánh giá thêm các khóa học để AI hiểu rõ hơn về sở thích của bạn.
            </div>
          </section>

          <section class="ai-section mt-5">
            <div class="section-header">
              <div class="icon-pulse" style="background: #f3e8ff; color: #a855f7;"><i class="fa-solid fa-layer-group"></i></div>
              <div>
                <h2>Gợi ý từ lộ trình học của bạn</h2>
                <p class="text-muted" style="margin-top: 4px; font-size: 14px;">Mở rộng từ tất cả các khóa học bạn đang theo học và đã hoàn thành.</p>
              </div>
            </div>

            <div *ngIf="loadingRelated" class="course-grid">
              <div *ngFor="let i of skeletonCards" class="recommendation-skeleton"></div>
            </div>

            <div *ngIf="!loadingRelated && relatedCourses.length > 0" class="course-grid">
              <app-course-card
                *ngFor="let course of relatedCourses"
                [course]="course"
                [showCartBtn]="true">
              </app-course-card>
            </div>
            <div *ngIf="!loadingRelated && relatedCourses.length === 0" class="empty-msg">
              Khi bạn ghi danh thêm khóa học, AI sẽ tự động phân tích và xây dựng lộ trình tiếp theo.
            </div>
          </section>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --clr-brand: #ea580c;
      --clr-brand-light: #fff7ed;
      --clr-ai-1: #8b5cf6;
      --clr-ai-2: #3b82f6;
      --clr-text-main: #1f2937;
      --clr-text-muted: #6b7280;
      --clr-bg-main: #f8fafc;
      --clr-white: #ffffff;
      --clr-border: #e2e8f0;
    }

    .ai-page {
      background-color: var(--clr-bg-main);
      min-height: 100vh;
      color: var(--clr-text-main);
      padding-bottom: 80px;
      position: relative;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      position: relative;
      z-index: 10;
    }

    /* Hiệu ứng đốm sáng mờ ảo ở background */
    .bg-glow {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
      border-radius: 50%;
      z-index: 0;
      pointer-events: none;
    }
    .glow-1 { top: -200px; left: -100px; }
    .glow-2 { top: 20%; right: -200px; background: radial-gradient(circle, rgba(234, 88, 12, 0.1) 0%, rgba(255, 255, 255, 0) 70%); }

    /* ===== Section Headers ===== */
    .section-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
    }
    .icon-pulse {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--clr-brand-light);
      color: var(--clr-brand);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .icon-pulse.blue { background: #eff6ff; color: var(--clr-ai-2); }
    .ai-section h2 { font-size: 20px; font-weight: 800; margin: 0;}
    .text-muted { color: var(--clr-text-muted); }
    .mt-5 { margin-top: 60px; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .text-center { text-align: center; }

    /* ===== Cards Grid ===== */
    .course-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .recommendation-skeleton {
      min-height: 280px;
      border-radius: 16px;
      border: 1px solid var(--clr-border);
      background: linear-gradient(110deg, #f8fafc 8%, #eef2ff 18%, #f8fafc 33%);
      background-size: 200% 100%;
      animation: loadingShimmer 1.4s linear infinite;
    }

    .empty-msg {
      border: 1px dashed #cbd5e1;
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      color: var(--clr-text-muted);
      background: rgba(255, 255, 255, 0.6);
      font-size: 15px;
    }

    .btn-join {
      background: var(--clr-brand-light);
      color: var(--clr-brand);
      border: 1px solid transparent;
      padding: 10px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-join:hover {
      background: var(--clr-brand);
      color: var(--clr-white);
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.2);
    }

    @keyframes loadingShimmer {
      to { background-position-x: -200%; }
    }

    @media (max-width: 1200px) {
      .course-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 900px) {
      .course-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .course-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AiRecommendationsComponent implements OnInit {
  public dataService = inject(DataService);
  public authService = inject(AuthService);
  private apiService = inject(ApiService);

  trendingCourses: any[] = [];
  profileCourses: any[] = [];
  relatedCourses: any[] = [];

  loadingTrending = false;
  loadingProfile = false;
  loadingRelated = false;

  skeletonCards = [1, 2, 3, 4];

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.apiService.getUserProfile().pipe(catchError(() => of(null))).subscribe((profile: any) => {
        const userId = Number(profile?.maNguoiDung ?? profile?.id ?? 0);
        if (userId) {
          this.loadTrending(userId);
          this.loadProfileBased(userId);
          this.loadRelatedFromAllEnrolled();
        }
      });
    }
  }

  // 1. Call API user-based (Có Fallback sang Popular Courses)
  private loadTrending(userId: number) {
    this.loadingTrending = true;

    this.apiService.getUserBasedRecommendations(userId).pipe(
      catchError(() => of([])) // Nếu lỗi mạng/API, bắt lỗi và trả về mảng rỗng để kích hoạt fallback
    ).subscribe((res: any) => {
      const mappedCourses = this.normalizeAndMap(res);

      // Nếu API user-based có trả về khóa học
      if (mappedCourses.length > 0) {
        this.trendingCourses = mappedCourses.slice(0, 4);
        this.loadingTrending = false;
      }
      // FALLBACK: Nếu không có ai tương đồng, gọi API lấy khóa học phổ biến
      else {
        this.apiService.getPopularCourses().pipe(
          catchError(() => of([])),
          finalize(() => this.loadingTrending = false) // Chỉ tắt loading khi quá trình fallback hoàn tất
        ).subscribe((popularRes: any) => {
          this.trendingCourses = this.normalizeAndMap(popularRes).slice(0, 4);
        });
      }
    });
  }

  // 2. Call API user-profile
  private loadProfileBased(userId: number) {
    this.loadingProfile = true;
    this.apiService.getUserProfileRecommendations(userId).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingProfile = false)
    ).subscribe((res: any) => {
      this.profileCourses = this.normalizeAndMap(res).slice(0, 8);
    });
  }

  // 3. Gộp điều kiện: Gợi ý khóa học liên quan từ TẤT CẢ các khóa học đã Enroll (Cả Đang học & Đã hoàn thành)
  private loadRelatedFromAllEnrolled() {
    this.loadingRelated = true;
    this.apiService.getMyCourses(1, 100).pipe(
      catchError(() => of({ data: [] })),
      finalize(() => this.loadingRelated = false)
    ).subscribe((res: any) => {
      const enrolled = Array.isArray(res) ? res : (res?.data || []);

      // Lấy danh sách ID mà KHÔNG lọc theo progress < 100
      const sourceCourseIds = enrolled
        .map((t: any) => Number(t?.khoaHoc?.maKhoaHoc ?? t?.maKhoaHoc ?? t?.courseId ?? t?.CourseId ?? 0))
        .filter(Boolean);

      if (!sourceCourseIds.length) {
        this.relatedCourses = [];
        return;
      }

      const uniqueSourceIds = [...new Set(sourceCourseIds)].slice(0, 6);

      forkJoin(
        uniqueSourceIds.map((courseId: any) =>
          this.apiService.getSimilarCourses(courseId).pipe(catchError(() => of([])))
        )
      ).subscribe((results: any[]) => {
        // Loại bỏ các khóa học mà người dùng đã mua rồi khỏi danh sách gợi ý
        const excludeIds = new Set<number>(sourceCourseIds as number[]);

        const merged = results
          .flatMap((group: any) => (Array.isArray(group) ? group : []))
          .map(item => this.mapCourse(item))
          .filter(course => !!course.id && !excludeIds.has(Number(course.id)));

        this.relatedCourses = this.dedupeAndSort(merged).slice(0, 8);
      });
    });
  }

  // Tiện ích để chuẩn hóa dữ liệu trả về từ Neo4j cho AppCourseCard
  private normalizeAndMap(res: any): any[] {
    const rawItems = Array.isArray(res) ? res : (res?.data || []);
    return this.dedupeAndSort(rawItems.map((item: any) => this.mapCourse(item)));
  }

  private mapCourse(item: any) {
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

  private dedupeAndSort(courses: any[]) {
    const bestById = new Map<number, any>();
    for (const course of courses) {
      const id = Number(course?.id ?? 0);
      if (!id) continue;
      const current = bestById.get(id);
      if (!current || Number(course?.score ?? 0) > Number(current?.score ?? 0)) {
        bestById.set(id, course);
      }
    }
    return Array.from(bestById.values()).sort((a, b) => Number(b?.score ?? 0) - Number(a?.score ?? 0));
  }

  private toSlug(str: string): string {
    return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  private formatCount(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return `${n}`;
  }
}
