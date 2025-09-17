// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/task-error',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="task-error">
        <path id="stroke1" d="M8 6V4H4V22H11M8 6H16M8 6V2H16V6M16 6V4H20V11" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
        <path id="stroke2"
            d="M21.8287 16.1719L19.0003 19.0003M19.0003 19.0003L16.1719 21.8287M19.0003 19.0003L16.1719 16.1719M19.0003 19.0003L21.8287 21.8287"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class TaskErrorComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
