// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/ipod',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="ipod-ipod">
        <path id="fill1" d="M4 22H20V14H4V22Z" [attr.fill]="color" />
        <path id="fill2" d="M20 2H4V14H20V2Z" [attr.fill]="color" />
        <path id="stroke2"
            d="M8 10V14M12 6V14M16 8V14M13 18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18C11 17.4477 11.4477 17 12 17C12.5523 17 13 17.4477 13 18Z"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke1" d="M4 14V22H20V14M4 14H20M4 14V2H20V14" [attr.stroke]="color" stroke-[attr.width]="size" />
    </g>
</svg>
  `,
  standalone: true
})
export class IpodComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
