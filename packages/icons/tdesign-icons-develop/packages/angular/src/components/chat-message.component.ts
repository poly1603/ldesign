// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/chat-message',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="chat-message">
        <path id="fill1" d="M2.5 3L21.5 3L21.5 17L6.5 17L2.5 20.5L2.5 3Z" [attr.fill]="color" />
        <path id="stroke1" d="M2.5 3L21.5 3L21.5 17L6.5 17L2.5 20.5L2.5 3Z" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
        <g id="stroke2">
            <path d="M7.00391 10L7 10L7 9.99609L7.00391 9.99609L7.00391 10Z" [attr.stroke]="color" stroke-[attr.width]="size"
                stroke-linecap="square" />
            <path d="M12.0039 10L12 10V9.99609L12.0039 9.99609V10Z" [attr.stroke]="color" stroke-[attr.width]="size"
                stroke-linecap="square" />
            <path d="M17.0039 10L17 10V9.99609L17.0039 9.99609V10Z" [attr.stroke]="color" stroke-[attr.width]="size"
                stroke-linecap="square" />
        </g>
    </g>
</svg>
  `,
  standalone: true
})
export class ChatMessageComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
