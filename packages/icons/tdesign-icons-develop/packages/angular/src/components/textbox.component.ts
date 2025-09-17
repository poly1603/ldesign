// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/textbox',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="textbox">
<path id="fill1" d="M3 3L21 3L21 21L3 21L3 3Z" [attr.fill]="color"/>
<path id="stroke1" d="M3 3L21 3L21 21L3 21L3 3Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path id="stroke2" d="M7 7.5H12M12 7.5L17 7.5M12 7.5V17" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class TextboxComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
