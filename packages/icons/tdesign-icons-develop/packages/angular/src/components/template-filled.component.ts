// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/template-filled',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2H2V8H22V2Z" [attr.fill]="color" />
    <path d="M22 10H11V22H22V10Z" [attr.fill]="color" />
    <path d="M9 22V10H2V22H9Z" [attr.fill]="color" />
</svg>
  `,
  standalone: true
})
export class TemplateFilledComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
