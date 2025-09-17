// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/component-layout',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="component-layout">
<path id="fill1" d="M21 3L16.5 3L12 3L12 21H16.5H21L21 3Z" [attr.fill]="color"/>
<path id="fill2" d="M12 3L7.5 3L3 3L3 21H7.5H12L12 3Z" [attr.fill]="color"/>
<path id="stroke1" d="M12 3H3L3 21H12M12 3H21V21H12M12 3V12M12 21V12M12 12H3" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class ComponentLayoutComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
