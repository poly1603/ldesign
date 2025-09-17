// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/mark-as-unread',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="mark-as-unread">
<path id="fill1" d="M5 10H22V22H5V10Z" [attr.fill]="color"/>
<path id="stroke1" d="M5.5 10.5L13.5 16L21.5 10.5M5 10H22V11V22H5V11V10Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M1 19V8.5V7.5L9.5 2.5L13.75 5L15.875 6.25" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class MarkAsUnreadComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
