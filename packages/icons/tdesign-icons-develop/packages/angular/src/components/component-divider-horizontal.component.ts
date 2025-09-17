// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/component-divider-horizontal',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="component-divider-horizontal">
<g id="fill1">
<path d="M8 18L8 6L3 6L3 18H8Z" [attr.fill]="color"/>
<path d="M21 18V6L16 6L16 18H21Z" [attr.fill]="color"/>
</g>
<g id="stroke1">
<path d="M8 18L8 6L3 6L3 18H8Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path d="M21 18V6L16 6L16 18H21Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
<path id="stroke2" d="M12 3L12 21" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class ComponentDividerHorizontalComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
