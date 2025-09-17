// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/tab',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="tab">
<g id="fill1">
<path d="M6.5 15L6.5 5L2.5 5L2.5 15H6.5Z" [attr.fill]="color"/>
<path d="M14 15L14 5L10 5V15L14 15Z" [attr.fill]="color"/>
<path d="M21.5 15V5L17.5 5L17.5 15H21.5Z" [attr.fill]="color"/>
</g>
<g id="stroke1">
<path d="M6.5 15L6.5 5L2.5 5L2.5 15H6.5Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path d="M14 15L14 5L10 5V15L14 15Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path d="M21.5 15V5L17.5 5L17.5 15H21.5Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
<path id="stroke2" d="M2.5 19L21.5 19" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class TabComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
