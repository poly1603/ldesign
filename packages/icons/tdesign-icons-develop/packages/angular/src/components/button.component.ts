// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/button',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="button">
<path id="fill1" d="M3 6H21V18H3V6Z" [attr.fill]="color"/>
<path id="fill2" d="M7 10H17V14H7V10Z" [attr.fill]="color"/>
<path id="stroke1" d="M3 6H21V18H3V6Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path id="stroke2" d="M7 10H17V14H7V10Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</svg>

  `,
  standalone: true
})
export class ButtonComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
