// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/cake',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="cake">
        <path id="fill1" d="M4 11H20V21H4V11Z" [attr.fill]="color" />
        <path id="fill2" d="M4 21H20V16H18L15 17L12 16L9 17L6 16H4V21Z" [attr.fill]="color" />
        <path id="stroke2"
            d="M8 6V11M12 6V11M16 6V11M7.99805 2.99805H8.00195V3.00195H7.99805V2.99805ZM11.998 2.99805H12.002V3.00195H11.998V2.99805ZM15.998 2.99805H16.002V3.00195H15.998V2.99805Z"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <path id="stroke1" d="M2 21H22M4 16H6L9 17L12 16L15 17L18 16H20M4 11H20V21H4V11Z" [attr.stroke]="color"
            stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class CakeComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
