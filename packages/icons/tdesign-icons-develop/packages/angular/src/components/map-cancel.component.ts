// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/map-cancel',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="map-cancel">
        <path id="stroke1" d="M15 6.5L9 3L3 6.5V20L9 17.5M15 6.5L21 4V10M15 6.5V10M9 17.5V3.5M9 17.5L10.5 18.375"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke2"
            d="M20.8287 14.1719L18.0003 17.0003M18.0003 17.0003L15.1719 19.8287M18.0003 17.0003L15.1719 14.1719M18.0003 17.0003L20.8287 19.8287"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class MapCancelComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
