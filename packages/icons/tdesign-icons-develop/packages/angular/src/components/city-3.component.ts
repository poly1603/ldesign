// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/city-3',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="city-3">
        <path id="fill1" d="M16 21V8H8V21H16Z" [attr.fill]="color" />
        <g id="fill2">
            <path d="M3 21H8V3H3V21Z" [attr.fill]="color" />
            <path d="M21 21V3H16V21H21Z" [attr.fill]="color" />
        </g>
        <path id="stroke2" d="M12 21V17M11 12H13" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke1" d="M8 21H3V3H8V21ZM8 21V8H16V21M8 21H16M16 21H21V3H16V21Z" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class City3Component {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
