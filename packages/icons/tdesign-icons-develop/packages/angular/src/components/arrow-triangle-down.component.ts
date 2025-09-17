// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/arrow-triangle-down',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="arrow-triangle-down">
        <path id="fill1" d="M17.5 13L12 20.25L6.5 13H10V3H14V13H17.5Z" [attr.fill]="color" />
        <path id="stroke1" d="M17.5 13L12 20.25L6.5 13H10V3H14V13H17.5Z" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class ArrowTriangleDownComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
