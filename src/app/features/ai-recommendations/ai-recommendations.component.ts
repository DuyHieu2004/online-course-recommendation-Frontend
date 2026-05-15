import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ai-recommendations',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink],
  template: `
    <app-header></app-header>
    <div class="ai-page">
      <!-- Glow background effects -->
      <div class="bg-glow glow-1"></div>
      <div class="bg-glow glow-2"></div>

      <div class="container">
        <!-- Hero Section -->
        <header class="ai-hero">
          <div class="ai-badge-top">
            <i class="fa-solid fa-wand-magic-sparkles"></i> AI Powered Discovery
          </div>
          <h1>Gợi ý lộ trình <span class="text-gradient">Học tập Cá nhân</span></h1>
          <p class="ai-desc">
            Hệ thống AI của EduLearn đã phân tích kỹ năng và sở thích của bạn để đưa ra những đề xuất phù hợp nhất.
          </p>
        </header>

        <!-- Interests Selection (If logged in) -->
        <section class="interests-section" *ngIf="auth.isLoggedIn()">
           <div class="section-header">
            <div class="icon-pulse orange"><i class="fa-solid fa-heart"></i></div>
            <h2>Lĩnh vực bạn quan tâm</h2>
            <button class="btn-edit-interests" (click)="toggleEditInterests()">
               {{ isEditingInterests ? 'Lưu lại' : 'Chỉnh sửa' }}
            </button>
          </div>
          
          <div class="interests-chips">
            <div *ngFor="let cat of dataService.categoriesRaw()" 
                 class="chip" 
                 [class.active]="isInterest(cat.maTheLoai)"
                 (click)="toggleInterest(cat.maTheLoai)">
              {{ cat.ten }}
              <i class="fa-solid fa-check" *ngIf="isInterest(cat.maTheLoai)"></i>
            </div>
          </div>
        </section>

        <!-- Loading State -->
        <div class="loading-wrapper" *ngIf="loading()">
           <div class="shimmer-card" *ngFor="let i of [1,2,3]"></div>
        </div>

        <ng-container *ngIf="!loading()">
          <!-- Section 1: Top Matches (Content-Based) -->
          <section class="ai-section" *ngIf="personalizedCourses().length > 0">
            <div class="section-header">
              <div class="icon-pulse purple"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
              <h2>Gợi ý cá nhân hoá</h2>
              <span class="section-tag">Dựa trên sở thích của bạn</span>
            </div>
            
            <div class="ai-grid top-grid">
              <div *ngFor="let course of personalizedCourses()" class="ai-card">
                <div class="ai-card-image" [style.background-image]="course.image ? 'url(' + course.image + ')' : ''">
                  <div class="match-badge">
                    <span class="sparkle-icon">✨</span> {{ (course.score * 100) | number:'1.0-0' }}% Phù hợp
                  </div>
                </div>
                
                <div class="ai-card-body">
                  <h3 [routerLink]="['/course', course.id]">{{ course.title }}</h3>
                  <p class="ai-instructor"><i class="fa-solid fa-chalkboard-user"></i> {{ course.instructor }}</p>
                  
                  <div class="ai-stats">
                    <span><i class="fa-solid fa-star"></i> {{ course.averageRating || 5 }}</span>
                    <span><i class="fa-solid fa-users"></i> {{ course.totalReviews || 0 }} đánh giá</span>
                  </div>
                  
                  <div class="ai-card-footer">
                    <span class="ai-price">{{ course.originalPrice | number }}đ</span>
                    <button class="btn-add-cart" (click)="addToCart(course.id)">
                      <i class="fa-solid fa-cart-plus"></i> Thêm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 2: Trending Courses -->
          <section class="ai-section mt-5" *ngIf="trendingCourses().length > 0">
            <div class="section-header">
              <div class="icon-pulse orange"><i class="fa-solid fa-fire"></i></div>
              <h2>Xu hướng hiện nay</h2>
            </div>
            
            <div class="ai-carousel">
              <div *ngFor="let course of trendingCourses()" class="ai-card-sm">
                <div class="ai-sm-image" [style.background-image]="course.image ? 'url(' + course.image + ')' : ''">
                   <div class="trending-tag">HOT</div>
                </div>
                <div class="ai-sm-body">
                  <h4 [routerLink]="['/course', course.id]">{{ course.title }}</h4>
                  <div class="ai-card-footer-sm">
                    <span class="ai-price-sm">{{ course.price | number }}đ</span>
                    <button class="btn-cart-sm" (click)="addToCart(course.id)"><i class="fa-solid fa-plus"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 3: Collaborative Filtering -->
          <section class="ai-section mt-5" *ngIf="collaborativeCourses().length > 0">
            <div class="section-header">
              <div class="icon-pulse blue"><i class="fa-solid fa-people-group"></i></div>
              <h2>Người học tương tự bạn cũng xem</h2>
            </div>
            
            <div class="ai-carousel">
              <div *ngFor="let course of collaborativeCourses()" class="ai-card-sm">
                <div class="ai-sm-image" [style.background-image]="course.image ? 'url(' + course.image + ')' : ''">
                   <div class="match-badge-sm">{{ (course.score * 100) | number:'1.0-0' }}%</div>
                </div>
                <div class="ai-sm-body">
                  <h4 [routerLink]="['/course', course.id]">{{ course.title }}</h4>
                  <div class="ai-card-footer-sm">
                    <span class="ai-price-sm">{{ course.originalPrice | number }}đ</span>
                    <button class="btn-cart-sm" (click)="addToCart(course.id)"><i class="fa-solid fa-plus"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 3: Trending (Empty State Fallback) -->
          <section class="ai-section mt-5" *ngIf="personalizedCourses().length === 0 && collaborativeCourses().length === 0 && trendingCourses().length === 0 && !loading()">
             <div class="empty-ai">
                <i class="fa-solid fa-robot"></i>
                <h3>Bạn chưa có lịch sử học tập?</h3>
                <p>Hãy chọn những lĩnh vực bạn quan tâm phía trên hoặc bắt đầu khám phá các khóa học phổ biến để AI có thể hiểu bạn hơn.</p>
                <a routerLink="/course" class="btn-browse">Khám phá ngay</a>
             </div>
          </section>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
    :host {
      --clr-brand: #ea580c;
      --clr-brand-light: #fff7ed;
      --clr-ai-1: #8b5cf6; 
      --clr-ai-2: #3b82f6;
      --clr-text-main: #1f2937;
      --clr-text-muted: #6b7280;
      --clr-bg-main: #f8fafc;
      --clr-white: #ffffff;
      --shadow-soft: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }

    .ai-page {
      background-color: var(--clr-bg-main);
      min-height: 100vh;
      padding-bottom: 80px;
      position: relative;
      overflow: hidden;
    }

    .container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0 24px;
      position: relative;
      z-index: 10;
    }

    .bg-glow {
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      z-index: 0;
      pointer-events: none;
      filter: blur(80px);
    }
    .glow-1 { top: -200px; left: -100px; background: rgba(139, 92, 246, 0.1); }
    .glow-2 { top: 40%; right: -200px; background: rgba(234, 88, 12, 0.08); }

    .ai-hero {
      padding: 80px 0 60px;
      text-align: center;
      max-width: 900px;
      margin: 0 auto;
    }

    .ai-badge-top {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(139, 92, 246, 0.1);
      color: var(--clr-ai-1);
      padding: 8px 24px;
      border-radius: 40px;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 24px;
      border: 1px solid rgba(139, 92, 246, 0.2);
    }

    .ai-hero h1 {
      font-size: 56px;
      font-weight: 900;
      margin-bottom: 20px;
      letter-spacing: -2px;
    }

    .text-gradient {
      background: linear-gradient(135deg, var(--clr-ai-1) 0%, var(--clr-ai-2) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .ai-desc {
      font-size: 18px;
      color: var(--clr-text-muted);
      line-height: 1.6;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
    }
    .icon-pulse {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .purple { background: #f5f3ff; color: var(--clr-ai-1); }
    .blue { background: #eff6ff; color: var(--clr-ai-2); }
    .orange { background: #fff7ed; color: var(--clr-brand); }

    .ai-section h2 { font-size: 28px; font-weight: 800; }
    .section-tag {
       background: #f1f5f9;
       color: #64748b;
       padding: 4px 12px;
       border-radius: 6px;
       font-size: 12px;
       font-weight: 600;
       text-transform: uppercase;
    }

    .interests-section {
       background: white;
       padding: 32px;
       border-radius: 24px;
       margin-bottom: 60px;
       border: 1px solid #f1f5f9;
       box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    }

    .btn-edit-interests {
       margin-left: auto;
       background: none;
       border: 1px solid var(--clr-brand);
       color: var(--clr-brand);
       padding: 8px 20px;
       border-radius: 10px;
       font-weight: 600;
       cursor: pointer;
       transition: all 0.2s;
    }
    .btn-edit-interests:hover {
       background: var(--clr-brand);
       color: white;
    }

    .interests-chips {
       display: flex;
       flex-wrap: wrap;
       gap: 12px;
    }
    .chip {
       padding: 10px 24px;
       background: #f8fafc;
       border: 1px solid #e2e8f0;
       border-radius: 50px;
       font-size: 14px;
       font-weight: 600;
       cursor: pointer;
       transition: all 0.2s;
       display: flex;
       align-items: center;
       gap: 8px;
    }
    .chip:hover {
       border-color: var(--clr-brand);
       background: var(--clr-brand-light);
    }
    .chip.active {
       background: var(--clr-brand);
       color: white;
       border-color: var(--clr-brand);
       box-shadow: 0 4px 12px rgba(234, 88, 12, 0.2);
    }

    .ai-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 32px;
    }

    .ai-card {
      background: white;
      border-radius: 24px;
      border: 1px solid #f1f5f9;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-soft);
    }
    .ai-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.06);
    }

    .ai-card-image {
      height: 220px;
      background-size: cover;
      background-position: center;
      position: relative;
    }

    .match-badge {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(4px);
      color: var(--clr-ai-1);
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ai-card-body { padding: 28px; }
    .ai-card-body h3 { 
       font-size: 22px; 
       font-weight: 800; 
       margin-bottom: 12px;
       cursor: pointer;
    }
    .ai-card-body h3:hover { color: var(--clr-brand); }

    .ai-instructor { font-size: 15px; color: var(--clr-text-muted); margin-bottom: 16px; }
    .ai-stats {
       display: flex;
       gap: 16px;
       font-size: 14px;
       color: #64748b;
       margin-bottom: 24px;
    }
    .ai-stats i { color: #fbbf24; }

    .ai-card-footer {
       display: flex;
       justify-content: space-between;
       align-items: center;
       padding-top: 20px;
       border-top: 1px solid #f1f5f9;
    }
    .ai-price { font-size: 24px; font-weight: 900; color: var(--clr-text-main); }

    .btn-add-cart {
       background: var(--clr-brand);
       color: white;
       border: none;
       padding: 12px 24px;
       border-radius: 14px;
       font-weight: 700;
       cursor: pointer;
       transition: all 0.2s;
    }
    .btn-add-cart:hover { transform: scale(1.05); }

    /* Small Cards Carousel */
    .ai-carousel {
       display: flex;
       gap: 20px;
       overflow-x: auto;
       padding: 10px 0 30px;
    }
    .ai-carousel::-webkit-scrollbar { height: 4px; }
    .ai-carousel::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

    .ai-card-sm {
       min-width: 260px;
       background: white;
       border-radius: 20px;
       border: 1px solid #f1f5f9;
       overflow: hidden;
    }
    .ai-sm-image {
       height: 140px;
       background-size: cover;
       background-position: center;
       position: relative;
    }
    .match-badge-sm {
       position: absolute;
       bottom: 10px;
       left: 10px;
       background: var(--clr-ai-2);
       color: white;
       padding: 4px 10px;
       border-radius: 8px;
       font-size: 11px;
       font-weight: 700;
    }
    .trending-tag {
       position: absolute;
       top: 10px;
       left: 10px;
       background: #ef4444;
       color: white;
       padding: 4px 8px;
       border-radius: 6px;
       font-size: 10px;
       font-weight: 800;
       letter-spacing: 0.5px;
    }
    .ai-sm-body { padding: 16px; }
    .ai-sm-body h4 { font-size: 16px; font-weight: 700; margin-bottom: 12px; height: 44px; overflow: hidden; cursor: pointer; }
    .ai-card-footer-sm { display: flex; justify-content: space-between; align-items: center; }
    .ai-price-sm { font-weight: 800; color: var(--clr-text-main); }
    .btn-cart-sm {
       width: 32px; height: 32px; border-radius: 8px; background: #f1f5f9; border: none; cursor: pointer;
    }

    .empty-ai {
       text-align: center;
       padding: 60px;
       background: white;
       border-radius: 30px;
       border: 2px dashed #e2e8f0;
    }
    .empty-ai i { font-size: 64px; color: #cbd5e1; margin-bottom: 24px; }
    .btn-browse {
       display: inline-block;
       margin-top: 24px;
       background: var(--clr-brand);
       color: white;
       padding: 12px 32px;
       border-radius: 12px;
       text-decoration: none;
       font-weight: 700;
    }

    .shimmer-card {
       height: 350px;
       background: #f1f5f9;
       border-radius: 24px;
       animation: shimmer 1.5s infinite linear;
    }
    @keyframes shimmer {
       0% { opacity: 0.5; }
       50% { opacity: 0.8; }
       100% { opacity: 0.5; }
    }
    .mt-5 { margin-top: 60px; }
    `
  ]
})
export class AiRecommendationsComponent implements OnInit {
  api = inject(ApiService);
  auth = inject(AuthService);
  dataService = inject(DataService);

