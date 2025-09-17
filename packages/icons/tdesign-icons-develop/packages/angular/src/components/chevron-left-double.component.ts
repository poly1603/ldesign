// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/chevron-left-double',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="chevron-left.double">
        <path id="stroke1" d="M10.5 7.5L6 12L10.5 16.5M17 7.5L12.5 12L17 16.5" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class ChevronLeftDoubleComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
