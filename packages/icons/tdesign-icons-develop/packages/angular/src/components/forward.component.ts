// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/forward',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="forward">
<g id="fill1">
<path d="M12 12L6.75 17.25V6.75L12 12Z" [attr.fill]="color"/>
<path d="M19 12L13.75 17.25V6.75L19 12Z" [attr.fill]="color"/>
</g>
<g id="stroke1">
<path d="M12 12L6.75 17.25V6.75L12 12Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M19 12L13.75 17.25V6.75L19 12Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</g>
</svg>

  `,
  standalone: true
})
export class ForwardComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
