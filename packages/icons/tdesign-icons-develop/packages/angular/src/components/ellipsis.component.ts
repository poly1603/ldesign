// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/ellipsis',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="ellipsis">
<g id="stroke1">
<path d="M4 11.5H5V12.5H4V11.5Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M11.5 11.5H12.5V12.5H11.5V11.5Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M19 11.5H20V12.5H19V11.5Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</g>
</svg>

  `,
  standalone: true
})
export class EllipsisComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
