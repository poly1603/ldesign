// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/grid-view',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="grid-view">
<g id="fill1">
<path d="M10 3H3V10H10V3Z" [attr.fill]="color"/>
<path d="M14 3H21V10H14V3Z" [attr.fill]="color"/>
<path d="M21 14H14V21H21V14Z" [attr.fill]="color"/>
<path d="M10 14H3V21H10V14Z" [attr.fill]="color"/>
</g>
<g id="stroke1">
<path d="M10 3H3V10H10V3Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M14 3H21V10H14V3Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M21 14H14V21H21V14Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M10 14H3V21H10V14Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</g>
</svg>

  `,
  standalone: true
})
export class GridViewComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
