// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/hourglass',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="hourglass">
<g id="fill1">
<path d="M19 21H5V19C5 15.134 8.13401 12 12 12C15.866 12 19 15.134 19 19V21Z" [attr.fill]="color"/>
<path d="M5 3H19V5C19 8.86599 15.866 12 12 12C8.13401 12 5 8.86599 5 5V3Z" [attr.fill]="color"/>
</g>
<path id="stroke1" d="M12 12C15.866 12 19 15.134 19 19V21H5V19C5 15.134 8.13401 12 12 12ZM12 12C8.13401 12 5 8.86599 5 5V3H19V5C19 8.86599 15.866 12 12 12Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</svg>

  `,
  standalone: true
})
export class HourglassComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
