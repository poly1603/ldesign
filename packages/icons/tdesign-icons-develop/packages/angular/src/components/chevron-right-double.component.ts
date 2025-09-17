// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/chevron-right-double',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="chevron-right.double">
        <path id="stroke1" d="M13.5 16.5L18 12L13.5 7.5M7 16.5L11.5 12L7 7.5" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class ChevronRightDoubleComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
