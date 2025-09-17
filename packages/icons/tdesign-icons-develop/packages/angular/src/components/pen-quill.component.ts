// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/pen-quill',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="pen-quill">
        <path id="fill1" d="M15.5 2L17 7L22 8.5L12.5 18L6.5 17.5L6 11.5L15.5 2Z" [attr.fill]="color" />
        <path id="stroke1"
            d="M6.49994 17.5L12.4999 18L21.9999 8.5L16.9999 7M6.49994 17.5L5.99994 11.5L15.4999 2L16.9999 7M6.49994 17.5L3 21.0001M6.49994 17.5L16.9999 7"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class PenQuillComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
