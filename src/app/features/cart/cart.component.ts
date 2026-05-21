import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { DataService } from '../../core/services/data.service';
import { ApiService } from '../../core/services/api.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FormsModule],
  template: `
    <app-header />
    <div class="container cart-page">
      <div class="cart-body">
        <!-- Cart Items -->
        <div class="cart-main">
          <h1><i class="fa-solid fa-cart-shopping"></i> Giỏ hàng</h1>
          <p class="cart-count">{{ dataService.cartItems().length }} khóa học</p>

          <div *ngIf="dataService.loadingCart()" style="padding: 40px; text-align: center;">
             <p>Đang tải giỏ hàng...</p>
          </div>

          <div *ngIf="!dataService.loadingCart() && dataService.cartItems().length === 0" style="padding: 40px; text-align: center; background: var(--white); border-radius: var(--radius-lg); margin-bottom: 24px;">
             <h3>Giỏ hàng của bạn đang trống</h3>
             <a routerLink="/course" class="btn btn-primary mt-4">Tiếp tục mua sắm</a>
          </div>

          <div *ngFor="let item of dataService.cartItems()" class="cart-item card">
            <div class="item-thumb" style="cursor: pointer" routerLink="/course/{{item.course?.id}}">
              <img *ngIf="item.course?.image && item.course!.image!.length > 5" [src]="item.course?.image" (error)="item.course!.image = ''" alt="course" style="width: 100%; height: 100%; object-fit: cover;">
              <div *ngIf="!item.course?.image || item.course!.image!.length <= 5" style="font-size: 36px; display:flex; justify-content:center; align-items:center; width:100%; height:100%"><i class="fa-solid fa-box"></i></div>
            </div>
            <div class="item-info">
              <h3 style="cursor: pointer" routerLink="/course/{{item.course?.id}}">{{ item.course?.title }}</h3>
              <p>{{ item.course?.instructor }}</p>
              <div class="item-actions">
                <button class="action-link danger" (click)="removeItem(item.course?.id)"><i class="fa-solid fa-trash"></i> Xóa</button>
              </div>
            </div>
            <div class="item-price">
              <ng-container *ngIf="(item.course?.price ?? 0) < (item.course?.originalPrice ?? 0); else noPromo">
                <span class="current-price">{{ item.course?.price | number }}đ</span>
                <span class="old-price" style="text-decoration: line-through; color: #94a3b8; font-size: 13px; margin-left: 8px;">
                  {{ item.course?.originalPrice | number }}đ
                </span>
              </ng-container>
              <ng-template #noPromo>
                <span class="current-price">{{ item.course?.price | number }}đ</span>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <aside class="cart-sidebar" *ngIf="dataService.cartItems().length > 0">
          <div class="summary-card card">
            <h3>Tổng đơn hàng</h3>
            <div class="summary-items">
              <div class="summary-row" *ngFor="let item of dataService.cartItems()">
                <span class="truncate-text" style="max-width: 200px">{{ item.course?.title }}</span>
                <span>{{ item.course?.price | number }}đ</span>
              </div>
            </div>

            <div class="coupon-row">
              <h4>Mã giảm giá</h4>
              <div class="coupon-input">
                <input type="text" class="form-input" placeholder="Nhập mã..." [(ngModel)]="voucherCode">
                <button class="btn btn-outline btn-sm" (click)="applyVoucher()" [disabled]="applyingVoucher">
                  <ng-container *ngIf="!applyingVoucher">Áp dụng</ng-container>
                  <ng-container *ngIf="applyingVoucher"><i class="fa-solid fa-spinner fa-spin"></i></ng-container>
                </button>
              </div>
              <div *ngIf="voucherError" style="color: #dc3545; font-size: 12px; margin-top: 6px;"><i class="fa-solid fa-circle-exclamation"></i> {{ voucherError }}</div>
              <div *ngIf="voucherSuccess" style="color: #10B981; font-size: 12px; margin-top: 6px;"><i class="fa-solid fa-circle-check"></i> {{ voucherSuccess }}</div>
            </div>

            <div class="summary-total">
              <div class="total-row">
                <span>Tổng phụ:</span>
                <span>{{ dataService.cartTotal() | number }}đ</span>
              </div>
              <div class="total-row discount" *ngIf="discountAmount > 0" style="color: var(--success);">
                <span>Giảm giá ({{ discountPercent }}%):</span>
                <span>-{{ discountAmount | number }}đ</span>
              </div>
              <div class="total-row final" style="border-top: 1px dashed var(--gray-300); margin-top: 8px; padding-top: 8px;">
                <span><strong>Thanh toán:</strong></span>
                <span class="final-value">{{ finalTotal | number }}đ</span>
              </div>
            </div>

            <button class="btn btn-primary btn-lg" style="width:100%" (click)="checkout()" [disabled]="checkoutLoading">
               <ng-container *ngIf="!checkoutLoading"><i class="fa-solid fa-lock"></i> Thanh toán ngay <i class="fa-solid fa-arrow-right"></i></ng-container>
               <ng-container *ngIf="checkoutLoading"><i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...</ng-container>
            </button>
            <p class="security-note"><i class="fa-solid fa-shield-halved"></i> Bảo mật SSL • Hoàn tiền 30 ngày</p>
            <div class="payment-methods">
              <span>Chấp nhận thanh toán:</span>
              <div class="methods">
                <span class="method"><i class="fa-solid fa-credit-card"></i> Thẻ</span>
                <span class="method"><i class="fa-solid fa-mobile-screen"></i> MoMo</span>
                <span class="method"><i class="fa-solid fa-building-columns"></i> VNPay</span>
                <span class="method"><i class="fa-solid fa-wallet"></i> ZaloPay</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .cart-page { padding: 24px 0 60px; min-height: calc(100vh - 72px); }
    .cart-page h1 { font-size: 22px; margin-bottom: 4px; }
    .cart-count { font-size: 14px; color: var(--gray-500); margin-bottom: 20px; }
    .cart-body { display: flex; gap: 24px; align-items: flex-start; }
    .cart-main { flex: 1; }
    .cart-item {
      display: flex;
      gap: 16px;
      padding: 20px;
      margin-bottom: 12px;
    }
    .item-thumb {
      width: 100px; height: 80px;
      background: var(--primary-bg);
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .item-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
    .item-info h3 { font-size: 15px; font-weight: 700; margin-bottom: 4px; line-height: 1.4; }
    .item-info p { font-size: 13px; color: var(--gray-500); }
    .item-actions {
      display: flex; gap: 16px; margin-top: 12px;
    }
    .action-link {
      background: none;
      font-size: 13px;
      color: var(--primary);
      cursor: pointer;
      padding: 0;
    }
    .action-link.danger { color: var(--danger); font-weight: 500; }
    .item-price { text-align: right; min-width: 100px; }
    .price-current {
      display: block;
      font-size: 18px;
      font-weight: 800;
      color: var(--primary);
    }
    .price-old {
      text-decoration: line-through;
      color: var(--gray-400);
      font-size: 13px;
    }

    .cart-sidebar { width: 380px; flex-shrink: 0; position: sticky; top: 24px; }
    .summary-card { padding: 24px; }
    .summary-card h3 { font-size: 18px; margin-bottom: 16px; }
    .summary-items { border-bottom: 1px solid var(--gray-200); padding-bottom: 12px; margin-bottom: 16px;}
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      padding: 4px 0;
      color: var(--gray-600);
    }
    .truncate-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .coupon-row { margin-bottom: 16px; }
    .coupon-row h4 { font-size: 14px; margin-bottom: 8px; }
    .coupon-input { display: flex; gap: 8px; }
    .coupon-input .form-input { flex: 1; }
    .summary-total {
      border-top: 1px solid var(--gray-200);
      padding-top: 12px;
      margin-bottom: 16px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 14px;
    }
    .total-value { font-weight: 700; color: var(--primary); font-size: 18px; }
    .discount span { color: var(--success); }
    .final { margin-top: 8px; align-items: center; }
    .final-value { font-size: 22px; font-weight: 800; color: var(--primary); }
    .security-note {
      text-align: center;
      font-size: 12px;
      color: var(--gray-400);
      margin: 12px 0;
    }
    .payment-methods { font-size: 12px; color: var(--gray-500); }
    .methods { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
    .method {
      padding: 6px 12px;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-sm);
      font-size: 12px;
    }
    .mt-4 { margin-top: 16px; display: inline-block; }
  `]
})
export class CartComponent implements OnInit {
  public dataService = inject(DataService);
  private apiService = inject(ApiService);
  private router = inject(Router);

