import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <app-header />
    <div class="purchase-history-container">
      <div class="header-section">
        <a routerLink="/dashboard" class="back-link">
          <i class="fa-solid fa-chevron-left"></i> Quay lại Học tập của tôi
        </a>
        <h1>Lịch sử mua hàng</h1>
        <p>Xem danh sách các hóa đơn và thời hạn các khóa học đã đăng ký.</p>
      </div>

      <div class="filter-section card">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Tìm kiếm theo mã hóa đơn hoặc tên khóa học..." (input)="onSearch($event)">
        </div>
        <div class="status-filter">
          <select (change)="onStatusChange($event)">
            <option value="">Tất cả trạng thái</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
            <option value="Chờ thanh toán">Chờ thanh toán</option>
            <option value="Thất bại">Thất bại</option>
          </select>
        </div>
      </div>

      <div class="loading-state" *ngIf="isLoading">
        <i class="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu...
      </div>

      <div class="error-state" *ngIf="error">
        <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
      </div>

      <div class="orders-list" *ngIf="!isLoading && !error">
        <div class="empty-state" *ngIf="orders.length === 0">
          <i class="fa-solid fa-receipt"></i>
          <h3>Bạn chưa có hóa đơn nào</h3>
          <p>Hãy khám phá các khóa học hấp dẫn của chúng tôi.</p>
          <a routerLink="/course" class="btn btn-primary mt-3">Khám phá khóa học</a>
        </div>

        <div class="order-card" *ngFor="let order of orders">
          <div class="order-header" (click)="toggleOrder(order.maHoaDon)" style="cursor: pointer;">
            <div class="order-id">
              <span class="label">Mã hóa đơn:</span>
              <strong>#{{ order.maHoaDon }}</strong>
            </div>
            <div class="order-date">
              <span class="label">Ngày mua:</span>
              <span>{{ order.ngayTao | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="order-status" [ngClass]="{'success': order.tinhTrangThanhToan === 'Đã thanh toán', 'failed': order.tinhTrangThanhToan !== 'Đã thanh toán'}">
              <i class="fa-solid" [ngClass]="{'fa-circle-check': order.tinhTrangThanhToan === 'Đã thanh toán', 'fa-circle-xmark': order.tinhTrangThanhToan !== 'Đã thanh toán'}"></i>
              {{ order.tinhTrangThanhToan }}
            </div>
            <div class="order-toggle">
              <i class="fa-solid fa-chevron-down" [ngClass]="{'rotated': isExpanded(order.maHoaDon)}"></i>
            </div>
          </div>
          
          <div class="order-body" *ngIf="isExpanded(order.maHoaDon)">
            <div class="course-list">
              <div class="course-item" *ngFor="let item of order.chiTiet">
                <div class="course-image">
                  <img [src]="item.khoaHoc?.anhUrl || 'assets/placeholder.jpg'" alt="Course Thumbnail" onerror="this.src='assets/placeholder.jpg'">
                </div>
                <div class="course-info">
                  <h4>{{ item.khoaHoc?.tieuDe }}</h4>
                  <div class="course-meta">
                    <span class="price">{{ item.gia | currency:'VND':'symbol':'1.0-0' }}</span>
                  </div>
                  
                  <!-- Thời hạn học calculation -->
                  <div class="course-duration-details" *ngIf="item.khoaHoc">
                    <div class="duration-detail-item">
                      <i class="fa-regular fa-clock"></i>
                      <span>Thời gian học: <strong>{{ item.khoaHoc.thoiGianHocDuKien || 12 }} tháng</strong></span>
                    </div>
                    <div class="duration-detail-item">
                      <i class="fa-solid fa-clock-rotate-left"></i>
                      <span>Thời gian trễ: <strong>{{ item.khoaHoc.thoiGianChoPhepTre ?? 7 }} ngày</strong></span>
                    </div>
                    <div class="duration-detail-item deadline">
                      <i class="fa-solid fa-calendar-check"></i>
                      <span>Hạn học tối đa: <strong>Đến {{ calculateEndDate(order.ngayTao, item.khoaHoc.thoiGianHocDuKien, item.khoaHoc.thoiGianChoPhepTre) | date:'dd/MM/yyyy' }}</strong></span>
                    </div>
                  </div>
                </div>
                <div class="course-action">
                   <a [routerLink]="['/course', item.khoaHoc?.maKhoaHoc]" class="btn btn-outline btn-sm">Xem khóa học</a>
                </div>
              </div>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="payment-method">
              <span class="label">Phương thức:</span> {{ order.phuongThucThanhToan }}
            </div>
            <div class="total-amount">
              <span class="label">Tổng cộng:</span>
              <span class="amount">{{ order.tongTien | currency:'VND':'symbol':'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <div class="pagination" *ngIf="totalPages > 1">
          <button class="btn btn-outline btn-sm" [disabled]="currentPage === 1" (click)="loadOrders(currentPage - 1)">
            <i class="fa-solid fa-chevron-left"></i> Trước
          </button>
          <span class="page-info">Trang {{ currentPage }} / {{ totalPages }}</span>
          <button class="btn btn-outline btn-sm" [disabled]="currentPage === totalPages" (click)="loadOrders(currentPage + 1)">
            Sau <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .purchase-history-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 24px;
    }
    .header-section {
      margin-bottom: 30px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 16px;
      transition: transform 0.2s;
    }
    .back-link:hover {
      transform: translateX(-4px);
    }
    .header-section h1 {
      font-size: 28px;
      font-weight: 800;
      color: var(--gray-900);
      margin-bottom: 8px;
    }
    .header-section p {
      color: var(--gray-600);
      font-size: 16px;
    }

    .loading-state, .error-state, .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: var(--white);
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .loading-state {
      font-size: 18px;
      color: var(--primary);
    }
    .error-state {
      color: var(--danger);
      font-size: 16px;
    }
    .empty-state i {
      font-size: 48px;
      color: var(--gray-300);
      margin-bottom: 16px;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .order-card {
      background: var(--white);
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      overflow: hidden;
      border: 1px solid var(--gray-200);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .order-card:hover {
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    }

    .order-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
      gap: 16px;
    }
    .order-header .label {
      font-size: 13px;
      color: var(--gray-500);
      margin-right: 6px;
    }
    .order-id strong {
      font-size: 15px;
      color: var(--gray-900);
    }
    .order-date span {
      font-size: 14px;
      color: var(--gray-700);
    }
    .order-status {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .order-status.success {
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
    }
    .order-status.failed {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
    }
    
    .order-toggle {
      margin-left: 10px;
      color: var(--gray-400);
      transition: transform 0.3s;
    }
    .order-toggle i.rotated {
      transform: rotate(180deg);
      color: var(--primary);
    }

    .order-body {
      padding: 0 24px;
    }
    
    .filter-section {
      display: flex;
      gap: 16px;
      padding: 16px 24px;
      margin-bottom: 24px;
      background: var(--white);
      border-radius: 12px;
      align-items: center;
    }
    .search-box {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-box i {
      position: absolute;
      left: 16px;
      color: var(--gray-400);
    }
    .search-box input {
      width: 100%;
      padding: 10px 16px 10px 44px;
      border: 1px solid var(--gray-200);
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-box input:focus {
      border-color: var(--primary);
    }
    .status-filter select {
      padding: 10px 16px;
      border: 1px solid var(--gray-200);
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      background: var(--white);
      cursor: pointer;
    }

    .course-item {
      display: flex;
      gap: 20px;
      padding: 20px 0;
      border-bottom: 1px solid var(--gray-100);
      align-items: center;
    }
    .course-item:last-child {
      border-bottom: none;
    }
    .course-image {
      width: 120px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .course-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .course-info {
      flex: 1;
    }
    .course-info h4 {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: var(--gray-900);
    }
    .course-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;
    }
    .price {
      font-weight: 600;
      color: var(--primary);
    }
    .course-duration-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 10px;
    }
    .duration-detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--gray-600);
    }
    .duration-detail-item i {
      width: 16px;
      color: var(--gray-400);
    }
    .duration-detail-item strong {
      color: var(--gray-800);
    }
    .duration-detail-item.deadline {
      margin-top: 4px;
      padding-top: 4px;
      border-top: 1px dashed var(--gray-200);
      color: var(--primary);
    }
    .duration-detail-item.deadline i {
      color: var(--primary);
    }
    .duration-detail-item.deadline strong {
      color: var(--primary);
      font-size: 14px;
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: var(--gray-50);
      border-top: 1px solid var(--gray-200);
    }
    .payment-method {
      font-size: 14px;
      color: var(--gray-700);
    }
    .total-amount {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .total-amount .amount {
      font-size: 20px;
      font-weight: 800;
      color: var(--gray-900);
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 24px;
    }
    .page-info {
      font-size: 14px;
      font-weight: 500;
      color: var(--gray-700);
    }

    @media (max-width: 768px) {
      .course-item {
        flex-direction: column;
        align-items: flex-start;
      }
      .course-image {
        width: 100%;
        height: 160px;
      }
      .order-header, .order-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      .course-action {
        width: 100%;
      }
      .course-action .btn {
        width: 100%;
      }
    }
  `]
})
export class PurchaseHistoryComponent implements OnInit {
  private apiService = inject(ApiService);

  orders: any[] = [];
  isLoading = true;
  error = '';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  searchTerm = '';
  statusFilter = '';
  expandedOrders = new Set<number>();

  ngOnInit() {
    this.loadOrders();
  }

  toggleOrder(orderId: number) {
    if (this.expandedOrders.has(orderId)) {
      this.expandedOrders.delete(orderId);
    } else {
      this.expandedOrders.add(orderId);
    }
  }

  isExpanded(orderId: number): boolean {
    return this.expandedOrders.has(orderId);
  }

  loadOrders(page: number = 1) {
    this.isLoading = true;
    this.error = '';
    this.currentPage = page;

    this.apiService.getOrders(this.currentPage, this.pageSize, this.searchTerm, this.statusFilter).subscribe({
      next: (res: any) => {
        this.orders = res.data || [];
        this.totalCount = res.totalCount || 0;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading orders', err);
        this.error = 'Không thể tải lịch sử mua hàng. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
    this.loadOrders();
  }

  onStatusChange(event: any) {
    this.statusFilter = event.target.value;
    this.currentPage = 1;
    this.loadOrders();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  calculateEndDate(purchaseDate: string, durationMonths: number | undefined, graceDays: number | undefined): Date {
    const date = new Date(purchaseDate);
    const months = durationMonths || 12; // Mặc định 12 tháng nếu không có
    const grace = (graceDays !== null && graceDays !== undefined) ? graceDays : 7; // Mặc định 7 ngày nếu không có cấu hình riêng

    // Cộng thêm số tháng học
    date.setMonth(date.getMonth() + months);

    // Cộng thêm số ngày cho phép trễ
    date.setDate(date.getDate() + grace);

    return date;
  }
}
