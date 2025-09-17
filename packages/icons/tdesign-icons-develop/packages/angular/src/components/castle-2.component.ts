// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/castle-2',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="castle-2">
        <path id="fill1" d="M12 4C14.7614 4 17 6.23858 17 9V21H7V9C7 6.23858 9.23858 4 12 4Z" [attr.fill]="color" />
        <g id="fill2">
            <path d="M22 21V14C22 11.7909 20.2091 10 18 10H17V21H22Z" [attr.fill]="color" />
            <path d="M2 21H7V10H6C3.79086 10 2 11.7909 2 14V21Z" [attr.fill]="color" />
        </g>
        <path id="stroke2"
            d="M12 21V16M22 14V21H17V10H18C20.2091 10 22 11.7909 22 14ZM7 21H2V14C2 11.7909 3.79086 10 6 10H7V21Z"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke1" d="M12 4C9.23858 4 7 6.23858 7 9H17C17 6.23858 14.7614 4 12 4ZM12 4V3M7 9.85V21H17V9.85"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class Castle2Component {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
