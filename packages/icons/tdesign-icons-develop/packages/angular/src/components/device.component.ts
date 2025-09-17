// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/device',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="device">
        <path id="fill2" d="M15 9H23V21H15V9Z" [attr.fill]="color" />
        <path id="stroke1" d="M11 18H2V3H22V5M6 21H11" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <g id="stroke2">
            <path d="M15 9H23V21H15V9Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
            <path d="M18.998 17.998H19.002V18.002H18.998V17.998Z" [attr.stroke]="color" stroke-[attr.width]="size"
                stroke-linecap="square" />
        </g>
    </g>
</svg>
  `,
  standalone: true
})
export class DeviceComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
