// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/tv',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="tv">
        <path id="stroke1" d="M6 18L2.00099 18L2 3H22L22 18H18" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
        <path id="stroke2"
            d="M8.46585 20.5375L7.75874 21.2446H7.75732L8.46585 20.5375ZM8.46585 20.5375L12 17.002L15.5355 20.5375M15.5355 20.5375L16.2426 21.2446H16.244L15.5355 20.5375Z"
            [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="round" />
    </g>
</svg>
  `,
  standalone: true
})
export class TvComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
