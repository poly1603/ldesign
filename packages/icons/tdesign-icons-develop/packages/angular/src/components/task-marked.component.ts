// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/task-marked',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="task-marked">
<path id="fill2" d="M22.25 13.9961H15.75V21.5L19.0035 19.5L22.25 21.5V13.9961Z" [attr.fill]="color"/>
<path id="stroke1" d="M8 6V4H4V22H11.5M8 6H16M8 6V2H16V6M16 6V4H20V10" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M22.25 13.9961H15.75V21.5L19.0035 19.5L22.25 21.5V13.9961Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class TaskMarkedComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
