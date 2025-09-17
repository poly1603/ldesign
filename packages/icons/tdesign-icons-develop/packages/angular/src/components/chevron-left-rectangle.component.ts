// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/chevron-left-rectangle',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="chevron-left-rectangle">
        <path id="fill1" d="M3 3H21V21H3V3Z" [attr.fill]="color" />
        <path id="stroke1" d="M3 3H21V21H3V3Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke2" d="M13.5 16L9.5 12L13.5 8" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class ChevronLeftRectangleComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
