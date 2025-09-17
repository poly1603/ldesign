// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/quote',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="quote">
<g id="fill1">
<path d="M10.0001 6H3.5V12H8.00009L5.33343 18H6.00009L10.0001 12.3333V6Z" [attr.fill]="color"/>
<path d="M20.5 6H14V12H18.5L15.8333 18H16.5L20.5 12.3333V6Z" [attr.fill]="color"/>
</g>
<g id="stroke1">
<path d="M10.0001 6H3.5V12H8.00009L5.33343 18H6.00009L10.0001 12.3333V6Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M20.5 6H14V12H18.5L15.8333 18H16.5L20.5 12.3333V6Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</g>
</svg>

  `,
  standalone: true
})
export class QuoteComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