  checkoutLoading = false;
  voucherCode = '';

  // CÁC BIẾN MỚI THÊM:
  applyingVoucher = false;
  discountPercent = 0;
  voucherError = '';
  voucherSuccess = '';

  ngOnInit() {
    this.dataService.loadCart();
  }

  // TÍNH TOÁN TIỀN GIẢM VÀ TỔNG TIỀN
  get discountAmount(): number {
    return (this.dataService.cartTotal() * this.discountPercent) / 100;
  }

  get finalTotal(): number {
    return Math.max(0, this.dataService.cartTotal() - this.discountAmount);
  }

  // Tính giá sau khi trừ Khuyến mãi của Admin (Nếu có)
  getItemDiscountedPrice(item: any): number {
    const course = item.maKhoaHocNavigation;
    const giaGoc = course?.giaGoc || 0;
    const km = course?.maKhuyenMaiNavigation;

    if (km && new Date(km.ngayKetThuc) >= new Date()) {
      const phanTramGiam = km.phanTramGiam || 0;
      return giaGoc * (1 - phanTramGiam / 100);
    }
    return giaGoc;
  }

  // HÀM XỬ LÝ KHI BẤM "ÁP DỤNG"
  applyVoucher() {
    this.voucherError = '';
    this.voucherSuccess = '';
    this.discountPercent = 0;

    if (!this.voucherCode.trim()) {
      this.voucherError = 'Vui lòng nhập mã giảm giá';
      return;
    }

    this.applyingVoucher = true;
    this.apiService.applyVoucher(this.voucherCode).subscribe({
      next: (res: any) => {
        this.applyingVoucher = false;
        this.discountPercent = res.phanTramGiam;
        this.voucherSuccess = res.message;
      },
      error: (err) => {
        this.applyingVoucher = false;
        this.voucherError = err.error?.message || 'Mã giảm giá không hợp lệ';
      }
    });
  }

