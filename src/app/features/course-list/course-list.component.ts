import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, CourseCardComponent],
  template: `
    <app-header />
    <div class="page-body">
      <!-- Sidebar Filters -->
      <aside class="filter-sidebar">
        <div class="filter-header">
          <h3><i class="fa-solid fa-sliders"></i> Bộ lọc</h3>
          <button class="reset-filters-btn" (click)="resetFilters()" *ngIf="hasActiveFilters()">
            <i class="fa-solid fa-rotate-left"></i> Đặt lại
          </button>
        </div>

        <div class="filter-group">
          <h4>Danh mục</h4>
          <div class="filter-scrollable">
            <label *ngFor="let cat of dataService.categories()" class="radio-item">
              <input type="radio" name="category"
                     [value]="cat"
                     [(ngModel)]="selectedCategory"
                     (ngModelChange)="onFilterChange()">
              <span class="radio-custom"></span>
              <span>{{ cat }}</span>
            </label>
          </div>
        </div>

        <div class="filter-group">
          <h4>Cấp độ</h4>
          <label *ngFor="let l of levels" class="radio-item">
            <input type="radio" name="level"
                   [value]="l"
                   [(ngModel)]="selectedLevel"
                   (ngModelChange)="onFilterChange()">
            <span class="radio-custom"></span>
            <span>{{ l }}</span>
          </label>
        </div>

        <div class="filter-group">
          <h4>Đánh giá</h4>
          <label *ngFor="let r of ratingOptions" class="radio-item">
            <input type="radio" name="rating"
                   [value]="r.value"
                   [(ngModel)]="selectedRating"
                   (ngModelChange)="onFilterChange()">
            <span class="radio-custom"></span>
            <span class="rating-option">
              <span *ngIf="r.value > 0" class="stars-mini">
                <i *ngFor="let s of getStarArray(r.value)" class="fa-solid fa-star"></i>
              </span>
              {{ r.label }}
            </span>
          </label>
        </div>

        <div class="filter-group">
          <h4>Giá</h4>
          <label *ngFor="let p of priceOptions" class="radio-item">
            <input type="radio" name="price"
                   [value]="p.value"
                   [(ngModel)]="selectedPrice"
                   (ngModelChange)="onFilterChange()">
            <span class="radio-custom"></span>
            <span>{{ p.label }}</span>
          </label>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="course-main">
        <div class="top-bar">
          <span *ngIf="dataService.loadingCourses()">
            <i class="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách khóa học...
          </span>
          <span *ngIf="!dataService.loadingCourses() || dataService.courses().length > 0">
            Hiển thị <strong>{{ filteredCourses().length }}</strong> 
            / <span class="total-text">{{ dataService.coursesTotal() }} khóa học</span>
            <span *ngIf="filteredCourses().length !== dataService.courses().length" class="filter-count">
              (lọc từ {{ dataService.courses().length }} đang tải)
            </span>
          </span>
          <div class="sort-wrapper">
            <select class="sort-select" [(ngModel)]="selectedSort" (ngModelChange)="onSortChange()">
              <option value="">Phù hợp nhất</option>
              <option value="price_asc">Giá: Thấp → Cao</option>
              <option value="price_desc">Giá: Cao → Thấp</option>
              <option value="rating_desc">Đánh giá cao nhất</option>
              <option value="newest">Mới nhất</option>
              <option value="popular">Phổ biến nhất</option>
            </select>
          </div>
        </div>

        <div class="search-bar-mini">
          <div class="search-input-wrapper">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="searchCourses()" placeholder="Tìm kiếm khóa học, kỹ năng...">
          </div>
          <button class="btn btn-primary btn-sm" (click)="searchCourses()">
            <i class="fa-solid fa-magnifying-glass"></i> Tìm kiếm
          </button>
        </div>

        <!-- Active Filters Tags -->
        <div class="active-filters" *ngIf="hasActiveFilters()">
          <span class="active-filter-label">Đang lọc:</span>
          <span class="filter-tag" *ngIf="selectedCategory !== 'Tất cả'">
            {{ selectedCategory }}
            <button (click)="selectedCategory = 'Tất cả'; onFilterChange()">×</button>
          </span>
          <span class="filter-tag" *ngIf="selectedLevel !== 'Tất cả'">
            {{ selectedLevel }}
            <button (click)="selectedLevel = 'Tất cả'; onFilterChange()">×</button>
          </span>
          <span class="filter-tag" *ngIf="selectedRating > 0">
            {{ selectedRating }}★ trở lên
            <button (click)="selectedRating = 0; onFilterChange()">×</button>
          </span>
          <span class="filter-tag" *ngIf="selectedPrice !== 'all'">
            {{ selectedPrice === 'free' ? 'Miễn phí' : 'Có phí' }}
            <button (click)="selectedPrice = 'all'; onFilterChange()">×</button>
          </span>
          <span class="filter-tag" *ngIf="searchQuery">
            "{{ searchQuery }}"
            <button (click)="searchQuery = ''; searchCourses()">×</button>
          </span>
        </div>

        <!-- Course Grid -->
        <div class="course-grid" *ngIf="filteredCourses().length > 0">
          <div *ngFor="let course of filteredCourses()">
             <app-course-card [course]="course" [showCartBtn]="true"></app-course-card>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrapper" *ngIf="totalPages > 1">
          <button class="page-btn" [disabled]="dataService.currentCoursePage() === 1" (click)="goToPage(dataService.currentCoursePage() - 1)">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          
          <button class="page-btn" *ngIf="pages[0] > 1" (click)="goToPage(1)">1</button>
          <span class="page-dots" *ngIf="pages[0] > 2">...</span>
          
          <button class="page-btn" *ngFor="let p of pages" 
                  [class.active]="p === dataService.currentCoursePage()"
                  (click)="goToPage(p)">
            {{ p }}
          </button>
          
          <span class="page-dots" *ngIf="pages[pages.length - 1] < totalPages - 1">...</span>
          <button class="page-btn" *ngIf="pages[pages.length - 1] < totalPages" (click)="goToPage(totalPages)">{{ totalPages }}</button>

          <button class="page-btn" [disabled]="dataService.currentCoursePage() === totalPages" (click)="goToPage(dataService.currentCoursePage() + 1)">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="!dataService.loadingCourses() && filteredCourses().length === 0">
          <div class="empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
          <h3>Không tìm thấy khóa học</h3>
          <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          <button class="btn btn-outline btn-sm" (click)="resetFilters()">
            <i class="fa-solid fa-rotate-left"></i> Đặt lại bộ lọc
          </button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .page-body {
      display: flex;
      max-width: 1320px;
      margin: 0 auto;
      padding: 24px;
      gap: 24px;
    }

    /* ===== Filter Sidebar ===== */
    .filter-sidebar {
      width: 240px;
      flex-shrink: 0;
    }
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .filter-header h3 {
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--gray-800);
    }
    .reset-filters-btn {
      font-size: 12px;
      color: var(--primary);
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }
    .reset-filters-btn:hover {
      background: var(--primary-bg);
    }
    .filter-group {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--gray-200);
    }
    .filter-group:last-child {
      border-bottom: none;
    }
    .filter-group h4 {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 10px;
      color: var(--gray-700);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .filter-scrollable {
      max-height: 260px;
      overflow-y: auto;
      padding-right: 6px;
    }
    .filter-scrollable::-webkit-scrollbar {
      width: 4px;
    }
    .filter-scrollable::-webkit-scrollbar-thumb {
      background: var(--gray-300);
      border-radius: 4px;
    }

    /* ===== Custom Radio Buttons ===== */
    .radio-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 8px;
      margin: 0 -8px;
      cursor: pointer;
      font-size: 14px;
      color: var(--gray-600);
      border-radius: 6px;
      transition: all 0.15s ease;
    }
    .radio-item:hover {
      background: var(--gray-50);
      color: var(--gray-800);
    }
    .radio-item input[type="radio"] {
      display: none;
    }
    .radio-custom {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid var(--gray-300);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .radio-custom::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      transform: scale(0);
      transition: transform 0.2s ease;
    }
    .radio-item input[type="radio"]:checked + .radio-custom {
      border-color: var(--primary);
    }
    .radio-item input[type="radio"]:checked + .radio-custom::after {
      transform: scale(1);
    }
    .radio-item input[type="radio"]:checked ~ span:last-child {
      color: var(--primary);
      font-weight: 600;
    }

    .rating-option {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .stars-mini {
      color: #F59E0B;
      font-size: 11px;
      display: flex;
      gap: 1px;
    }

    /* ===== Main Content ===== */
    .course-main { flex: 1; }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .filter-count {
      color: var(--gray-400);
      font-weight: 400;
    }
    .sort-wrapper {}
    .sort-select {
      padding: 8px 14px;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-sm);
      font-size: 13px;
      cursor: pointer;
      background: var(--white);
      outline: none;
      color: var(--gray-600);
      font-family: var(--font);
    }
    .sort-select:focus {
      border-color: var(--primary);
    }

    /* ===== Search Bar ===== */
    .search-bar-mini {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .search-input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 14px;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-sm);
      background: var(--white);
      transition: all 0.25s ease;
    }
    .search-input-wrapper:focus-within {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(91, 99, 211, 0.1);
    }
    .search-input-wrapper i {
      color: var(--gray-400);
      font-size: 14px;
    }
    .search-input-wrapper input {
      border: none;
      background: transparent;
      font-size: 14px;
      padding: 10px 0;
      width: 100%;
      outline: none;
      color: var(--gray-700);
      font-family: var(--font);
    }

    /* ===== Active Filters ===== */
    .active-filters {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .active-filter-label {
      font-size: 13px;
      color: var(--gray-500);
      font-weight: 500;
    }
    .filter-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: var(--primary-bg);
      color: var(--primary);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .filter-tag button {
      background: none;
      border: none;
      color: var(--primary);
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      padding: 0;
      font-weight: 700;
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    .filter-tag button:hover {
      opacity: 1;
    }

    /* ===== Category Tags ===== */
    .category-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .cat-tag {
      padding: 6px 16px;
      border-radius: 20px;
      border: 1px solid var(--gray-300);
      background: var(--white);
      font-size: 13px;
      cursor: pointer;
      transition: var(--transition);
    }
    .cat-tag.active, .cat-tag:hover {
      background: var(--primary);
      color: var(--white);
      border-color: var(--primary);
    }

    /* ===== Course Grid ===== */
    .course-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }

    /* ===== Pagination ===== */
    .pagination-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-top: 40px;
      margin-bottom: 20px;
    }
    .page-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--gray-300);
      background: var(--white);
      color: var(--gray-600);
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .page-btn:hover:not(:disabled) {
      border-color: var(--primary);
      color: var(--primary);
    }
    .page-btn.active {
      background: var(--primary);
      color: var(--white);
      border-color: var(--primary);
    }
    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--gray-50);
    }
    .page-dots {
      color: var(--gray-500);
      font-weight: 600;
    }
    .total-text {
      color: var(--gray-600);
    }

    /* ===== Empty State ===== */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--gray-500);
    }
    .empty-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--gray-100);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 28px;
      color: var(--gray-400);
    }
    .empty-state h3 {
      font-size: 18px;
      color: var(--gray-700);
      margin-bottom: 8px;
    }
    .empty-state p {
      font-size: 14px;
      margin-bottom: 20px;
    }
  `]
})
export class CourseListComponent implements OnInit {
  levels = ['Tất cả', 'Cơ bản', 'Trung cấp', 'Nâng cao'];

