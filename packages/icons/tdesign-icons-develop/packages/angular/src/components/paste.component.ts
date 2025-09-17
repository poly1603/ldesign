// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/paste',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="paste">
<rect id="fill1" x="10" y="10" [attr.width]="size" [attr.height]="size" [attr.fill]="color"/>
<path id="stroke1" d="M10 10H21V21H10V10Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M3 11V14H6M6 3L3 3L3 6M15 6V3L12 3" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class PasteComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
