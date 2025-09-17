// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/menu',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="menu">
        <path id="fill1" d="M21 3H3V10.5H21V3Z" [attr.fill]="color" />
        <path id="fill2" d="M3 21H21V10.5H3V21Z" [attr.fill]="color" />
        <path id="stroke1" d="M3 10.5V21H21V10.5M3 10.5H21M3 10.5V3H21V10.5M17 7H11M7 7H6.99609V7.00391" [attr.stroke]="color"
            stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class MenuComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
