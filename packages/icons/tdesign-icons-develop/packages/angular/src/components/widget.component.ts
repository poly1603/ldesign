// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/widget',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="widget">
        <path id="fill1" d="M22 21V13H2V21H22Z" [attr.fill]="color" />
        <path id="stroke1"
            d="M2.50002 13H21.5M6 4H18L22 13V21H2V13L6 4ZM10 17H10.0039V17.0039H10V17ZM6 17H6.00391V17.0039H6V17Z"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class WidgetComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
