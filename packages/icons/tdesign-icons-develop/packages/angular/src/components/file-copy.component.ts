// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/file-copy',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="file-copy">
<path id="fill1" d="M7 18V2H14V8H20V18H7Z" [attr.fill]="color"/>
<path id="stroke1" d="M14 2V8H20M14 2H15L20 7V8M14 2H7V18H20V8" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path id="stroke2" d="M3 6L3 22H14" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class FileCopyComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
