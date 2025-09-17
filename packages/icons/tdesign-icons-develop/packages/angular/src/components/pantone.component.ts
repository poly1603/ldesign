// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/pantone',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="pantone">
        <path id="fill1" d="M22 10.333V19.9997L2 19.9997L2 10.333L22 10.333Z" [attr.fill]="color" />
        <g id="fill2">
            <path d="M20.8241 10.3333L19.0005 5L3.35349 10.3333L20.8241 10.3333Z" [attr.fill]="color" />
            <path d="M14.1461 1.43164L2.99902 10.3359L3.35349 10.3333L17.1429 5.63318L14.1461 1.43164Z" [attr.fill]="color" />
        </g>
        <path id="stroke2"
            d="M3.35389 10.3333L20.8245 10.3333L19.0009 5L3.35389 10.3333ZM3.35389 10.3333L17.1433 5.63318L14.1465 1.43164L2.99942 10.3359M3.35389 10.3333L2.99942 10.3359M2.99942 10.3359H2.5"
            [attr.stroke]="color" stroke-[attr.width]="size" />
        <g id="stroke1">
            <path d="M6.28516 15.1641H6.28906V15.168H6.28516V15.1641Z" [attr.stroke]="color" stroke-[attr.width]="size"
                stroke-linecap="square" />
            <path d="M22 10.333V19.9997L2 19.9997L2 10.333L22 10.333Z" [attr.stroke]="color" stroke-[attr.width]="size"
                stroke-linecap="square" />
        </g>
    </g>
</svg>
  `,
  standalone: true
})
export class PantoneComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
