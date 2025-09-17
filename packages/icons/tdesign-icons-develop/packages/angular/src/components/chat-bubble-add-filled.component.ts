// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/chat-bubble-add-filled',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M12 1C5.92487 1 1 5.92487 1 12C1 14.6615 1.94632 17.1038 3.51936 19.006L1.30049 23H12C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1ZM13 13V16H11V13H8V11H11V8H13V11H16V13H13Z"
        [attr.fill]="color" />
</svg>
  `,
  standalone: true
})
export class ChatBubbleAddFilledComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
