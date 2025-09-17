// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/page-head',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="page-head">
<path id="fill1" d="M20 7L20 3L4 3L4 7L20 7Z" [attr.fill]="color"/>
<path id="stroke1" d="M20 7L20 3L4 3L4 7L20 7Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path id="stroke2" d="M20 22L20 11L4 11L4 22" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</svg>

  `,
  standalone: true
})
export class PageHeadComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
