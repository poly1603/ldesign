// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/building',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="building">
        <path id="fill1" d="M16 6H19V10H20V21H4V10H5V6H8V3H16V6Z" [attr.fill]="color" />
        <path id="fill2" d="M9 15V21H15V15H9Z" [attr.fill]="color" />
        <path id="stroke2" d="M9 15V21H15V15H9Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke1"
            d="M16 6V3H8V6M16 6H19V10M16 6H8M8 6H5V10M19 10H5M19 10H20M5 10H4M4 10V21M4 10H3M4 21H3M4 21H20M20 10V21M20 10H21M20 21H21"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class BuildingComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
