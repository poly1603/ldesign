// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/map-ruler',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="map-ruler" clip-path="url(#clip0_543_3544)">
        <path id="fill1" d="M15.8573 1.62988L22.2543 8.02694L7.86093 22.4203L1.46387 16.0233L15.8573 1.62988Z"
            [attr.fill]="color" />
        <path id="stroke1"
            d="M5.06208 12.4248L6.66429 14.027M12.2589 5.22852L13.8611 6.83072M8.66047 8.82617L11.0623 11.228M15.8573 1.62988L22.2543 8.02694L7.86093 22.4203L1.46387 16.0233L15.8573 1.62988Z"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class MapRulerComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
