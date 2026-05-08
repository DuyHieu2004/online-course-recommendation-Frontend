import { Injectable, signal, inject } from '@angular/core';
import { Course, User, Promotion, EnrolledCourse, Certificate, CartItem, Category, CartResponse } from '../models/models';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  // Signals cho UI binding
  readonly courses = signal<Course[]>([]);
  readonly coursesTotal = signal<number>(0);
  readonly currentCoursePage = signal<number>(1);
  readonly users = signal<User[]>([]);
  readonly promotions = signal<Promotion[]>([]);
  readonly enrolledCourses = signal<EnrolledCourse[]>([]);
  readonly certificates = signal<Certificate[]>([]);
  readonly cartItems = signal<CartItem[]>([]);
  readonly cartTotal = signal<number>(0);
  readonly categories = signal<string[]>(['Tất cả']);
  readonly categoriesRaw = signal<Category[]>([]);
  readonly currentCategoriesPage = signal<number>(1);
  readonly categoriesTotal = signal<number>(0);
  
  readonly currentPromotionsPage = signal<number>(1);
  readonly promotionsTotal = signal<number>(0);
  
  readonly currentUsersPage = signal<number>(1);
  readonly usersTotal = signal<number>(0);
  
  readonly currentMyCoursesPage = signal<number>(1);
  readonly myCoursesTotal = signal<number>(0);
  
  readonly adminStats = signal({
    totalUsers: 0,
    students: 0,
    instructors: 0,
    admins: 0,
    totalCourses: 0,
    totalCategories: 0
  });

  // Loading states
  readonly loadingCourses = signal(false);
  readonly loadingCart = signal(false);

  constructor() {
    this.loadCategories();
    this.loadCourses();

    if (this.auth.isLoggedIn()) {
      this.loadCart();
      this.loadMyCourses();
    }
  }

  // ========================
  // COURSES
  // ========================
  loadCourses(params?: { search?: string; categoryId?: number; sortBy?: string; page?: number; append?: boolean }) {
    if (!params?.append && !this.loadingCourses()) {
      // Opt: có thể clear mảng if needed, nhưng giữ lại loading sẽ UX tốt hơn
    }
    this.loadingCourses.set(true);
    const page = params?.page ?? 1;
    this.api.getCourses({
      page: page,
      pageSize: 12,
      search: params?.search,
      categoryId: params?.categoryId,
      sortBy: params?.sortBy
    }).subscribe({
      next: (res) => {
        const mapped = (res.data || []).map((k: any) => this.mapCourseFromApi(k));
        if (params?.append) {
          this.courses.update(c => [...c, ...mapped]);
        } else {
          this.courses.set(mapped);
        }
        this.coursesTotal.set(res.totalCount || 0);
        this.currentCoursePage.set(page);
        this.loadingCourses.set(false);
      },
      error: () => this.loadingCourses.set(false)
    });
  }

  // ========================
  // CATEGORIES
  // ========================
  loadCategories(page = 1) {
    this.api.getCategories(page, 10).subscribe({
      next: (res: any) => {
        const cats = Array.isArray(res) ? res : (res.data || []);
        this.categoriesRaw.set(cats);
        this.categoriesTotal.set(res.totalCount || cats.length);
        this.currentCategoriesPage.set(res.page || page);
        
        // Cập nhật mảng categories (cho các Dropdown không dùng phân trang)
        // Lưu ý: Nếu cần load TOÀN BỘ dropdown, phải gọi 1 API riêng hoặc lấy pageSize rất lớn.
        // Tạm thời ở đây ta vẫn ánh xạ cats cho Home.
        const names = ['Tất cả', ...cats.map((c: any) => c.ten || c.Ten || c.name || c.TenTheLoai || 'Chưa đặt tên')];
        this.categories.set(names);
      }
    });
  }

  // ========================
  // CART
  // ========================
  loadCart() {
    if (!this.auth.isLoggedIn()) return;
    this.loadingCart.set(true);
    this.api.getCart().subscribe({
      next: (res: CartResponse) => {
        const mappedItems = (res.items || []).map((i: any) => ({
          ...i,
          course: {
            id: i.khoaHoc?.maKhoaHoc,
            title: i.khoaHoc?.tieuDe,
            price: i.gia ?? i.khoaHoc?.giaGoc ?? 0,
            originalPrice: i.khoaHoc?.giaGoc,
            instructor: i.khoaHoc?.giangVien || 'Chưa có',
            image: i.khoaHoc?.anhUrl || '',
            level: 'Tất cả cấp độ',
            hours: 0
          }
        }));
        this.cartItems.set(mappedItems);
        this.cartTotal.set(res.tongTien || 0);
        this.loadingCart.set(false);
      },
      error: () => this.loadingCart.set(false)
    });
  }

  addToCart(courseId: number) {
    return this.api.addToCart(courseId);
  }

  removeFromCart(courseId: number) {
    return this.api.removeFromCart(courseId);
  }

  // ========================
  // LEARNING
  // ========================
  loadMyCourses(page = 1) {
    if (!this.auth.isLoggedIn()) return;
    this.api.getMyCourses(page, 10).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        const mapped = (data || []).map((t: any) => ({
          ...t,
          course: {
            id: t.khoaHoc?.maKhoaHoc,
            title: t.khoaHoc?.tieuDe,
            image: t.khoaHoc?.anhUrl || '',
            rating: t.khoaHoc?.tbdanhGia ?? 0,
            category: t.khoaHoc?.theLoai || 'Chưa phân loại',
            instructor: t.khoaHoc?.giangVien || 'Chưa có',
            modules: t.khoaHoc?.soLuongChuong ?? 0
          },
          progress: t.phanTramTienDo ?? 0
        }));
        this.enrolledCourses.set(mapped);
        this.myCoursesTotal.set(res.totalCount || data.length);
        this.currentMyCoursesPage.set(res.page || page);
      }
    });
  }

  loadCertificates() {
    if (!this.auth.isLoggedIn()) return;
    this.api.getCertificates().subscribe({
      next: (data: any[]) => {
        const mapped = (data || []).map((c: any) => ({
          ...c,
          id: c.maChungChi,
          courseName: c.khoaHoc?.tieuDe,
          date: c.ngayPhat ? new Date(c.ngayPhat).toLocaleDateString('vi-VN') : '',
          source: 'EduLearn'
        }));
        this.certificates.set(mapped);
      }
    });
  }

  // ========================
  // USERS (Admin)
  // ========================
  loadUsers(page = 1, search?: string, vaiTro?: string) {
    this.api.getUsers(page, 10, search, vaiTro).subscribe({
      next: (res) => {
        const raw = Array.isArray(res) ? res : (res.data || []);
        const mapped = raw.map((u: any) => this.mapUserFromApi(u));
        this.users.set(mapped);
        this.usersTotal.set(res.totalCount || raw.length);
        this.currentUsersPage.set(res.page || page);

        // Cập nhật thống kê sơ bộ (từ trang đầu tiên trả về totalCount)
        if (page === 1) {
          this.adminStats.update(s => ({ ...s, totalUsers: res.totalCount || raw.length }));
        }
      }
    });
  }

  loadAdminStats() {
    this.api.getUserStats().subscribe(res => {
      this.adminStats.update(s => ({
        ...s,
        totalUsers: res.totalUsers,
        students: res.students,
        instructors: res.instructors,
        admins: res.admins
      }));
    });

    this.api.getCourses({ page: 1, pageSize: 1 }).subscribe(res => {
      this.adminStats.update(s => ({ ...s, totalCourses: res.totalCount }));
    });

    this.api.getCategories().subscribe(res => {
      const d = Array.isArray(res) ? res : (res.data || []);
      this.adminStats.update(s => ({ ...s, totalCategories: d.length }));
    });
  }

  // ========================
  // HELPERS — Map API response to UI-friendly format
  // ========================
  private mapCourseFromApi(k: any): Course {
    const mainInstructor = (k.giangVien || []).find((g: any) => g.laGiangVienChinh)?.ten
      || (k.giangVien || [])[0]?.ten || 'Chưa có';

    return {
      ...k,
      id: k.maKhoaHoc,
      title: k.tieuDe,
      slug: this.toSlug(k.tieuDe),
      instructor: mainInstructor,
      rating: k.tbdanhGia ?? 0,
      reviewCount: this.formatCount(k.soLuongDanhGia ?? 0),
      price: k.khuyenMai?.phanTramGiam
        ? Math.round((k.giaGoc ?? 0) * (1 - k.khuyenMai.phanTramGiam / 100))
        : k.giaGoc ?? 0,
      originalPrice: k.giaGoc ?? 0,
      image: k.anhUrl || '',
      category: k.theLoai?.ten || 'Chưa phân loại',
      level: 'Tất cả cấp độ',
      modules: k.soLuongChuong ?? 0,
      students: k.soHocVien ?? 0,
      description: k.moTa
    };
  }

  private mapUserFromApi(u: any): User {
    return {
      ...u,
      id: u.maNguoiDung,
      name: u.ten,
      email: u.email,
      role: this.mapRole(u.vaiTro),
      initials: this.getInitials(u.ten || 'U'),
      color: this.getColorForUser(u.maNguoiDung),
      joinDate: u.ngayTao ? new Date(u.ngayTao).toLocaleDateString('vi-VN') : 'Mới',
      status: u.tinhTrang === 'Bị khóa' ? 'inactive' : 'active',
      originalStatus: u.tinhTrang,
      hoSoBangCap: u.hoSoBangCap,
      coursesCount: u.vaiTro === 'GiaoVien' ? 5 : 0, // Mock số lượng khóa học cho giảng viên
      rating: 5
    };
  }

  private mapRole(vaiTro: string): string {
    const map: Record<string, string> = {
      'HocVien': 'student',
      'GiaoVien': 'instructor',
      'Admin': 'admin'
    };
    return map[vaiTro] || 'student';
  }

  private toSlug(str: string): string {
    return str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private formatCount(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  }

  private getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  private getColorForUser(id: number): string {
    const colors = ['#5B63D3', '#FD7E14', '#28A745', '#17A2B8', '#6F42C1', '#DC3545'];
    return colors[id % colors.length];
  }
}
