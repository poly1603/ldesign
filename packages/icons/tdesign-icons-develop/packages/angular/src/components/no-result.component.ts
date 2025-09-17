// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/no-result',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="no-result">
        <path id="fill1"
            d="M8.12602 14H2V21H22V14H15.874C15.4299 15.7252 13.8638 17 12 17C10.1362 17 8.57006 15.7252 8.12602 14Z"
            [attr.fill]="color" />
        <path id="stroke1"
            d="M2.5 14H8.12602C8.57006 15.7252 10.1362 17 12 17C13.8638 17 15.4299 15.7252 15.874 14H21.5M22 21H2V14L6 7H18L22 14V21Z"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke2" d="M6.50098 3.5L5.00098 2M17.499 3.5L18.999 2M12 3V1" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class NoResultComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
