// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/task-1',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="task-1">
        <path id="fill1" d="M4 4H8V6H16V4H20V22H4V4Z" [attr.fill]="color" />
        <rect id="fill2" x="8" y="2" [attr.width]="size" [attr.height]="size" [attr.fill]="color" />
        <path id="stroke1" d="M16 4H20V22H4V4H8M16 4V2H8V4M16 4V6H8V4" [attr.stroke]="color" stroke-[attr.width]="size" />
    </g>
</svg>
  `,
  standalone: true
})
export class Task1Component {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
