// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/lighting-circle',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="lighting-circle">
<path id="fill1" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" [attr.fill]="color"/>
<path id="fill2" fill-rule="evenodd" clip-rule="evenodd" d="M13 5.5L12.5 5.5L8 13.5L11 13.5L11 18.5L11.5 18.5L16 10.5L13 10.5L13 5.5Z" [attr.fill]="color"/>
<path id="stroke1" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" fill-rule="evenodd" clip-rule="evenodd" d="M13 5.5L12.5 5.5L8 13.5L11 13.5L11 18.5L11.5 18.5L16 10.5L13 10.5L13 5.5Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class LightingCircleComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
