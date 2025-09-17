// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/archway',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="archway">
        <path id="fill1" d="M4 21V9H20V21H4Z" [attr.fill]="color" />
        <path id="fill2" d="M5 4H19L20 9H4L5 4Z" [attr.fill]="color" />
        <path id="stroke1"
            d="M19 4H5M19 4L20 9M19 4H20M19 4V3M5 4L4 9M5 4H4M5 4V3M4 9V21M4 9H3M4 9H9M4 21H3M4 21H9M20 9V21M20 9H21M20 9H15M20 21H21M20 21H15M9 21V9M9 21H15M9 9H15M15 9V21"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class ArchwayComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
