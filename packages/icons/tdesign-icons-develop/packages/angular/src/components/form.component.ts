// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/form',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="form">
<path id="fill1" d="M3 8H21V21L3 21V8Z" [attr.fill]="color"/>
<path id="fill2" d="M3 3H21V8H3V3Z" [attr.fill]="color"/>
<path id="stroke1" d="M21 8H3M21 8V21L3 21V8M21 8V3H3V8" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M17 12.5L7 12.5M7 16.5L13 16.5" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class FormComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
