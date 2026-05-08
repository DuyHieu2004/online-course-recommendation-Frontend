import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, CourseCardComponent],
  template: `
    <app-header />

    <section class="hero-premium">
      <div class="container hero-container">
        
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-dot"></span> Khám phá tiềm năng của bạn
          </div>
          
          <h1 class="hero-title">
            Hành Trình Tri Thức <br> Bắt đầu từ đây
          </h1>
          
          <p class="hero-subtitle">
            Hàng ngàn khóa học chất lượng cao với lộ trình tối ưu được cá nhân hóa bằng <strong>Trợ lý AI</strong>. Nâng tầm sự nghiệp của bạn ngay hôm nay!
          </p>
          
          <div class="hero-search-bar">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="searchCourses()" placeholder="Bạn muốn học gì? (VD: React, Python...)">
            <button (click)="searchCourses()" class="btn-search">Khám phá</button>
          </div>
          
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">10k+</span>
              <span class="stat-label">Khóa học</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">500k+</span>
              <span class="stat-label">Học viên</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">4.8/5</span>
              <span class="stat-label">Đánh giá</span>
            </div>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="visual-wrapper">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop" alt="Students learning" class="main-image">
            
            <div class="widget-card widget-ai">
              <div class="widget-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
              <div class="widget-text">AI Đề xuất <br><strong>Chính xác 98%</strong></div>
            </div>
            
            <div class="widget-card widget-users">
              <div class="avatar-group">
                <img src="https://i.pravatar.cc/150?img=1" alt="student">
                <img src="https://i.pravatar.cc/150?img=2" alt="student">
                <img src="https://i.pravatar.cc/150?img=3" alt="student">
              </div>
              <div class="widget-text"><strong>+2k</strong> Học viên mới hôm nay</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-clean bg-gray-50">
      <div class="container">
        <div class="section-header center">
           <h2 class="section-title">Lựa chọn khóa học đa dạng</h2>
           <p class="section-subtitle">Chinh phục các kỹ năng mới với lộ trình được thiết kế chuẩn quốc tế.</p>
        </div>
        
        <div class="clean-tabs-nav">
          <button *ngFor="let cat of getTopCategories()" 
                  class="tab-btn" 
                  [class.active]="selectedTab === cat.ten"
                  (click)="selectTab(cat.ten)">
            {{ cat.ten }}
          </button>
        </div>

        <div class="tab-content-wrapper">
          <div class="tab-header-flex">
             <div>
               <h3 class="tab-category-title">Nâng cao kỹ năng: <span class="text-brand">{{ selectedTab }}</span></h3>
               <p class="tab-category-desc">Khám phá hàng loạt các khóa học {{ selectedTab }} chuyên sâu để đáp ứng nhu cầu tuyển dụng.</p>
             </div>
             <a (click)="goToCategory(selectedTab)" class="btn-outline">Xem tất cả <i class="fa-solid fa-arrow-right"></i></a>
          </div>

          <div class="carousel-container">
            <button class="nav-btn left" (click)="scrollCarousel(tabCarousel, -600)"><i class="fa-solid fa-chevron-left"></i></button>
            <div class="carousel-viewport" #tabCarousel>
              <div class="carousel-track">
                <div class="course-col" *ngFor="let course of tabCourses">
                  <app-course-card [course]="course" />
                </div>
                
                <div class="empty-state" *ngIf="!loadingTab && tabCourses.length === 0">
                  <i class="fa-regular fa-folder-open empty-icon"></i>
                  <p>Chưa có khóa học nào trong danh mục này.</p>
                </div>
                
                <div class="loading-state" *ngIf="loadingTab">
                  <div class="spinner"></div>
                  <p>Đang tải dữ liệu...</p>
                </div>
              </div>
            </div>
            <button class="nav-btn right" (click)="scrollCarousel(tabCarousel, 600)"><i class="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </section>

    <section class="section-clean">
      <div class="container">
        <div class="section-header">
           <h2 class="section-title">Học viên đang quan tâm</h2>
           <p class="section-subtitle">Những khóa học thịnh hành nhất và được đánh giá cao nhất.</p>
        </div>
        
        <div class="carousel-container">
          <button class="nav-btn left" (click)="scrollCarousel(popularCarousel, -600)"><i class="fa-solid fa-chevron-left"></i></button>
          <div class="carousel-viewport" #popularCarousel>
            <div class="carousel-track">
              <div class="course-col" *ngFor="let course of dataService.courses().slice(0, 10)">
                <app-course-card [course]="course" />
              </div>
            </div>
          </div>
          <button class="nav-btn right" (click)="scrollCarousel(popularCarousel, 600)"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>
    </section>

    <section class="section-clean bg-gray-50 section-bottom">
      <div class="container">
        <div class="section-header center">
           <h2 class="section-title">Danh mục nổi bật</h2>
           <p class="section-subtitle">Lựa chọn lĩnh vực bạn yêu thích và bắt đầu hành trình.</p>
        </div>
        
        <div class="category-grid">
          <div class="category-card" *ngFor="let cat of getHighlightCategories()" (click)="goToCategory(cat.ten)">
            <div class="cat-image">
              <img [src]="cat.image" [alt]="cat.ten">
              <div class="cat-overlay"></div>
            </div>
            <div class="cat-content">
              <h3>{{ cat.ten }}</h3>
              <span class="cat-link">Khám phá <i class="fa-solid fa-arrow-right"></i></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* BẢNG MÀU CHUẨN EDULEARN - KHÔNG XÀI TÍM HỒNG NỮA */
    :host {
      --clr-brand: #ea580c; /* Cam chủ đạo */
      --clr-brand-hover: #c2410c;
      --clr-brand-light: #fff7ed;
      --clr-text-main: #0f172a; /* Slate 900 - Đen sang trọng */
      --clr-text-muted: #64748b; /* Slate 500 - Xám dịu */
      --clr-bg-main: #ffffff;
      --clr-bg-alt: #f8fafc; /* Slate 50 */
      --clr-border: #e2e8f0;
      
      --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
      --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05);
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05);
      --radius-md: 12px;
      --radius-lg: 24px;
      
      font-family: 'Inter', -apple-system, sans-serif;
    }
    
    .text-brand { color: var(--clr-brand); }
    .bg-gray-50 { background-color: var(--clr-bg-alt); }

    /* ===== Hero Section (Sạch sẽ, Tinh tế) ===== */
    .hero-premium {
      background-color: var(--clr-bg-main);
      padding: 80px 0 100px;
      position: relative;
    }

    .hero-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 60px;
    }

    .hero-content {
      flex: 1;
      max-width: 620px;
      position: relative;
      z-index: 10;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      background: var(--clr-brand-light);
      color: var(--clr-brand);
      border-radius: 100px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 24px;
      border: 1px solid rgba(234, 88, 12, 0.2);
    }
    .badge-dot {
      width: 8px; height: 8px;
      background-color: var(--clr-brand);
      border-radius: 50%;
    }

    .hero-title {
      font-size: 56px;
      font-weight: 800;
      line-height: 1.15;
      color: var(--clr-text-main);
      margin-bottom: 24px;
      letter-spacing: -1px;
    }

    .hero-subtitle {
      font-size: 18px;
      color: var(--clr-text-muted);
      line-height: 1.6;
      margin-bottom: 40px;
    }

    /* Thanh Search chuẩn SaaS */
    .hero-search-bar {
      display: flex;
      align-items: center;
      background: var(--clr-bg-main);
      border: 1px solid var(--clr-border);
      border-radius: 100px;
      padding: 8px 8px 8px 24px;
      margin-bottom: 48px;
      box-shadow: var(--shadow-md);
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .hero-search-bar:focus-within {
      box-shadow: 0 0 0 3px var(--clr-brand-light);
      border-color: var(--clr-brand);
    }
    .search-icon { color: var(--clr-text-muted); font-size: 18px; }
    .hero-search-bar input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 12px 16px;
      font-size: 16px;
      outline: none;
      color: var(--clr-text-main);
    }
    .btn-search {
      background: var(--clr-brand);
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 100px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-search:hover { background: var(--clr-brand-hover); }

    /* Thống kê */
    .hero-stats {
      display: flex;
      align-items: center;
      gap: 40px;
      padding-bottom: 10px; /* Thêm padding nhẹ để không bị dính lề */
    }
    .stat-item { display: flex; flex-direction: column; }
    .stat-number { font-size: 28px; font-weight: 800; color: var(--clr-text-main); }
    .stat-label { font-size: 14px; color: var(--clr-text-muted); font-weight: 500; }
    .stat-divider { width: 1px; height: 40px; background: var(--clr-border); }

    /* Hình ảnh Hero (Khung ảnh sạch sẽ, không hiệu ứng lóa) */
    .hero-visual {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      position: relative;
    }
    .visual-wrapper {
      position: relative;
      width: 100%;
      max-width: 520px;
    }
    .main-image {
      width: 100%;
      height: auto;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      display: block;
    }

    /* Widgets trôi nhẹ nhàng, style Flat */
    .widget-card {
      position: absolute;
      background: var(--clr-bg-main);
      padding: 16px 20px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--clr-border);
      z-index: 2;
    }
    .widget-ai { top: 40px; left: -40px; }
    .widget-users { bottom: 40px; right: -20px; }
    
    .widget-icon {
      width: 40px; height: 40px;
      background: var(--clr-brand-light);
      color: var(--clr-brand);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
    }
    .widget-text { font-size: 13px; color: var(--clr-text-muted); line-height: 1.4; }
    .widget-text strong { color: var(--clr-text-main); font-size: 14px;}
    
    .avatar-group { display: flex; align-items: center; }
    .avatar-group img { width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; margin-left: -10px; }
    .avatar-group img:first-child { margin-left: 0; }

    /* ===== Chung cho các Section ===== */
    .section-clean { padding: 80px 0; }
    .section-bottom { padding-bottom: 120px; }
    .section-header { margin-bottom: 40px; }
    .section-header.center { text-align: center; }
    .section-title { font-size: 32px; font-weight: 800; color: var(--clr-text-main); margin-bottom: 12px; }
    .section-subtitle { font-size: 18px; color: var(--clr-text-muted); }

    /* ===== Tab Navigation (Đơn giản, Tinh Tế) ===== */
    .clean-tabs-nav {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scrollbar-width: none;
      margin-bottom: 32px;
      padding-bottom: 8px;
      justify-content: center;
    }
    .clean-tabs-nav::-webkit-scrollbar { display: none; }
    
    .tab-btn {
      padding: 10px 24px;
      background: transparent;
      color: var(--clr-text-muted);
      border: 1px solid var(--clr-border);
      border-radius: 100px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    }
    .tab-btn:hover { border-color: #cbd5e1; color: var(--clr-text-main); }
    
    /* Tab Active màu Cam rực rỡ */
    .tab-btn.active {
      background: var(--clr-brand);
      color: white;
      border-color: var(--clr-brand);
    }

    .tab-content-wrapper {
      background: var(--clr-bg-main);
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      padding: 40px;
      box-shadow: var(--shadow-sm);
    }

    .tab-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 32px;
    }
    .tab-category-title { font-size: 24px; font-weight: 800; margin-bottom: 8px; color: var(--clr-text-main); }
    .tab-category-desc { color: var(--clr-text-muted); font-size: 15px; }

    .btn-outline {
      padding: 8px 20px;
      border: 1px solid var(--clr-border);
      color: var(--clr-text-main);
      border-radius: 100px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }
    .btn-outline:hover { border-color: var(--clr-brand); color: var(--clr-brand); background: var(--clr-brand-light); }

    /* ===== Carousel ===== */
    .carousel-container { position: relative; }
    .carousel-viewport {
      overflow-x: auto;
      scroll-behavior: smooth;
      scrollbar-width: none;
      padding-bottom: 24px;
      margin: 0 -12px;
    }
    .carousel-viewport::-webkit-scrollbar { display: none; }
    .carousel-track { display: flex; }
    .course-col {
      flex: 0 0 calc(25% - 24px);
      min-width: 280px;
      margin: 0 12px;
    }

    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--clr-bg-main);
      color: var(--clr-text-main);
      border: 1px solid var(--clr-border);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      box-shadow: var(--shadow-md);
      transition: all 0.2s ease;
    }
    .nav-btn:hover { color: var(--clr-brand); border-color: var(--clr-brand); }
    .nav-btn.left { left: -24px; }
    .nav-btn.right { right: -24px; }

    /* Trạng thái trống / Đang tải */
    .empty-state, .loading-state { width: 100%; padding: 60px 20px; text-align: center; color: var(--clr-text-muted); }
    .empty-icon { font-size: 40px; margin-bottom: 16px; color: #cbd5e1; }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid var(--clr-border);
      border-top-color: var(--clr-brand);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* ===== Categories Grid ===== */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    .category-card {
      background: var(--clr-bg-main);
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--clr-border);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
      border-color: #cbd5e1;
    }
    .cat-image {
      position: relative;
      width: 100%;
      height: 160px;
      overflow: hidden;
    }
    .cat-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
    .category-card:hover .cat-image img { transform: scale(1.05); }
    
    .cat-overlay {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 100%);
    }
    .cat-content {
      position: absolute;
      bottom: 0; left: 0; width: 100%;
      padding: 20px;
      color: white;
      z-index: 2;
    }
    .cat-content h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .cat-link {
      font-size: 13px; font-weight: 600;
      color: var(--clr-brand-light);
      display: flex; align-items: center; gap: 6px;
      opacity: 0; transform: translateY(10px);
      transition: all 0.3s;
    }
    .category-card:hover .cat-link { opacity: 1; transform: translateY(0); }

    /* ===== Responsive Adjustments ===== */
    @media (max-width: 1024px) {
      .hero-container { flex-direction: column; text-align: center; gap: 40px;}
      .hero-title { font-size: 48px; }
      .hero-visual { justify-content: center; }
      .widget-ai { left: 0; }
      .widget-users { right: 0; }
      .course-col { flex: 0 0 calc(33.333% - 24px); }
      .category-grid { grid-template-columns: repeat(2, 1fr); }
      .clean-tabs-nav { justify-content: flex-start; }
    }
    @media (max-width: 768px) {
      .hero-stats { justify-content: center; }
      .tab-header-flex { flex-direction: column; align-items: flex-start; gap: 16px; }
      .course-col { flex: 0 0 calc(50% - 24px); min-width: 240px;}
      .tab-content-wrapper { padding: 24px; }
    }
    @media (max-width: 480px) {
      .hero-title { font-size: 36px; }
      .course-col { flex: 0 0 calc(85% - 24px); }
      .category-grid { grid-template-columns: 1fr; }
    }
  `]
})



