// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/card',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="card">
        <path id="fill1" d="M7 4H17V20H7V4Z" [attr.fill]="color" />
        <g id="fill2">
            <path d="M3 6V18H7V6H3Z" [attr.fill]="color" />
            <path d="M21 6V18H17V6H21Z" [attr.fill]="color" />
        </g>
        <g id="stroke2">
            <path d="M3 6V18H7V6H3Z" [attr.stroke]="color" stroke-[attr.width]="size" />
            <path d="M21 6V18H17V6H21Z" [attr.stroke]="color" stroke-[attr.width]="size" />
        </g>
        <path id="stroke1" d="M7 4H17V20H7V4Z" [attr.stroke]="color" stroke-[attr.width]="size" />
    </g>
</svg>
  `,
  standalone: true
})
export class CardComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
