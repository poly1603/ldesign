// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/component-space',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="component-space">
<g id="fill1">
<path d="M21 4H3V10H21V4Z" [attr.fill]="color"/>
<path d="M21 14H3V20H21V14Z" [attr.fill]="color"/>
</g>
<g id="stroke1">
<path d="M21 4H3V10H21V4Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path d="M21 14H3V20H21V14Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</g>
</svg>

  `,
  standalone: true
})
export class ComponentSpaceComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
