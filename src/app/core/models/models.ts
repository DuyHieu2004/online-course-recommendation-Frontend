// ========================
// Interfaces matching backend API responses (camelCase from JsonSerializerOptions)
// ========================
// ========================

export interface Course {
  maKhoaHoc: number;
  tieuDe: string;
  tieuDePhu?: string;
  moTa?: string;
  giaGoc?: number;
  tbdanhGia?: number;
  anhUrl?: string;
  tinhTrang?: string;
  kiNang?: string;
  ngayTao?: string;
  ngayCapNhat?: string;
  theLoai?: { maTheLoai: number; ten: string } | null;
  giangVien?: { maNguoiDung: number; ten: string; linkAnhDaiDien?: string; tieuSu?: string; laGiangVienChinh?: boolean }[];
  soLuongDanhGia?: number;
  soLuongChuong?: number;
  soHocVien?: number;
  khuyenMai?: { phanTramGiam?: number; ngayKetThuc?: string } | null;

  // Computed fields for UI compatibility
  id?: number;
  title?: string;
  slug?: string;
  instructor?: string;
  rating?: number;
  reviewCount?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  category?: string;
  level?: string;
  aiMatch?: number;
  aiReason?: string;
  hours?: number;
  modules?: number;
  students?: number;
  year?: number;
  description?: string;
  source?: string;
}

export interface CourseDetail extends Course {
  chuongs?: Chapter[];
  danhGia?: Review[];
  soLuongBaiHoc?: number;
}

export interface Chapter {
  maChuong: number;
  tieuDe: string;
  baiHocs?: Lesson[];
}

export interface Lesson {
  maBaiHoc: number;
  lyThuyet?: string;
  linkVideo?: string;
  baiTap?: string;
  daHoanThanh?: boolean;

  // Legacy UI fields
  id?: number;
  title?: string;
  duration?: string;
  completed?: boolean;
  current?: boolean;
}

export interface Review {
  maDanhGia: number;
  rating?: number;
  binhLuan?: string;
  ngayDanhGia?: string;
  thich?: number;
  nguoiDanhGia?: {
    maNguoiDung: number;
    ten: string;
    linkAnhDaiDien?: string;
  };
}

export interface Category {
  maTheLoai: number;
  ten: string;
  moTa?: string;
  soKhoaHoc?: number;
}

export interface User {
  maNguoiDung?: number;
  ten?: string;
  email?: string;
  vaiTro?: string;
  linkAnhDaiDien?: string;
  tieuSu?: string;
  tinhTrang?: string;
  ngayTao?: string;

  // Legacy UI fields
  id?: number;
  name?: string;
  role?: string;
  avatar?: string;
  initials?: string;
  color?: string;
  joinDate?: string;
  status?: string;
  originalStatus?: string;
  coursesCount?: number;
  rating?: number;
  hoSoBangCap?: string;

  // Transient UI state
  _saving?: boolean;
}

export interface CartItem {
  maChiTietGioHang: number;
  gia?: number;
  khoaHoc?: {
    maKhoaHoc: number;
    tieuDe: string;
    giaGoc?: number;
    anhUrl?: string;
    tbdanhGia?: number;
    theLoai?: string;
    giangVien?: string;
  };

  // Legacy
  course?: Course;
  quantity?: number;
}

export interface CartResponse {
  items: CartItem[];
  tongTien: number;
}

export interface EnrolledCourse {
  maTienDo: number;
  phanTramTienDo?: number;
  tinhTrang?: string;
  ngayThamGia?: string;
  khoaHoc?: {
    maKhoaHoc: number;
    tieuDe: string;
    anhUrl?: string;
    tbdanhGia?: number;
    theLoai?: string;
    giangVien?: string;
    soLuongChuong?: number;
  };

  // Legacy
  course?: Course;
  progress?: number;
  modules?: number;
}

export interface Certificate {
  maChungChi: number;
  ngayPhat?: string;
  khoaHoc?: {
    maKhoaHoc: number;
    tieuDe: string;
    anhUrl?: string;
  };

  // Legacy
  id?: number;
  courseName?: string;
  source?: string;
  date?: string;
}

export interface Promotion {
  id?: number;
  code?: string;
  type?: 'percent' | 'fixed';
  value?: number;
  condition?: string;
  usedCount?: number;
  expiryDate?: string;
  status?: 'active' | 'expired';
}

export interface PaginatedResponse<T> {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: T[];
}
