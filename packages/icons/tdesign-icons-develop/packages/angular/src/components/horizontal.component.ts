// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/horizontal',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="horizontal">
        <rect id="fill1" x="3" y="11" [attr.width]="size" [attr.height]="size" [attr.fill]="color" />
        <path id="fill2" d="M3 3H21V7H3V3Z" [attr.fill]="color" />
        <g id="stroke1">
            <path d="M3 11H21V21H3V11Z" [attr.stroke]="color" stroke-[attr.width]="size" />
            <path d="M3 3H21V7H3V3Z" [attr.stroke]="color" stroke-[attr.width]="size" />
        </g>
    </g>
</svg>
  `,
  standalone: true
})
export class HorizontalComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
