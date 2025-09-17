// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/tag',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="tag">
        <path id="fill1" d="M10.8788 21.6066L2.39355 13.1214L11.5149 4.01475L20.0002 4L20.0002 12.5L10.8788 21.6066Z"
            [attr.fill]="color" />
        <g id="stroke1">
            <path d="M10.8788 21.6066L2.39355 13.1214L11.5149 4.01475L20.0002 4L20.0002 12.5L10.8788 21.6066Z"
                [attr.stroke]="color" stroke-[attr.width]="size" />
            <path d="M15.9966 7.99976H16.0005L16.0005 8.00366L15.9966 8.00366V7.99976Z" [attr.stroke]="color"
                stroke-[attr.width]="size" />
        </g>
    </g>
</svg>
  `,
  standalone: true
})
export class TagComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
