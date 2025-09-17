// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/user-avatar',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="user-avatar">
        <path id="fill1" d="M3 3L21 3L21 21L3 21L3 3Z" [attr.fill]="color" />
        <g id="fill2">
            <path
                d="M15.5 9.5C15.5 11.433 13.933 13 12 13C10.067 13 8.5 11.433 8.5 9.5C8.5 7.567 10.067 6 12 6C13.933 6 15.5 7.567 15.5 9.5Z"
                [attr.fill]="color" />
            <path d="M5.5 20C5.5 17.7909 7.29086 16 9.5 16H14.5C16.7091 16 18.5 17.7909 18.5 20V21H5.5V20Z"
                [attr.fill]="color" />
        </g>
        <g id="stroke2">
            <path
                d="M15.5 9.5C15.5 11.433 13.933 13 12 13C10.067 13 8.5 11.433 8.5 9.5C8.5 7.567 10.067 6 12 6C13.933 6 15.5 7.567 15.5 9.5Z"
                [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
            <path d="M5.5 20C5.5 17.7909 7.29086 16 9.5 16H14.5C16.7091 16 18.5 17.7909 18.5 20V21H5.5V20Z"
                [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        </g>
        <path id="stroke1" d="M3 3L21 3L21 21L3 21L3 3Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class UserAvatarComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
