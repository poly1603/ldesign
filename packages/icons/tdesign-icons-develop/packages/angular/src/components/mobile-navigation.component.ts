// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/mobile-navigation',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="mobile-navigation">
        <path id="fill1" d="M5 2H19V22H5V2Z" [attr.fill]="color" />
        <path id="fill2" d="M12 7L15 13L12 12.0625L9 13L12 7Z" [attr.fill]="color" />
        <path id="stroke1" d="M5 2H19V22H5V2Z" [attr.stroke]="color" stroke-[attr.width]="size" />
        <g id="stroke2">
            <path d="M12 7L15 13L12 12.0625L9 13L12 7Z" [attr.stroke]="color" stroke-[attr.width]="size" />
            <path d="M12 18H12.0039V18.0039H12V18Z" [attr.stroke]="color" stroke-[attr.width]="size" />
        </g>
    </g>
</svg>
  `,
  standalone: true
})
export class MobileNavigationComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
