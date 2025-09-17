// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/pending',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="pending">
        <path id="fill1"
            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
            [attr.fill]="color" />
        <path id="stroke1"
            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <g id="stroke2">
            <path d="M7 12L7.00391 12L7.00391 12.0039L7 12.0039L7 12Z" [attr.stroke]="color" stroke-[attr.width]="size"
                stroke-linecap="square" />
            <path d="M12 12L12.0039 12V12.0039L12 12.0039V12Z" [attr.stroke]="color" stroke-[attr.width]="size"
                stroke-linecap="square" />
            <path d="M17 12L17.0039 12V12.0039L17 12.0039V12Z" [attr.stroke]="color" stroke-[attr.width]="size"
                stroke-linecap="square" />
        </g>
    </g>
</svg>
  `,
  standalone: true
})
export class PendingComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
