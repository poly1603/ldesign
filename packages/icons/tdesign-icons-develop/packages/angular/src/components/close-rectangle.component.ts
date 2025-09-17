// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/close-rectangle',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="close-rectangle">
<path id="fill1" d="M21 3H3V21H21V3Z" [attr.fill]="color"/>
<path id="stroke1" d="M21 3H3V21H21V3Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M14.8287 9.17157L12.0003 12M12.0003 12L9.17188 14.8284M12.0003 12L9.17188 9.17157M12.0003 12L14.8287 14.8284" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class CloseRectangleComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
