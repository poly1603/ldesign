// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/backward',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="backward">
<g id="fill1">
<path d="M5 12L10.25 17.25V6.75L5 12Z" [attr.fill]="color"/>
<path d="M12 12L17.25 17.25V6.75L12 12Z" [attr.fill]="color"/>
</g>
<g id="stroke1">
<path d="M5 12L10.25 17.25V6.75L5 12Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M12 12L17.25 17.25V6.75L12 12Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</g>
</svg>

  `,
  standalone: true
})
export class BackwardComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
