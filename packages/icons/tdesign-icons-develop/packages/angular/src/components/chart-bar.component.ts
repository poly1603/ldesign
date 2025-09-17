// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/chart-bar',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="chart-bar">
        <g id="fill1">
            <path d="M7 10H11V21H7V10Z" [attr.fill]="color" />
            <path d="M15 6H19V21H15V6Z" [attr.fill]="color" />
        </g>
        <g id="stroke2">
            <path d="M7 10H11V21H7V10Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
            <path d="M15 6H19V21H15V6Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        </g>
        <path id="stroke1" d="M21 21H3V3" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class ChartBarComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
