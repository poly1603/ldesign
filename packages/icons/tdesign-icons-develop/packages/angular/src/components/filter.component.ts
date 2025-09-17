// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/filter',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="filter">
<path id="fill1" fill-rule="evenodd" clip-rule="evenodd" d="M19.5 4H4.5L10.5 12.5V20H13.5V12.5L19.5 4Z" [attr.fill]="color"/>
<path id="stroke1" fill-rule="evenodd" clip-rule="evenodd" d="M19.5 4H4.5L10.5 12.5V20H13.5V12.5L19.5 4Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class FilterComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
