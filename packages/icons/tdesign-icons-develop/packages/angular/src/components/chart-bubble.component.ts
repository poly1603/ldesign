// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/chart-bubble',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="chart-bubble">
        <g id="fill1">
            <path
                d="M13 14C13 15.6569 11.6569 17 10 17C8.34315 17 7 15.6569 7 14C7 12.3431 8.34315 11 10 11C11.6569 11 13 12.3431 13 14Z"
                [attr.fill]="color" />
            <path
                d="M18 6C18 7.10457 17.1046 8 16 8C14.8954 8 14 7.10457 14 6C14 4.89543 14.8954 4 16 4C17.1046 4 18 4.89543 18 6Z"
                [attr.fill]="color" />
            <path
                d="M20 14C20 14.5523 19.5523 15 19 15C18.4477 15 18 14.5523 18 14C18 13.4477 18.4477 13 19 13C19.5523 13 20 13.4477 20 14Z"
                [attr.fill]="color" />
        </g>
        <path id="stroke1" d="M21 21H3V3" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <g id="stroke2">
            <path
                d="M18 6C18 7.10457 17.1046 8 16 8C14.8954 8 14 7.10457 14 6C14 4.89543 14.8954 4 16 4C17.1046 4 18 4.89543 18 6Z"
                [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
            <path
                d="M19 15C18.4477 15 18 14.5523 18 14C18 13.4477 18.4477 13 19 13C19.5523 13 20 13.4477 20 14C20 14.5523 19.5523 15 19 15Z"
                [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
            <path
                d="M13 14C13 15.6569 11.6569 17 10 17C8.34315 17 7 15.6569 7 14C7 12.3431 8.34315 11 10 11C11.6569 11 13 12.3431 13 14Z"
                [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        </g>
    </g>
</svg>
  `,
  standalone: true
})
export class ChartBubbleComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
