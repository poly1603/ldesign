// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/chart-stacked',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="chart-stacked">
<g id="fill1">
<path d="M7 21H11V15.5H7V21Z" [attr.fill]="color"/>
<path d="M15 21H19V15.5H15V21Z" [attr.fill]="color"/>
</g>
<path id="stroke2" d="M19 21H15M19 21V6H15V21M19 21V15.5H15V21M11 21H7M11 21V10H7V21M11 21V15.5H7V21" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke1" d="M21 21H3V3" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class ChartStackedComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
