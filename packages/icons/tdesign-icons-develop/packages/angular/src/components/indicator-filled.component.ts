// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/indicator-filled',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M10.3529 1V4H13.6471V1H15.6471V4H17.5376L21.6335 7L17.5376 10H15.6471V12.1111H22V18.1111H15.6471V23H13.6471V18.1111H10.3529V23H8.35294V18.1111H6.46243L2.36645 15.1111L6.46243 12.1111H8.35294V10H2V4H8.35294V1H10.3529ZM13.6471 10H10.3529V12.1111H13.6471V10Z"
        [attr.fill]="color" />
</svg>
  `,
  standalone: true
})
export class IndicatorFilledComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
