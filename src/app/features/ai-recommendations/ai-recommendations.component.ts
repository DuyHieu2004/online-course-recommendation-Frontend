import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-ai-recommendations',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  template: `
    <app-header />
    <div class="ai-page">
      <div class="bg-glow glow-1"></div>
      <div class="bg-glow glow-2"></div>

      <div class="container">
        

        <section class="ai-section">
          <div class="section-header">
            <div class="icon-pulse"><i class="fa-solid fa-bullseye"></i></div>
            <h2>Độ phù hợp cao nhất</h2>
          </div>
          
          <div class="ai-grid top-grid">
            <div *ngFor="let course of dataService.courses().slice(0, 3)" class="ai-card">
              <div class="ai-card-image" [class.has-img]="course.anhUrl" [style.background-image]="course.anhUrl ? 'url(' + course.anhUrl + ')' : ''">
                <i class="fa-solid fa-laptop-code" *ngIf="!course.anhUrl"></i>
                
                <div class="match-badge">
                  <span class="sparkle-icon">✨</span> {{ course.aiMatch }}% Phù hợp
                </div>
              </div>
              
              <div class="ai-card-body">
                <h3>{{ course.title }}</h3>
                <p class="ai-instructor"><i class="fa-solid fa-chalkboard-user"></i> {{ course.instructor }}</p>
                
                <div class="ai-reason" *ngIf="course.aiReason">
                  <strong>💡 Tại sao đề xuất?</strong><br>
                  {{ course.aiReason }}
                </div>
                
                <div class="ai-card-footer">
                  <span class="ai-price">{{ course.price | number }}đ</span>
                  <button class="btn-add-cart">
                    <i class="fa-solid fa-cart-plus"></i> Thêm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="ai-section mt-5">
          <div class="section-header">
            <div class="icon-pulse blue"><i class="fa-solid fa-people-group"></i></div>
            <h2>Người học tương tự bạn cũng xem</h2>
          </div>
          
          <div class="ai-grid bottom-grid">
            <div *ngFor="let course of dataService.courses().slice(4)" class="ai-card-sm">
              <div class="ai-sm-image" [style.background-image]="course.anhUrl ? 'url(' + course.anhUrl + ')' : ''">
                 <i class="fa-solid fa-code" *ngIf="!course.anhUrl"></i>
              </div>
              <div class="ai-sm-body">
                <h4>{{ course.title }}</h4>
                <span class="ai-price-sm">{{ course.price | number }}đ</span>
                <button class="btn-add-cart-sm">
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --clr-brand: #ea580c;
      --clr-brand-light: #fff7ed;
      --clr-ai-1: #8b5cf6; /* Tím AI */
      --clr-ai-2: #3b82f6; /* Xanh AI */
      --clr-text-main: #1f2937;
      --clr-text-muted: #6b7280;
      --clr-bg-main: #f8fafc;
      --clr-white: #ffffff;
      --shadow-soft: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      --shadow-hover: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
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

    /* ===== Hero Section ===== */
    .ai-hero {
      padding: 60px 0 40px;
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }

    .ai-badge-top {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
      color: var(--clr-ai-1);
      padding: 8px 20px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 24px;
      border: 1px solid rgba(139, 92, 246, 0.2);
    }

    .ai-hero h1 {
      font-size: 42px;
      font-weight: 900;
      line-height: 1.2;
      margin-bottom: 16px;
      letter-spacing: -1px;
    }

    .text-gradient {
      background: linear-gradient(135deg, var(--clr-ai-1) 0%, var(--clr-ai-2) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .ai-desc {
      font-size: 16px;
      color: var(--clr-text-muted);
      line-height: 1.6;
    }

    /* ===== Section Headers ===== */
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .icon-pulse {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--clr-brand-light);
      color: var(--clr-brand);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .icon-pulse.blue { background: #eff6ff; color: var(--clr-ai-2); }
    .ai-section h2 { font-size: 22px; font-weight: 800; }
    .mt-5 { margin-top: 60px; }

    /* ===== Cards Grid ===== */
    .top-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 28px;
    }

    /* Thẻ Khóa học chính */
    .ai-card {
      background: var(--clr-white);
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-soft);
      display: flex;
      flex-direction: column;
    }

    .ai-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-hover);
      border-color: #cbd5e1;
    }

    .ai-card-image {
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

    /* Nút Badge AI lấp lánh */
    .match-badge {
      position: absolute;
      bottom: -16px;
      left: 20px;
      background: linear-gradient(135deg, var(--clr-ai-1) 0%, var(--clr-ai-2) 100%);
      color: var(--clr-white);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);
      border: 2px solid var(--clr-white);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ai-card-body {
      padding: 32px 20px 24px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .ai-card-body h3 {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .ai-instructor {
      font-size: 14px;
      color: var(--clr-text-muted);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Khung giải thích lý do đề xuất */
    .ai-reason {
      font-size: 13px;
      background: #f8fafc;
      border-left: 3px solid var(--clr-ai-1);
      padding: 12px 14px;
      border-radius: 0 8px 8px 0;
      color: var(--clr-text-muted);
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .ai-reason strong { color: var(--clr-text-main); }

    .ai-card-footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #f1f5f9;
      padding-top: 16px;
    }

    .ai-price {
      font-size: 22px;
      font-weight: 800;
      color: var(--clr-brand);
    }

    /* Nút thêm giỏ hàng */
    .btn-add-cart {
      background: var(--clr-white);
      color: var(--clr-brand);
      border: 2px solid var(--clr-brand-light);
      padding: 8px 16px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-add-cart:hover {
      background: var(--clr-brand);
      color: var(--clr-white);
      border-color: var(--clr-brand);
      box-shadow: 0 4px 10px rgba(234, 88, 12, 0.2);
    }

    /* ===== Similar Courses Grid ===== */
    .bottom-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 20px;
    }

    .ai-card-sm {
      background: var(--clr-white);
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      transition: all 0.2s;
    }
    .ai-card-sm:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-soft);
      border-color: #cbd5e1;
    }

    .ai-sm-image {
      height: 120px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: #cbd5e1;
      background-size: cover;
      background-position: center;
    }

    .ai-sm-body { padding: 16px; }
    .ai-sm-body h4 {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 8px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .ai-price-sm {
      display: block;
      font-weight: 800;
      color: var(--clr-brand);
      font-size: 16px;
      margin-bottom: 12px;
    }

    .btn-add-cart-sm {
      width: 100%;
      background: var(--clr-brand-light);
      color: var(--clr-brand);
      border: none;
      padding: 10px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-add-cart-sm:hover {
      background: var(--clr-brand);
      color: var(--clr-white);
    }
  `]
})



export class AiRecommendationsComponent {
  constructor(public dataService: DataService) {}
}
