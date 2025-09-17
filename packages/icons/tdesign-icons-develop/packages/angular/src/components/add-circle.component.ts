// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/add-circle',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="add-circle">
<ellipse id="fill1" cx="12" cy="12" rx="10" ry="10" transform="rotate(180 12 12)" [attr.fill]="color"/>
<ellipse id="stroke1" cx="12" cy="12" rx="10" ry="10" transform="rotate(180 12 12)" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path id="stroke2" d="M16.5 12L12 12M12 12L7.5 12M12 12L12 7.5M12 12V16.5" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class AddCircleComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
