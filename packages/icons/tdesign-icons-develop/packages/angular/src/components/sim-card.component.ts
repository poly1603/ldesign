// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/sim-card',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="sim-card">
<path id="fill1" d="M20 2V22H4V6L8 2H20Z" [attr.fill]="color"/>
<path id="stroke1" d="M20 2V22H4V6L8 2H20Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M9 13V16M12 10V13M15 13V16M15 9.99805H15.0039V10.002H15V9.99805ZM11.998 15.998H12.002V16.002H11.998V15.998ZM9 9.99805H9.00391V10.002H9V9.99805Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class SimCardComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
