// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/ink',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="ink">
<path id="fill1" d="M3 19.9996H21V13.0025L19 10.0039H5L3 13.0025V19.9996Z" [attr.fill]="color"/>
<path id="fill2" d="M7.2002 4V10.0043H16.8002V4H7.2002Z" [attr.fill]="color"/>
<path id="stroke2" d="M7.2002 4V10.0043H16.8002V4H7.2002Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke1" d="M3 19.9996H21V13.0025L19 10.0039H5L3 13.0025V19.9996Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class InkComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
