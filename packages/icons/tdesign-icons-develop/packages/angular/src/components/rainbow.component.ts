// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/rainbow',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="rainbow">
<path id="stroke1" d="M2 17C2 11.4772 6.47715 7 12 7C17.5228 7 22 11.4772 22 17M5 17C5 13.134 8.13401 10 12 10C15.866 10 19 13.134 19 17M8 17C8 14.7909 9.79086 13 12 13C14.2091 13 16 14.7909 16 17" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class RainbowComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
