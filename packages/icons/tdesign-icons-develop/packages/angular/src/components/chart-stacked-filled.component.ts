// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/chart-stacked-filled',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 20V2H2V22H22V20H20V16.5H14V20H12V16.5H6V20H4Z" [attr.fill]="color" />
    <path d="M6 14.5H12V9H6V14.5Z" [attr.fill]="color" />
    <path d="M14 14.5H20V5H14V14.5Z" [attr.fill]="color" />
</svg>
  `,
  standalone: true
})
export class ChartStackedFilledComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
