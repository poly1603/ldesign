// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/chart-radar',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="chart-radar ">
        <path id="fill1" d="M12.0002 2L22.0102 9.27269L18.1868 21.0402H5.81371L1.99023 9.27269L12.0002 2Z"
            [attr.fill]="color" />
        <path id="stroke1"
            d="M12.0002 2L22.0102 9.27269M12.0002 2L1.99023 9.27269M12.0002 2L12 12.5251M22.0102 9.27269L18.1868 21.0402M22.0102 9.27269L12 12.5251M18.1868 21.0402H5.81371M18.1868 21.0402L12 12.5251M5.81371 21.0402L1.99023 9.27269M5.81371 21.0402L12 12.5251M1.99023 9.27269L12 12.5251"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class ChartRadarComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
