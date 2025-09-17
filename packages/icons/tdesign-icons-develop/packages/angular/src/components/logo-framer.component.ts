// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/logo-framer',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="logo-framer">
<g id="fill1">
<path d="M12 15V21.5L5.5 15V8.5H12L18.5 15H12Z" [attr.fill]="color"/>
<path d="M18.5 2H5.5L12 8.5H18.5V2Z" [attr.fill]="color"/>
</g>
<path id="stroke1" d="M12 8.5L18.5 15H12V21.5L5.5 15V8.5H12ZM12 8.5L5.5 2H18.5V8.5H12Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</svg>

  `,
  standalone: true
})
export class LogoFramerComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
