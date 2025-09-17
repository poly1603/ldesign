// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/flip-to-back',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="flip-to-back">
        <path id="stroke1" d="M4 8.5V20H15.5" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke2"
            d="M9.5 16H8V14.5M13.5 16H14.5M18.5 4H20V5.5M20 9.5V10.5M18.5 16H20V14.5M8 9.5V10.5M9.5 4H8V5.5M13.5 4H14.5"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class FlipToBackComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
