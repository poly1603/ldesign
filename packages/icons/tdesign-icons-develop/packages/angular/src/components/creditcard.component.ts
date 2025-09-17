// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/creditcard',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="creditcard">
<path id="fill1" d="M22 10V20H2L2 10L22 10Z" [attr.fill]="color"/>
<path id="fill2" d="M22 4H2V10H22V4Z" [attr.fill]="color"/>
<path id="stroke1" d="M22 4L2 4M22 4V20H2L2 4M22 4V10H2L2 4" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M9 15L6 15" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class CreditcardComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
