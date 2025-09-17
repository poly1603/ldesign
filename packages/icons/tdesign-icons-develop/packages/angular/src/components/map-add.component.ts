// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/map-add',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="map-add">
        <path id="stroke1" d="M16 6.5L8 3L3 6.5V19L8 16M16 6.5L21 4V10M16 6.5V10M8 16V3.5M8 16L9.99798 16.999"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke2" d="M18 13V17M18 17V21M18 17H14M18 17H22" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class MapAddComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
