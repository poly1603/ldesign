// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/arrow-triangle-up',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="arrow-triangle-up">
        <path id="fill1" d="M17.5 11L12 3.75L6.5 11H10V21H14V11H17.5Z" [attr.fill]="color" />
        <path id="stroke1" d="M17.5 11L12 3.75L6.5 11H10V21H14V11H17.5Z" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class ArrowTriangleUpComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
