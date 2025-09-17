// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/home',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="home">
<path id="fill1" d="M3 10L12 2.5L21 10V21H3V10Z" [attr.fill]="color"/>
<path id="fill2" d="M9 14H15V21H9V14Z" [attr.fill]="color"/>
<path id="stroke2" d="M9 14H15V21H9V14Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke1" d="M3 10L12 2.5L21 10V21H3V10Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class HomeComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
