// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/edit',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="edit">
        <path id="fill1"
            d="M14.1048 6.00427L4.78744 15.3216L3.99805 20.0001L8.67652 19.2107L17.9939 9.89336L14.1048 6.00427Z"
            [attr.fill]="color" />
        <path id="fill2" fill-rule="evenodd" clip-rule="evenodd"
            d="M17.9936 9.89339L21.0506 6.83635L17.1615 2.94727L14.1045 6.0043L17.9936 9.89339Z" [attr.fill]="color" />
        <path id="stroke1"
            d="M14.1048 6.00427L4.78744 15.3216L3.99805 20.0001L8.67652 19.2107L17.9939 9.89336M14.1048 6.00427L17.9939 9.89336M14.1048 6.00427L17.1615 2.94727L21.0506 6.83635L17.9939 9.89336"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class EditComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
