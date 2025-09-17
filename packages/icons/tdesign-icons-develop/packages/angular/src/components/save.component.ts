// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/save',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="save">
        <path id="fill1" d="M3 3H16L21 8V21H3V3Z" [attr.fill]="color" />
        <g id="fill2">
            <path d="M12 3H7V7H12V3Z" [attr.fill]="color" />
            <path d="M7 21H17V15H7V21Z" [attr.fill]="color" />
        </g>
        <g id="stroke2">
            <path d="M12 3H7V7H12V3Z" [attr.stroke]="color" stroke-[attr.width]="size" />
            <path d="M7 21H17V15H7V21Z" [attr.stroke]="color" stroke-[attr.width]="size" />
        </g>
        <path id="stroke1" d="M3 3H16L21 8V21H3V3Z" [attr.stroke]="color" stroke-[attr.width]="size" />
    </g>
</svg>
  `,
  standalone: true
})
export class SaveComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
