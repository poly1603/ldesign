// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/outbox-filled',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M22 2L2 2L2 22H22V2ZM4 14.5L4 4L20 4V14.5H15.0352L14.7823 15.1248C14.3365 16.2261 13.2574 17 12 17C10.7426 17 9.66348 16.2261 9.2177 15.1248L8.96479 14.5L4 14.5ZM12 5.08579L7.58579 9.5L9 10.9142L11 8.91421V14H13V8.91421L15 10.9142L16.4142 9.5L12 5.08579Z"
        [attr.fill]="color" />
</svg>
  `,
  standalone: true
})
export class OutboxFilledComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
