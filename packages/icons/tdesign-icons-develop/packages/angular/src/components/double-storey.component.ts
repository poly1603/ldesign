// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/double-storey',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="double-storey">
        <path id="fill1" d="M17 9H20V21H4V9H7V3H17V9Z" [attr.fill]="color" />
        <path id="fill2" d="M9 21V14H15V21H9Z" [attr.fill]="color" />
        <g id="stroke2">
            <path d="M11.998 5.99805H12.002V6.00195H11.998V5.99805Z" [attr.stroke]="color" stroke-[attr.width]="size"
                stroke-linecap="square" />
            <path d="M9 21V14H15V21H9Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        </g>
        <path id="stroke1"
            d="M6 3H7M7 3V9H17V3M7 3H17M17 3H18M3 9H4M4 9V21M4 9H20M4 21H3M4 21H20M20 9V21M20 9H21M20 21H21"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class DoubleStoreyComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
