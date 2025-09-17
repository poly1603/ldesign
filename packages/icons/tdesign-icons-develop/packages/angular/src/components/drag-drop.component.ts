// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/drag-drop',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M1.99902 15V2H14.999V7H12.999V4L3.99902 4L3.99902 13H6.99902L6.99902 15H1.99902ZM7.99902 20L7.99902 8L19.999 8V13.5L17.999 13.5L17.999 10H9.99902L9.99902 18H13.499V20H7.99902ZM16.7771 23.6838L13.4096 13.3784L23.6684 16.7845L19.0116 19.0116L16.7771 23.6838Z"
        [attr.fill]="color" id="drag-drop" />
</svg>
  `,
  standalone: true
})
export class DragDropComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
