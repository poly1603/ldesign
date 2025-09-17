// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/chart-pie-filled',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 1.04492V11H22.9552C22.4796 5.7229 18.2771 1.52047 13 1.04492Z" [attr.fill]="color" />
    <path
        d="M11 1.04492V13H22.9552C22.45 18.6065 17.7381 23.0001 12 23.0001C5.92487 23.0001 1 18.0752 1 12.0001C1 6.26204 5.3935 1.55015 11 1.04492Z"
        [attr.fill]="color" />
</svg>
  `,
  standalone: true
})
export class ChartPieFilledComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
