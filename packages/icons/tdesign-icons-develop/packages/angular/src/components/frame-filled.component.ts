// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/frame-filled',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 2H2V11H11V2Z" [attr.fill]="color" />
    <path d="M13 2V11H22V2H13Z" [attr.fill]="color" />
    <path d="M22 13H13V22H22V13Z" [attr.fill]="color" />
    <path d="M11 22V13H2V22H11Z" [attr.fill]="color" />
</svg>
  `,
  standalone: true
})
export class FrameFilledComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
