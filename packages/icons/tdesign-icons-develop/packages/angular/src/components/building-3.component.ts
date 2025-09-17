// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/building-3',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="building-3">
        <path id="fill1" d="M15 3V6H18V10H21V21H3V10H6V6H9V3H15Z" [attr.fill]="color" />
        <path id="fill2" d="M9 15V21H15V15H9Z" [attr.fill]="color" />
        <path id="stroke2" d="M9 15V21H15V15H9Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke1" d="M15 6V3H9V6M15 6H18V10M15 6H9M9 6H6V10M18 10H6M18 10H21V21H3V10H6" [attr.stroke]="color"
            stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class Building3Component {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
