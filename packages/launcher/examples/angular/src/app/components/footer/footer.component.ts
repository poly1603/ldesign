import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 Angular + @ldesign/launcher 示例 - 感谢使用</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--card-background);
      border-top: 1px solid var(--border-color);
      padding: 2rem 0;
      margin-top: 2rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      text-align: center;
    }
    
    p {
      color: var(--text-secondary);
      margin: 0;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 0 1rem;
      }
    }
  `]
})
export class FooterComponent {}
