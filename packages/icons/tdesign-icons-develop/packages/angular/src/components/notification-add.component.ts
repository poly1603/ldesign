// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/notification-add',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="notification-add">
        <path id="fill1" d="M3 19H21V16L19 13V8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8V13L3 16V19Z"
            [attr.fill]="color" />
        <path id="fill2" d="M12 22.5C13.933 22.5 15.5 20.933 15.5 19H8.5C8.5 20.933 10.067 22.5 12 22.5Z"
            [attr.fill]="color" />
        <g id="stroke1">
            <path d="M5 8V13L3 16V19H21V16L19 13V8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8Z" [attr.stroke]="color"
                stroke-[attr.width]="size" stroke-linecap="square" />
            <path d="M8.5 19H15.5C15.5 20.933 13.933 22.5 12 22.5C10.067 22.5 8.5 20.933 8.5 19Z" [attr.stroke]="color"
                stroke-[attr.width]="size" stroke-linecap="square" />
        </g>
        <path id="stroke2" d="M15 10H12M12 10L9 10M12 10L12 7M12 10V13" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class NotificationAddComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
