// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/order-descending',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="order-descending">
        <path id="stroke1" d="M3 5H14M3 12H14M3 19H12" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke2" d="M22 17L19 20L16 17M19 5L19 18.75" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class OrderDescendingComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
