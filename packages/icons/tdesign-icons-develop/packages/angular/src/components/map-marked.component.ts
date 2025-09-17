// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/map-marked',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="map-marked">
<path id="fill2" d="M21.25 12.9961H14.75V20.5L18.0035 18.5L21.25 20.5V12.9961Z" [attr.fill]="color"/>
<path id="stroke1" d="M15 6.5L9 3L3 6.5V20L9 17.5M15 6.5L21 4V9M15 6.5V9M9 17.5V3.5M9 17.5L10.5 18.375" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M21.25 12.9961H14.75V20.5L18.0035 18.5L21.25 20.5V12.9961Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class MapMarkedComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
