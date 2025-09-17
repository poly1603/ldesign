// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/chart-column',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="chart-column">
        <g id="fill1">
            <path d="M18 9V5L3 5L3 9L18 9Z" [attr.fill]="color" />
            <path d="M14 17V13L3 13L3 17L14 17Z" [attr.fill]="color" />
        </g>
        <g id="stroke2">
            <path d="M18 9V5L3 5L3 9L18 9Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
            <path d="M14 17V13L3 13L3 17L14 17Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        </g>
        <path id="stroke1" d="M3 3L3 21H21" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class ChartColumnComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
