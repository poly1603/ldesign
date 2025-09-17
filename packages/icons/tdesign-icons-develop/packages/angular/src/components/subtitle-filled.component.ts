// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/subtitle-filled',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M23 3H1V21H23V3ZM7 8H11V10H7V14H11V16H7C5.89543 16 5 15.1046 5 14V10C5 8.89543 5.89543 8 7 8ZM15 8H19V10H15V14H19V16H15C13.8954 16 13 15.1046 13 14V10C13 8.89543 13.8954 8 15 8Z"
        [attr.fill]="color" />
</svg>
  `,
  standalone: true
})
export class SubtitleFilledComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
