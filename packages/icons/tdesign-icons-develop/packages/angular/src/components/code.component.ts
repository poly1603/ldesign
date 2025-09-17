// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/code',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="code">
        <path id="stroke1" d="M5.53553 15.5355L2 12L5.53553 8.46448M18.4644 15.5355L21.9999 12L18.4644 8.46448"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke2" d="M14 4.00049L10 20.0005" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class CodeComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
