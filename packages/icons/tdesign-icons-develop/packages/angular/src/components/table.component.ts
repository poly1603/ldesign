// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/table',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="table">
<path id="fill1" d="M3 7L21 7L21 21L3 21L3 7Z" [attr.fill]="color"/>
<path id="fill2" d="M21 3H3V7H21V3Z" [attr.fill]="color"/>
<path id="stroke1" d="M3 21H9M3 21H21M3 21V7M9 21H15M9 21V14M15 21H21M15 21V14M21 21V7M21 7H15M21 7V3H3V7M21 7H3M15 7H9M15 7V14M9 7H3M9 7V14M3 14H9M9 14H15M15 14H21" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class TableComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
