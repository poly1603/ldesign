import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="logo-section">
          <div class="logo">🅰️</div>
          <div class="title-section">
            <h1 class="title">Angular + @ldesign/launcher</h1>
            <p class="subtitle">现代化的 Angular 开发体验</p>
          </div>
        </div>
        
        <nav class="navigation">
          <a routerLink="/home" routerLinkActive="active" class="nav-link">首页</a>
          <a routerLink="/about" routerLinkActive="active" class="nav-link">关于</a>
          
          <button 
            (click)="onToggleTheme()" 
            class="theme-toggle"
            [attr.aria-label]="isDark ? '切换到浅色主题' : '切换到深色主题'"
          >
            <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
            <span class="theme-text">{{ isDark ? '浅色' : '深色' }}</span>
          </button>
        </nav>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() isDark: boolean = false;
  @Output() themeToggle = new EventEmitter<void>();

  onToggleTheme(): void {
    this.themeToggle.emit();
  }
}
