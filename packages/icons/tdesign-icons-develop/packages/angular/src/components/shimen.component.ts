// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/shimen',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="shimen">
        <path id="fill1"
            d="M1.99902 4.00098L11.999 3.00098L21.999 4.00098V7.00098C18.6657 7.33431 15.3324 7.66764 11.999 8.00098L1.99902 7.00098V4.00098Z"
            [attr.fill]="color" />
        <g id="fill2">
            <path d="M3.99902 21.0008L4.99902 7.30078L7.99902 7.60078L8.99902 21.0008H3.99902Z" [attr.fill]="color" />
            <path
                d="M19.999 21.0008L18.999 7.30078C17.9605 7.40464 17.1041 7.50075 16.1038 7.60078L14.999 21.0008H19.999Z"
                [attr.fill]="color" />
        </g>
        <g id="stroke2">
            <path d="M3.99902 21.0008L4.99902 7.30078L7.99902 7.60078L8.99902 21.0008H3.99902Z" [attr.stroke]="color"
                stroke-[attr.width]="size" />
            <path
                d="M19.999 21.0008L18.999 7.30078C17.9605 7.40464 17.1041 7.50075 16.1038 7.60078L14.999 21.0008H19.999Z"
                [attr.stroke]="color" stroke-[attr.width]="size" />
        </g>
        <path id="stroke1"
            d="M1.99902 4.00098L11.999 3.00098L21.999 4.00098V7.00098C18.6657 7.33431 15.3324 7.66764 11.999 8.00098L1.99902 7.00098V4.00098Z"
            [attr.stroke]="color" stroke-[attr.width]="size" />
    </g>
</svg>
  `,
  standalone: true
})
export class ShimenComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
