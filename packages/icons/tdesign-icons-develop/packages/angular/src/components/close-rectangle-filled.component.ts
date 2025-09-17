// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/close-rectangle-filled',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M22 2V22H2V2H22ZM16.2431 9.17154L14.8289 7.75732L12.0005 10.5858L9.17203 7.75732L7.75781 9.17154L10.5862 12L7.75781 14.8284L9.17203 16.2426L12.0005 13.4142L14.8289 16.2426L16.2431 14.8284L13.4147 12L16.2431 9.17154Z"
        [attr.fill]="color" />
</svg>
  `,
  standalone: true
})
export class CloseRectangleFilledComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
