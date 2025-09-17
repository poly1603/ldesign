// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/typography',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="typography">
<path id="fill1" d="M16 4L3 4L3 10L16 10V4Z" [attr.fill]="color"/>
<path id="stroke1" d="M16 4L3 4L3 10L16 10V4Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path id="stroke2" d="M3 15H21M3 20H21" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class TypographyComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
