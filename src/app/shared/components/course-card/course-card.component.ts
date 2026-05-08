import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Course } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="course-card card" (click)="goToDetail()">
      <div class="card-image" [class.has-img]="course.image && course.image.length > 5" [style.background-image]="(course.image && course.image.length > 5) ? 'url(' + course.image + ')' : ''">
        <i class="fa-solid fa-laptop-code" *ngIf="!course.image || course.image.length <= 5"></i>
        
        <div class="match-badge" *ngIf="course.aiMatch">
          <span class="sparkle-icon">✨</span> {{ course.aiMatch }}% Phù hợp
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title">{{ course.title }}</h3>
        <p class="card-instructor"><i class="fa-solid fa-chalkboard-user"></i> {{ course.instructor }}</p>
        <div class="card-rating" *ngIf="showRating">
          <span class="stars">
            <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i>
          </span>
          <span class="rating-text">{{ course.rating }} ({{ course.reviewCount }})</span>
        </div>
        <div class="card-footer">
          <div class="price-box">
             <span class="price">{{ course.price | number }}đ</span>
             <span class="original-price" *ngIf="course.price !== undefined && course.originalPrice !== undefined && course.originalPrice > course.price">{{ course.originalPrice | number }}đ</span>
          </div>
          <button *ngIf="showCartBtn && !isEnrolled && !isInCart" class="btn-add-cart" (click)="addToCart($event)">
            <i class="fa-solid fa-cart-plus"></i> Thêm
          </button>
          <button *ngIf="showCartBtn && isInCart && !isEnrolled" class="btn-add-cart disabled" (click)="$event.stopPropagation()">
            <i class="fa-solid fa-check"></i> Đã Thêm
          </button>
          <button *ngIf="showCartBtn && isEnrolled" class="btn-add-cart enrolled" (click)="goToDetail(); $event.stopPropagation()">
            <i class="fa-solid fa-play"></i> Đã Sở Hữu
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .course-card {
      background: #ffffff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      display: flex;
      flex-direction: column;
      cursor: pointer;
      height: 100%;
    }
    .course-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      border-color: #cbd5e1;
    }
    .card-image {
      height: 180px;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 56px;
      color: #94a3b8;
      position: relative;
      background-size: cover;
      background-position: center;
    }
    .match-badge {
      position: absolute;
      bottom: -16px;
      left: 20px;
      background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
      color: #ffffff;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);
      border: 2px solid #ffffff;
      display: flex;
      align-items: center;
      gap: 6px;
      z-index: 10;
    }
    .card-body {
      padding: 32px 20px 24px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .card-title {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-instructor {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .card-rating {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 16px;
    }
    .stars { color: #f59e0b; font-size: 12px; letter-spacing: 1px; }
    .rating-text { font-size: 13px; color: #64748b; font-weight: 600;}
    .card-footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #f1f5f9;
      padding-top: 16px;
    }
    .price-box {
      display: flex;
      flex-direction: column;
    }
    .price {
      font-size: 18px;
      font-weight: 800;
      color: #ea580c;
    }
    .original-price {
      font-size: 13px;
      color: #94a3b8;
      text-decoration: line-through;
    }
    .btn-add-cart {
      background: #ffffff;
      color: #ea580c;
      border: 2px solid #fff7ed;
      padding: 8px 16px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-add-cart:hover:not(.disabled):not(.enrolled) {
      background: #ea580c;
      color: #ffffff;
      border-color: #ea580c;
      box-shadow: 0 4px 10px rgba(234, 88, 12, 0.2);
    }
    .btn-add-cart.disabled {
      background: #f1f5f9;
      color: #94a3b8;
      border-color: #e2e8f0;
      cursor: default;
    }
    .btn-add-cart.enrolled {
      background: #10b981;
      color: #ffffff;
      border-color: #10b981;
    }
    .btn-add-cart.enrolled:hover {
      background: #059669;
      border-color: #059669;
    }
  `]
})
export class CourseCardComponent {
  @Input() course!: Course;
  @Input() showRating = true;
  @Input() showCartBtn = false;
  @Input() darkMode = false;

  private router = inject(Router);
  private authService = inject(AuthService);
  private dataService = inject(DataService);

  get isInCart(): boolean {
    return this.dataService.cartItems().some(item => item.course?.id === this.course?.id);
  }

  get isEnrolled(): boolean {
    return this.dataService.enrolledCourses().some(ec => ec.course?.id === this.course?.id);
  }

  goToDetail() {
    if (this.course?.id) {
      this.router.navigate(['/course', this.course.id]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  addToCart(event: Event) {
    event.stopPropagation();
    
    if (!this.course?.id) return;

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

    this.dataService.addToCart(this.course.id).subscribe({
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
}
