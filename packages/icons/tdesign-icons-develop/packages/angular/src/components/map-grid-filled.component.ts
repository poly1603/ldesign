// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/map-grid-filled',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 11V9H11V11H9Z" [attr.fill]="color" />
    <path d="M13 11V9H15V11H13Z" [attr.fill]="color" />
    <path d="M13 13H15L15 15H13V13Z" [attr.fill]="color" />
    <path d="M11 13V15H9L9 13H11Z" [attr.fill]="color" />
    <path
        d="M22 2H2V22H22V2ZM9 7H11V6H13V7H15V6H17V7H18V9H17V11H18V13H17V15H18V17H17L17 18H15V17H13V18H11V17H9V18H7L7 17H6V15H7V13H6V11H7V9H6V7H7V6H9V7Z"
        [attr.fill]="color" />
</svg>
  `,
  standalone: true
})
export class MapGridFilledComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
