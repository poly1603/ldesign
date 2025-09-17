// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/pin',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="pin">
        <path id="fill1"
            d="M21.962 6.28235L17.7197 2.04004L9.94034 8.39867L7.81896 6.27728L3.57422 10.522L13.4737 20.4215L17.7185 16.1768L15.5972 14.0555L21.962 6.28235Z"
            [attr.fill]="color" />
        <path id="stroke1"
            d="M2.16016 21.8358L8.52412 15.4718M17.7197 2.04004L21.9621 6.28235L15.5973 14.0555L17.7185 16.1768L13.4738 20.4215L3.57431 10.522L7.81905 6.27728L9.94043 8.39867L17.7197 2.04004Z"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class PinComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
