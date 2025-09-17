// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/mouse',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="mouse">
        <path id="fill1" d="M5 10H19V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V10Z" [attr.fill]="color" />
        <path id="stroke1"
            d="M19 10V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V10M19 10H12M19 10V9C19 5.13401 15.866 2 12 2M5 10H12M5 10V9C5 5.13401 8.13401 2 12 2M12 10V2"
            [attr.stroke]="color" stroke-[attr.width]="size" />
    </g>
</svg>
  `,
  standalone: true
})
export class MouseComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
