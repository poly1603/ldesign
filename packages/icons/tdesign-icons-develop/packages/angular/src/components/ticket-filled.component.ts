// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/ticket-filled',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M1 4H23V9.04148C21.5812 9.27953 20.5 10.5135 20.5 12C20.5 13.4865 21.5812 14.7205 23 14.9585V20H1V14.9585C2.41887 14.7205 3.50002 13.4865 3.50002 12C3.50002 10.5135 2.41887 9.27951 1 9.04148V4ZM16 11V9H8V11H16ZM16 15V13H8V15H16Z"
        [attr.fill]="color" />
</svg>
  `,
  standalone: true
})
export class TicketFilledComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
