// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/piano',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="piano">
        <path id="fill1" d="M2 20H22V10H2V20Z" [attr.fill]="color" />
        <path id="fill2" d="M2 4H22V10H2V4Z" [attr.fill]="color" />
        <path id="stroke1" d="M22 10V4H2V10M22 10H2M22 10V20H2V10M6 10V15M10 10V15M14 10V15M18 10V15" [attr.stroke]="color"
            stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class PianoComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