  ratingOptions = [
    { label: 'Tất cả', value: 0 },
    { label: '4.5 trở lên', value: 4.5 },
    { label: '4.0 trở lên', value: 4.0 },
    { label: '3.5 trở lên', value: 3.5 },
  ];

  priceOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Miễn phí', value: 'free' },
    { label: 'Có phí', value: 'paid' },
    { label: 'Dưới 200.000đ', value: 'under200k' },
    { label: '200.000đ - 500.000đ', value: '200k-500k' },
    { label: 'Trên 500.000đ', value: 'above500k' },
  ];

  // Filter state
  searchQuery = '';
  selectedCategory = 'Tất cả';
  selectedLevel = 'Tất cả';
  selectedRating = 0;
  selectedPrice = 'all';
  selectedSort = '';

  // Filtered courses signal
  filteredCourses = signal<any[]>([]);

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor(public dataService: DataService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';

      const catId = params['cat'] ? Number(params['cat']) : undefined;

      if (catId) {
        const rawCat = this.dataService.categoriesRaw().find(c => c.maTheLoai === catId || (c as any).MaTheLoai === catId);
        if (rawCat) {
          this.selectedCategory = rawCat.ten || (rawCat as any).Ten || (rawCat as any).name || (rawCat as any).TenTheLoai;
        }
      } else {
        this.selectedCategory = params['category'] || 'Tất cả';
      }

      // Load from API with backend-supported filters
      this.dataService.loadCourses({
        search: this.searchQuery || undefined,
        categoryId: catId,
        sortBy: this.mapSortToApi(this.selectedSort)
      });

      // Wait for courses to load then apply client-side filters
      setTimeout(() => this.applyClientFilters(), 500);
    });

    // Also watch for courses signal changes
    // Use a polling approach to sync filtered results
    setInterval(() => {
      if (!this.dataService.loadingCourses()) {
        this.applyClientFilters();
      }
    }, 1000);
  }

  onFilterChange() {
    // If category changed, re-fetch from API
    if (this.selectedCategory !== 'Tất cả') {
      const rawCat = this.dataService.categoriesRaw().find(c => {
         const catName = c.ten || (c as any).Ten || (c as any).name || (c as any).TenTheLoai;
         return catName === this.selectedCategory;
      });
      if (rawCat) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            q: this.searchQuery.trim() || null,
            cat: rawCat.maTheLoai || (rawCat as any).MaTheLoai
          },
          queryParamsHandling: 'merge'
        });
        return;
      }
    }

    // Category is "Tất cả" — reload all courses
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchQuery.trim() || null,
        cat: null
      },
      queryParamsHandling: 'merge'
    });

    // Apply client-side filters immediately
    this.applyClientFilters();
  }

  onSortChange() {
    this.applyClientFilters();
  }

  applyClientFilters() {
    let courses = [...this.dataService.courses()];

    // Filter by level (client-side)
    if (this.selectedLevel !== 'Tất cả') {
      courses = courses.filter(c => {
        const level = c.level || '';
        return level.toLowerCase().includes(this.selectedLevel.toLowerCase());
      });
    }

    // Filter by rating (client-side)
    if (this.selectedRating > 0) {
      courses = courses.filter(c => (c.rating || 0) >= this.selectedRating);
    }

    // Filter by price (client-side)
    switch (this.selectedPrice) {
      case 'free':
        courses = courses.filter(c => (c.price || 0) === 0);
        break;
      case 'paid':
        courses = courses.filter(c => (c.price || 0) > 0);
        break;
      case 'under200k':
        courses = courses.filter(c => (c.price || 0) > 0 && (c.price || 0) < 200000);
        break;
      case '200k-500k':
        courses = courses.filter(c => (c.price || 0) >= 200000 && (c.price || 0) <= 500000);
        break;
      case 'above500k':
        courses = courses.filter(c => (c.price || 0) > 500000);
        break;
    }

    // Sort (client-side)
    switch (this.selectedSort) {
      case 'price_asc':
        courses.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        courses.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating_desc':
        courses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        courses.sort((a, b) => {
          const dateA = a.ngayTao ? new Date(a.ngayTao).getTime() : 0;
          const dateB = b.ngayTao ? new Date(b.ngayTao).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'popular':
        courses.sort((a, b) => (b.students || 0) - (a.students || 0));
        break;
    }

    this.filteredCourses.set(courses);
  }

  searchCourses() {
    let categoryId: number | undefined = undefined;
    if (this.selectedCategory !== 'Tất cả') {
      const rawCat = this.dataService.categoriesRaw().find(c => {
         const catName = c.ten || (c as any).Ten || (c as any).name || (c as any).TenTheLoai;
         return catName === this.selectedCategory;
      });
      categoryId = rawCat?.maTheLoai || (rawCat as any)?.MaTheLoai;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchQuery.trim() || null,
        cat: categoryId || null
      },
      queryParamsHandling: 'merge'
    });
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.onFilterChange();
  }

  hasActiveFilters(): boolean {
    return this.selectedCategory !== 'Tất cả' ||
           this.selectedLevel !== 'Tất cả' ||
           this.selectedRating > 0 ||
           this.selectedPrice !== 'all' ||
           this.searchQuery.length > 0;
  }

  resetFilters() {
    this.selectedCategory = 'Tất cả';
    this.selectedLevel = 'Tất cả';
    this.selectedRating = 0;
    this.selectedPrice = 'all';
    this.selectedSort = '';
    this.searchQuery = '';
    this.searchCourses();
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  goToDetail(id?: number) {
    if (id) {
      this.router.navigate(['/course', id]);
    }
  }

  addToCart(courseId?: number) {
    if (!courseId) return;

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

    this.dataService.addToCart(courseId).subscribe({
      next: () => {
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
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: err.error?.message || 'Có lỗi xảy ra.',
          confirmButtonColor: '#5a67d8'
        });
      }
    });
  }

  private mapSortToApi(sort: string): string | undefined {
    const map: Record<string, string> = {
      'price_asc': 'price',
      'price_desc': 'price_desc',
      'rating_desc': 'rating',
      'newest': 'newest',
      'popular': 'popular',
    };
    return map[sort] || undefined;
  }

  get totalPages(): number {
    return Math.ceil(this.dataService.coursesTotal() / 12);
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.dataService.currentCoursePage();
    const result = [];
    
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    if (current <= 3) end = Math.min(5, total);
    if (current >= total - 2) start = Math.max(1, total - 4);

    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.dataService.currentCoursePage()) return;
    
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let categoryId: number | undefined = undefined;
    if (this.selectedCategory !== 'Tất cả') {
      const rawCat = this.dataService.categoriesRaw().find(c => {
         const catName = c.ten || (c as any).Ten || (c as any).name || (c as any).TenTheLoai;
         return catName === this.selectedCategory;
      });
      categoryId = rawCat?.maTheLoai || (rawCat as any)?.MaTheLoai;
    }

    this.dataService.loadCourses({
      search: this.searchQuery || undefined,
      categoryId: categoryId,
      sortBy: this.mapSortToApi(this.selectedSort),
      page: page,
      append: false
    });
  }
}
