// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/image',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="image">
<path id="fill1" d="M3 21H20L9 10L3 16V21Z" [attr.fill]="color"/>
<circle id="fill2" cx="15.75" cy="8.25" r="2" [attr.fill]="color"/>
<path id="stroke1" d="M3 16V3H21V21H20M3 16V21H20M3 16L9 10L20 21" [attr.stroke]="color" stroke-[attr.width]="size"/>
<circle id="stroke2" cx="15.75" cy="8.25" r="2" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</svg>

  `,
  standalone: true
})
export class ImageComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
