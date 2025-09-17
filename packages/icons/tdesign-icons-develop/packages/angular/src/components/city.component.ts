// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/city',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="city">
<path id="fill1" d="M9 5.5V11H21V21H3V3L9 5.5Z" [attr.fill]="color"/>
<path id="fill2" d="M13 16V21H17V16H13Z" [attr.fill]="color"/>
<path id="stroke2" d="M13 16V21H17V16H13Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path id="stroke1" d="M9 21V11M9 21H21V11H9M9 21H3V3L9 5.5V11" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</svg>

  `,
  standalone: true
})
export class CityComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