  removeItem(courseId?: number) {
    if (!courseId) return;

    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: 'Xóa khóa học này khỏi giỏ hàng?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#a0aec0',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataService.removeFromCart(courseId).subscribe({
          next: () => {
            this.dataService.loadCart();
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'info',
              title: 'Đã xóa khóa học',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
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
    });
  }

  checkout() {
    if (this.dataService.cartItems().length === 0) return;

    this.checkoutLoading = true;
    // TRUYỀN MÃ VOUCHER XUỐNG BACKEND TẠI ĐÂY
    this.apiService.checkout('Chuyển khoản', this.voucherCode).subscribe({
      next: (res: any) => {
        this.checkoutLoading = false;

        // Tùy chỉnh thông báo nếu được giảm giá
        let msg = 'Bạn có thể bắt đầu học ngay.';
        if (res.soTienGiam > 0) {
          msg = `Bạn đã áp dụng mã thành công và được giảm ${res.soTienGiam.toLocaleString('vi-VN')}đ!`;
        }

        Swal.fire({
          icon: 'success',
          title: 'Thanh toán thành công!',
          text: msg,
          confirmButtonColor: '#5a67d8'
        }).then(() => {
          this.dataService.loadCart();
          this.dataService.loadMyCourses();
          this.router.navigate(['/my-courses']);
        });
      },
      error: (err) => {
        this.checkoutLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Thanh toán thất bại',
          text: err.error?.message || 'Đã xảy ra lỗi trong quá trình thanh toán.',
          confirmButtonColor: '#5a67d8'
        });
      }
    });
  }
}
