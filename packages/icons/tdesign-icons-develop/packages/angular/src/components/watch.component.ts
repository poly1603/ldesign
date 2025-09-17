// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/watch',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="watch">
        <path id="fill1"
            d="M5 7C5 5.89543 5.89543 5 7 5H17C18.1046 5 19 5.89543 19 7V17C19 18.1046 18.1046 19 17 19H7C5.89543 19 5 18.1046 5 17V7Z"
            [attr.fill]="color" />
        <g id="fill2">
            <path d="M8 1H16L16.5 5H7.5L8 1Z" [attr.fill]="color" />
            <path d="M7.5 19H16.5L16 23H8L7.5 19Z" [attr.fill]="color" />
        </g>
        <g id="stroke2">
            <path d="M8 1H16L16.5 5H7.5L8 1Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
            <path d="M7.5 19H16.5L16 23H8L7.5 19Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        </g>
        <path id="stroke1"
            d="M20 10V14M7 19H17C18.1046 19 19 18.1046 19 17V7C19 5.89543 18.1046 5 17 5H7C5.89543 5 5 5.89543 5 7V17C5 18.1046 5.89543 19 7 19Z"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class WatchComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
