// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/indicator',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="indicator">
<path id="fill1" d="M20.9998 17.1113V13.1113H6.78924L4.05859 15.1113L6.78924 17.1113H20.9998Z" [attr.fill]="color"/>
<path id="fill2" d="M3 9V5H17.2105L19.9412 7L17.2105 9H3Z" [attr.fill]="color"/>
<path id="stroke1" d="M9.35303 2V5M9.35303 9V13.1111M14.647 9V13.1111M9.35303 17.1113V22.0002M14.647 17.1113V22.0002M14.647 2V5M3 5V9H17.2105L19.9412 7L17.2105 5H3ZM21 13.1113V17.1113H6.78949L4.05884 15.1113L6.78949 13.1113H21Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class IndicatorComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
