// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/upload',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="upload">
        <path id="stroke1" d="M16.5 8.5L12 4L7.5 8.5M12 5.25V15" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
        <path id="stroke2" d="M20.5 15V20H3.5V15" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class UploadComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
