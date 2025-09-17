// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/file-attachment',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="file-attachment">
        <path id="stroke1" d="M20 11V7L15 2H4V22H12M14 2V8H20" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
        <path id="stroke2"
            d="M19 19V15.5C19 14.6716 18.3284 14 17.5 14C16.6716 14 16 14.6716 16 15.5V20C16 21.6569 17.3431 23 19 23C20.6569 23 22 21.6569 22 20V16.5"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class FileAttachmentComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
