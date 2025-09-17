// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/collage',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="collage">
<path id="fill1" d="M3 3L3 21H9L11 12L13 3L3 3Z" [attr.fill]="color"/>
<path id="fill2" d="M21 3L13 3L9 21L21 21L21 3Z" [attr.fill]="color"/>
<path id="stroke1" d="M13 3L3 3L3 21H9M13 3L21 3L21 16M13 3L11 12M9 21L21 21V16M9 21L11 12M21 16L11 12" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</svg>

  `,
  standalone: true
})
export class CollageComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
