// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/brush',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="brush">
        <path id="fill1" d="M10.5 2.5L7 6L18 17L21.5 13.5L18 10L21 7L17 3L14 6L10.5 2.5Z" [attr.fill]="color" />
        <path id="fill2" d="M1.5 11.5L12.5 22.5L18 17L7 6L1.5 11.5Z" [attr.fill]="color" />
        <path id="stroke1" d="M7 6L18 17M7 6L1.5 11.5L12.5 22.5L18 17M7 6L10.5 2.5L14 6L17 3L21 7L18 10L21.5 13.5L18 17"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class BrushComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
