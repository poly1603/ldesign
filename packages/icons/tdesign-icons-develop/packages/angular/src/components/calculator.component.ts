// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/calculator',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="calculator">
<path id="fill1" d="M4 22H20V8H4V22Z" [attr.fill]="color"/>
<path id="fill2" d="M20 2H4V8H20V2Z" [attr.fill]="color"/>
<path id="stroke1" d="M20 8V2H4V8M20 8H4M20 8V22H4V8" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M8 13H10M14 13H16M14 17H16M8 17H10" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class CalculatorComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
