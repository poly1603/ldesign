// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/textformat-underline',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="textformat-underline">
        <path id="stroke1" d="M17 4L17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12L7 4" [attr.stroke]="color"
            stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke2" d="M19 21H5" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class TextformatUnderlineComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
