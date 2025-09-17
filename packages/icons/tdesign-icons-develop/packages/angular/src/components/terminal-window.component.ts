// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/terminal-window',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="terminal-window">
<path id="fill1" d="M2 20L22 20L22 9L2 9L2 20Z" [attr.fill]="color"/>
<path id="fill2" d="M2 9L22 9L22 4L2 4L2 9Z" [attr.fill]="color"/>
<path id="stroke1" d="M2 9H22M2 9L2 4L22 4V9M2 9L2 20H22V9" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M6 16L6 13" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class TerminalWindowComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
