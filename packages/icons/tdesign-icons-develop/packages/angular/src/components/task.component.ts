// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/task',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="task">
        <path id="fill1" d="M20 22V4H16V6H8V4H4V22H20Z" [attr.fill]="color" />
        <path id="fill2" d="M16 6H8V2H16V6Z" [attr.fill]="color" />
        <path id="stroke1" d="M16 4H20V22H4V4H8M16 4V2H8V4M16 4V6H8V4" [attr.stroke]="color" stroke-[attr.width]="size" />
        <path id="stroke2" d="M10 12H14M10 16H14" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class TaskComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
