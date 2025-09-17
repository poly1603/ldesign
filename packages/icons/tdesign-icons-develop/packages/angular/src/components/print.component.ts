// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/print',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="print">
        <path id="fill1" d="M22.5005 8L1.50049 8L1.50049 17H6.00049L6.00049 15L18.0005 15V17L22.5005 17V8Z"
            [attr.fill]="color" />
        <g id="fill2">
            <path d="M19.0005 3V8L5.00049 8L5.00049 3L19.0005 3Z" [attr.fill]="color" />
            <path d="M18.0005 15V21L6.00049 21L6.00049 15H18.0005Z" [attr.fill]="color" />
        </g>
        <g id="stroke2">
            <path d="M19.0005 3V8L5.00049 8L5.00049 3L19.0005 3Z" [attr.stroke]="color" stroke-[attr.width]="size"
                stroke-linecap="square" />
            <path d="M18.0005 15V21L6.00049 21V15H18.0005Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        </g>
        <g id="stroke1">
            <path d="M18.0005 11.5H18.0044V11.4961H18.0005V11.5Z" [attr.stroke]="color" stroke-[attr.width]="size"
                stroke-linecap="square" />
            <path d="M22.5005 8H1.50049V17H6.00049V15H18.0005V17H22.5005V8Z" [attr.stroke]="color" stroke-[attr.width]="size"
                stroke-linecap="square" />
        </g>
    </g>
</svg>
  `,
  standalone: true
})
export class PrintComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
