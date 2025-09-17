// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/hamburger',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="hamburger">
<g id="fill1">
<path d="M4 10C4 5.58172 7.58173 3 12 3C16.4183 3 20 5.58172 20 10H4Z" [attr.fill]="color"/>
<path d="M4 18H20C20 20.2091 18.2091 22 16 22H8C5.79086 22 4 20.2091 4 18Z" [attr.fill]="color"/>
</g>
<g id="stroke1">
<path d="M4 10C4 5.58172 7.58173 3 12 3C16.4183 3 20 5.58172 20 10H4Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M4 18H20C20 20.2091 18.2091 22 16 22H8C5.79086 22 4 20.2091 4 18Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
<path id="stroke2" d="M3 15L6 13L9 15L12 13L15 15L18 13L21 15" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class HamburgerComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
