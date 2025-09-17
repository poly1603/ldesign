// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/mirror',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="mirror">
<g id="fill1">
<path d="M8 8.5V17.5H3L8 8.5Z" [attr.fill]="color"/>
<path d="M16 8.5V17.5H21L16 8.5Z" [attr.fill]="color"/>
</g>
<path id="stroke2" d="M12 3L12 21" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<g id="stroke1">
<path d="M8 8.5V17.5H3L8 8.5Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M16 8.5V17.5H21L16 8.5Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</g>
</svg>

  `,
  standalone: true
})
export class MirrorComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
