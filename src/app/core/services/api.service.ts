import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ========================
  // COURSES
  // ========================
  getCourses(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number;
    sortBy?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params?.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    return this.http.get(`${this.apiUrl}/courses`, { params: httpParams });
  }

  getCourseById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses/${id}`);
  }

  getCourseChapters(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses/${courseId}/chapters`);
  }

  updateCourse(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/instructor/courses/${id}`, data);
  }

  createCourse(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/instructor/courses`, data);
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/instructor/courses/${id}`);
  }

  submitCourseForReview(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/instructor/courses/${id}/submit`, {});
  }

  getCourseReviews(courseId: number, page = 1, pageSize = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses/${courseId}/reviews`, {
      params: { page, pageSize }
    });
  }

  // Admin: lấy tất cả khóa học (mọi trạng thái)
  getAdminCourses(params?: { page?: number; pageSize?: number; search?: string; status?: string; sortBy?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    return this.http.get(`${this.apiUrl}/courses/admin/all`, { params: httpParams });
  }

  // Admin: cập nhật trạng thái khóa học (Published / Rejected / Draft / Pending)
  updateCourseStatus(courseId: number, tinhTrang: string, thoiGianChoPhepTre?: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/courses/${courseId}/status`, { tinhTrang, thoiGianChoPhepTre });
  }

  // ========================
  // CATEGORIES
  // ========================
  getCategories(page = 1, pageSize = 100, search?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.http.get(`${this.apiUrl}/categories`, { params });
  }

  getCategoryById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories/${id}`);
  }

  createCategory(data: { ten: string; moTa?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, data);
  }

  updateCategory(id: number, data: { ten: string; moTa?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }

  // ========================
  // CART
  // ========================
  getCart(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart`);
  }

  addToCart(courseId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/${courseId}`, {});
  }

  removeFromCart(courseId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/${courseId}`);
  }

  // ========================
  // ORDERS
  // ========================
  checkout(phuongThucThanhToan?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders/checkout`, { phuongThucThanhToan });
  }

  getOrders(page = 1, pageSize = 10, search?: string, status?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get(`${this.apiUrl}/orders`, { params });
  }

  // ========================
  // LEARNING
  // ========================
  getMyCourses(page = 1, pageSize = 10): Observable<any> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get(`${this.apiUrl}/learning/my-courses`, { params });
  }

  getCourseContent(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/learning/course/${courseId}`);
  }

  completeLesson(lessonId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/learning/lesson/${lessonId}/complete`, {});
  }

  getCertificates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/learning/certificates`);
  }

  // ========================
  // USERS (Admin)
  // ========================
  getUsers(page = 1, pageSize = 10, search?: string, vaiTro?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    if (vaiTro) params = params.set('vaiTro', vaiTro);
    return this.http.get(`${this.apiUrl}/users`, { params });
  }

  getUserStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/stats`);
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/profile`);
  }

  updateUserProfile(data: { ten?: string; tieuSu?: string; linkAnhDaiDien?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/profile`, data);
  }

  createAdmin(admin: { ten: string; email: string; matKhau: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/admin`, admin);
  }

  uploadDegree(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/users/profile/degree`, formData);
  }

  deactivateAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/profile`);
  }

  updateUserRole(userId: number, vaiTro: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/role`, { vaiTro });
  }

  updateUserStatus(userId: number, tinhTrang: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/status`, { tinhTrang });
  }

  // ========================
  // NOTIFICATIONS
  // ========================
  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/notifications`);
  }

  markNotificationAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/notifications/${id}/read`, {});
  }

  // ========================
  // PROMOTIONS (Admin)
  // ========================

  getPromotions(page = 1, pageSize = 10, search?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.http.get(`${this.apiUrl}/promotions`, { params });
  }

  createPromotion(data: { tenChuongTrinh: string; phanTramGiam?: number; ngayBatDau?: string; ngayKetThuc?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/promotions`, data);
  }

  updatePromotion(id: number, data: { tenChuongTrinh?: string; phanTramGiam?: number; ngayBatDau?: string; ngayKetThuc?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/promotions/${id}`, data);
  }

  deletePromotion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/promotions/${id}`);
  }

  // ========================
  // INSTRUCTOR
  // ========================
  getInstructorCourses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/instructor/courses`);
  }

  getInstructorStudents(page = 1, pageSize = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/instructor/students`, { params: { page, pageSize } });
  }

  getInstructorStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/instructor/stats`);
  }

  getRevenueSeries(year?: number): Observable<any> {
    let httpParams = new HttpParams();
    if (year) httpParams = httpParams.set('year', year);
    return this.http.get(`${this.apiUrl}/instructor/stats/revenue-series`, { params: httpParams });
  }

  createChapter(courseId: number, data: { tieuDe: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/instructor/courses/${courseId}/chapters`, data);
  }

  createLesson(chapterId: number, data: { lyThuyet?: string, baiTap?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/instructor/chapters/${chapterId}/lessons`, data);
  }

  uploadCourseCover(courseId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/instructor/courses/${courseId}/cover`, formData);
  }

  uploadLessonVideo(lessonId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/instructor/lessons/${lessonId}/video`, formData);
  }

  uploadLessonPdf(lessonId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/instructor/lessons/${lessonId}/pdf`, formData);
  }

  getInstructorCourseAnnouncements(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/instructor/courses/${courseId}/announcements`);
  }

  createAnnouncement(courseId: number, data: { tieuDe: string, noiDung: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/instructor/courses/${courseId}/announcements`, data);
  }

  deleteAnnouncement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/instructor/announcements/${id}`);
  }

  getPublicAnnouncements(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses/${courseId}/announcements`);
  }

  // ========================
  // INTERACTIONS
  // ========================
  rateCourse(maKhoaHoc: number, rating: number, binhLuan?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/interactions/rate`, { maKhoaHoc, rating, binhLuan });
  }

  toggleLike(courseId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/interactions/like/${courseId}`, {});
  }

  getLikedCourses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/interactions/likes`);
  }

  // ========================
  // RECOMMENDATIONS (Neo4j)
  // ========================
  getUserBasedRecommendations(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/recommendation/user-based/${userId}`);
  }

  getSimilarCourses(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/recommendation/content-based/similar-courses/${courseId}`);
  }

  getUserProfileRecommendations(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/recommendation/content-based/user-profile/${userId}`);
  }

  // ========================
  // SYSTEM SETTINGS
  // ========================
  getSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/settings`);
  }

  updateSettings(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/settings`, data);
  }

  sendTestEmail(smtp: any, toEmail: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/settings/test-email`, { smtp, toEmail });
  }

  getUserNotificationSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/debugroute`);
  }

  updateUserNotificationSettings(settings: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/debugroute`, settings);
  }
}