// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/map',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="map">
<path id="fill1" d="M3 6.5V20L9 17.5L15 21L21 17.5V4L15 6.5L9 3L3 6.5Z" [attr.fill]="color"/>
<path id="stroke2" d="M9 16.75V3.75M15 7.25002V20.25" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke1" d="M3 6.5V20L9 17.5L15 21L21 17.5V4L15 6.5L9 3L3 6.5Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class MapComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
