// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/component-breadcrumb',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="component-breadcrumb">
<path id="fill1" d="M14 12L9.49999 7.5L3 7.5L3 16.5L9.5 16.5L14 12Z" [attr.fill]="color"/>
<path id="stroke1" d="M14 12L9.49999 7.5L3 7.5L3 16.5L9.5 16.5L14 12Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M16 7.5L20.5 12L16 16.5" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class ComponentBreadcrumbComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
