// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/chart-area',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="chart-area">
<path id="fill1" d="M12.4997 7.49957L7 12.5L7 17.2092L20 17.2092L20 6.5L15.4997 10.9996L12.4997 7.49957Z" [attr.fill]="color"/>
<path id="stroke1" d="M21 21H3V3" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M12.4997 7.49957L7 12.5L7 17.2092L20 17.2092L20 6.5L15.4997 10.9996L12.4997 7.49957Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class ChartAreaComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
