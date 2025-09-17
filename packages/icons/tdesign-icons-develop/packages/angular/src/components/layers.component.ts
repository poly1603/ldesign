// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/layers',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="layers">
        <path id="fill1" d="M4.5 6.125L12 3L19.5 6.125L12 9.25L4.5 6.125Z" [attr.fill]="color" />
        <path id="stroke1" d="M4.5 6.125L12 3L19.5 6.125L12 9.25L4.5 6.125Z" [attr.stroke]="color" stroke-[attr.width]="size" />
        <path id="stroke2" d="M3 11.5005L12 15.3771L21 11.5005M21 17.5005L12 21.3771L3 17.5005" [attr.stroke]="color"
            stroke-[attr.width]="size" />
    </g>
</svg>
  `,
  standalone: true
})
export class LayersComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