export class HomeComponent {
  selectedTab = '';
  tabCourses: any[] = [];
  loadingTab = false;
  searchQuery = '';

  private router = inject(Router);

  constructor(public dataService: DataService) {
    // When categories load, select the first one as default tab
    setTimeout(() => {
      const topCats = this.getTopCategories();
      if (topCats.length > 0) {
        this.selectTab(topCats[0].ten);
      }
    }, 500);
  }

  getTopCategories() {
    return this.dataService.categoriesRaw().slice(0, 6);
  }

  getHighlightCategories() {
    const cats = this.dataService.categoriesRaw().slice(0, 8);
    // Assign generic placeholder images for categories
    const images = [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=200&auto=format&fit=crop', // IT
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=200&auto=format&fit=crop', // Business
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=200&auto=format&fit=crop', // Design
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=200&auto=format&fit=crop', // Marketing
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=200&auto=format&fit=crop',
    ];
    return cats.map((c, i) => ({ ...c, image: images[i % images.length] }));
  }

  selectTab(catName: string) {
    this.selectedTab = catName;
    this.loadingTab = true;
    
    let categoryId: number | undefined = undefined;
    const rawCat = this.dataService.categoriesRaw().find(c => {
       const name = c.ten || (c as any).Ten || (c as any).name || (c as any).TenTheLoai;
       return name === catName;
    });
    categoryId = rawCat?.maTheLoai || (rawCat as any)?.MaTheLoai;

    // Simulate API call for the specific tab
    setTimeout(() => {
      // For demo, just filter existing loaded courses or scramble them
      const all = this.dataService.courses();
      this.tabCourses = all.filter(c => c.category === catName);
      if (this.tabCourses.length === 0) {
        // Fallback if local courses don't match, just show a few mixed
        this.tabCourses = [...all].sort(() => 0.5 - Math.random()).slice(0, 6);
      }
      this.loadingTab = false;
    }, 400);
  }

  scrollCarousel(element: HTMLElement, amount: number) {
    if (element) {
      element.scrollBy({ left: amount, behavior: 'smooth' });
    }
  }

  searchCourses() {
    this.router.navigate(['/course'], { 
      queryParams: { 
        q: this.searchQuery.trim() || null 
      } 
    });
  }

  goToCategory(catName: string) {
    let categoryId: number | undefined = undefined;
    const rawCat = this.dataService.categoriesRaw().find(c => {
       const name = c.ten || (c as any).Ten || (c as any).name || (c as any).TenTheLoai;
       return name === catName;
    });
    categoryId = rawCat?.maTheLoai || (rawCat as any)?.MaTheLoai;
    
    this.router.navigate(['/course'], { 
      queryParams: { cat: categoryId || null } 
    });
  }
}
