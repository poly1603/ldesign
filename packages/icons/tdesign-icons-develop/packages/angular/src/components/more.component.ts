// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/more',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="more">
<g id="stroke1">
<path d="M11.5 4H12.5V5H11.5V4Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M11.5 11.5H12.5V12.5H11.5V11.5Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M11.5 19H12.5V20H11.5V19Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</g>
</svg>

  `,
  standalone: true
})
export class MoreComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
