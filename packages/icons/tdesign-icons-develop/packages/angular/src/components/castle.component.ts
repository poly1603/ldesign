// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/castle',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="castle">
        <path id="fill1" d="M6 5H18C18 10.3333 18 15.6667 18 21H6V5Z" [attr.fill]="color" />
        <g id="fill2">
            <path d="M14 14H10V21H14V14Z" [attr.fill]="color" />
            <path d="M2 21H6V15H2V21Z" [attr.fill]="color" />
            <path d="M18 21H22V15H18V21Z" [attr.fill]="color" />
            <path d="M14 14H10V21H14V14Z" [attr.fill]="color" />
        </g>
        <path id="stroke2" d="M2 15V21H6V15H2ZM2 15V14M22 15V21H18V15H22ZM22 15V14M10 14H14V21H10V14Z" [attr.stroke]="color"
            stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke1" d="M18 5V3M18 5H14M18 5C18 10.3333 18 15.6667 18 21H6V5M6 5V3M6 5H10M10 3V5M10 5H14M14 3V5"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class CastleComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
