// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/screencast',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="screencast">
        <path id="stroke1" d="M6 18L2.00099 18L2 3H22L22 18H18" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
        <path id="stroke2" d="M8 21.0003L12.0001 17L16.0001 21L8 21.0003Z" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="round" />
    </g>
</svg>
  `,
  standalone: true
})
export class ScreencastComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
