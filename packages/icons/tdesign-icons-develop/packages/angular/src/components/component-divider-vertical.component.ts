// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/component-divider-vertical',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="component-divider-vertical">
<g id="fill1">
<path d="M18 3H6V8H18V3Z" [attr.fill]="color"/>
<path d="M18 16H6V21H18V16Z" [attr.fill]="color"/>
</g>
<g id="stroke1">
<path d="M18 3H6V8H18V3Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path d="M18 16H6V21H18V16Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
<path id="stroke2" d="M3 12L21 12" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class ComponentDividerVerticalComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
