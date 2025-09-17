// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/error-triangle',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="error-triangle">
        <path id="fill1" d="M12.0003 3L22.2194 20.7H1.78125L12.0003 3Z" [attr.fill]="color" />
        <path id="stroke1" d="M12.0003 3L22.2194 20.7H1.78125L12.0003 3Z" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
        <path id="stroke2" d="M12 10.5V14M12 17.5H12.0039V17.5039H12V17.5Z" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class ErrorTriangleComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
