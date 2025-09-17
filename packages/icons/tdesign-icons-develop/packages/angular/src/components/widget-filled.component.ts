// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/widget-filled',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 25 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M18.8762 3H5.57645L1.22632 12.7878V22H23.2263V12.7878L18.8762 3ZM3.76508 12L6.87619 5L17.5764 5L20.6876 12L3.76508 12ZM7.23022 16V18.0039H5.22632V16H7.23022ZM11.2302 16V18.0039H9.22632V16H11.2302Z"
        [attr.fill]="color" />
</svg>
  `,
  standalone: true
})
export class WidgetFilledComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
