// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/send',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="send" clip-path="url(#clip0_543_8119)">
        <path id="fill1" d="M2 3.5L21.5 12L2 20.5L5 12L2 3.5Z" [attr.fill]="color" />
        <path id="stroke1" d="M5 12L2 20.5L21.5 12L2 3.5L5 12ZM5 12H10" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class SendComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
