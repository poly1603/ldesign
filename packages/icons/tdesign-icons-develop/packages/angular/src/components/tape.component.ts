// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/tape',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="tape">
        <path id="fill1" d="M22 4V20H2L2 4L22 4Z" [attr.fill]="color" />
        <g id="fill2">
            <path d="M17 7H7L5 4H19L17 7Z" [attr.fill]="color" />
            <path
                d="M10 13C10 14.1046 9.10457 15 8 15C6.89543 15 6 14.1046 6 13C6 11.8954 6.89543 11 8 11C9.10457 11 10 11.8954 10 13Z"
                [attr.fill]="color" />
            <path
                d="M18 13C18 14.1046 17.1046 15 16 15C14.8954 15 14 14.1046 14 13C14 11.8954 14.8954 11 16 11C17.1046 11 18 11.8954 18 13Z"
                [attr.fill]="color" />
        </g>
        <g id="stroke1">
            <path d="M22 4V20H2L2 4L22 4Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
            <path d="M17 7H7L5 4H19L17 7Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        </g>
        <g id="stroke2">
            <path
                d="M10 13C10 14.1046 9.10457 15 8 15C6.89543 15 6 14.1046 6 13C6 11.8954 6.89543 11 8 11C9.10457 11 10 11.8954 10 13Z"
                [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
            <path
                d="M18 13C18 14.1046 17.1046 15 16 15C14.8954 15 14 14.1046 14 13C14 11.8954 14.8954 11 16 11C17.1046 11 18 11.8954 18 13Z"
                [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        </g>
    </g>
</svg>
  `,
  standalone: true
})
export class TapeComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