  personalizedCourses = signal<any[]>([]);
  collaborativeCourses = signal<any[]>([]);
  trendingCourses = signal<any[]>([]);
  userInterests = signal<number[]>([]);

  loading = signal(true);
  isEditingInterests = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    const requests: any = {
      trending: this.api.getCourses({ sortBy: 'popular', pageSize: 12 }).pipe(catchError(() => of({ data: [] }))),
      interests: this.auth.isLoggedIn() ? this.api.getUserInterests().pipe(catchError(() => of([]))) : of([])
    };

    const userId = this.auth.currentUser()?.userId;
    if (this.auth.isLoggedIn() && userId) {
      requests.personalized = this.api.getUserProfileRecommendations(userId).pipe(catchError(() => of([])));
      requests.collaborative = this.api.getUserBasedRecommendations(userId).pipe(catchError(() => of([])));
    }

    forkJoin(requests).subscribe({
      next: (res: any) => {
        console.log('AI Recommendations Data:', res);
        // Map personalized
        if (res.personalized) {
          this.personalizedCourses.set(res.personalized.map((c: any) => ({
            ...c,
            id: c.id || c.courseId || c.CourseId,
            title: c.title || c.Title,
            image: c.image || c.Image || c.anhUrl,
            score: c.score || c.Score || 0,
            instructor: c.instructor || c.Instructor || 'Chưa có',
            averageRating: c.averageRating || c.AverageRating || 5,
            totalReviews: c.totalReviews || c.TotalReviews || 0,
            originalPrice: c.originalPrice || c.OriginalPrice || 0
          })));
        }

        // Map collaborative
        if (res.collaborative) {
          this.collaborativeCourses.set(res.collaborative.map((c: any) => ({
            ...c,
            id: c.id || c.courseId || c.CourseId,
            title: c.title || c.Title,
            image: c.image || c.Image || c.anhUrl,
            score: c.score || c.Score || 0,
            originalPrice: c.originalPrice || c.OriginalPrice || 0
          })));
        }

        // Map trending from PaginatedResponse
        if (res.trending) {
          const trending = (res.trending.data || []).map((c: any) => ({
            ...c,
            id: c.maKhoaHoc,
            title: c.tieuDe,
            image: c.anhUrl,
            price: c.giaGoc,
            averageRating: c.tbdanhGia || 5,
            totalReviews: c.soLuongDanhGia || 0
          }));
          this.trendingCourses.set(trending);
        }

        if (res.interests) {
          this.userInterests.set((res.interests || []).map((i: any) => i.maTheLoai));
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('AI Recommendations load error:', err);
        this.loading.set(false);
      }
    });
  }

  toggleEditInterests() {
    if (this.isEditingInterests) {
      // Save
      this.api.updateUserInterests(this.userInterests()).subscribe({
        next: () => {
          this.isEditingInterests = false;
          this.loadData(); // Reload recommendations
        }
      });
    } else {
      this.isEditingInterests = true;
    }
  }

  isInterest(catId: number): boolean {
    return this.userInterests().includes(catId);
  }

  toggleInterest(catId: number) {
    if (!this.isEditingInterests) return;

    this.userInterests.update(current => {
      if (current.includes(catId)) {
        return current.filter(id => id !== catId);
      } else {
        return [...current, catId];
      }
    });
  }

  addToCart(courseId: number) {
    this.dataService.addToCart(courseId).subscribe();
  }
}
