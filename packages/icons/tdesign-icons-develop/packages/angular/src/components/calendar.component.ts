// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/calendar',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="calendar">
<path id="fill1" d="M21 10H3V21H21V10Z" [attr.fill]="color"/>
<path id="fill2" d="M21 10H3V5H21V10Z" [attr.fill]="color"/>
<path id="stroke1" d="M3 10H21M3 10V5H21V10M3 10V21H21V10M7 5V1.5M17 5V1.5" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</svg>

  `,
  standalone: true
})
export class CalendarComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
