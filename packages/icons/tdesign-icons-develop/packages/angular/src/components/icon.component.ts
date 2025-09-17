// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/icon',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="icon">
<path id="fill1" d="M3 14.5C3 18.0899 5.91015 21 9.5 21C13.0899 21 16 18.0899 16 14.5C16 10.9101 13.0899 8 9.5 8C5.91015 8 3 10.9101 3 14.5Z" [attr.fill]="color"/>
<path id="fill2" d="M9 3H21V15H16C16 10.8955 13.1045 8 9 8V3Z" [attr.fill]="color"/>
<path id="stroke2" d="M9 8V3H21V15H16" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path id="stroke1" d="M3 14.5C3 18.0899 5.91015 21 9.5 21C13.0899 21 16 18.0899 16 14.5C16 10.9101 13.0899 8 9.5 8C5.91015 8 3 10.9101 3 14.5Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</svg>

  `,
  standalone: true
})
export class IconComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
