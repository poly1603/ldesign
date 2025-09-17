// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/loading',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M12 2.25C6.61556 2.25 2.25 6.61556 2.25 12C2.25 17.3844 6.61556 21.75 12 21.75V19.3125C7.96142 19.3125 4.6875 16.0386 4.6875 12C4.6875 7.96142 7.96142 4.6875 12 4.6875C16.0386 4.6875 19.3125 7.96142 19.3125 12H21.75C21.75 6.61556 17.3844 2.25 12 2.25Z"
        [attr.fill]="color" id="loading" />
</svg>
  `,
  standalone: true
})
export class LoadingComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
