// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/audio',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="audio">
        <path id="fill1" d="M20 22L4 22L4 2L20 2L20 22Z" [attr.fill]="color" />
        <path id="fill2"
            d="M8 14C8 11.7909 9.79086 10 12 10C14.2091 10 16 11.7909 16 14C16 16.2091 14.2091 18 12 18C9.79086 18 8 16.2091 8 14Z"
            [attr.fill]="color" />
        <path id="stroke1" d="M20 22L4 22L4 2L20 2L20 22Z" [attr.stroke]="color" stroke-[attr.width]="size" />
        <g id="stroke2">
            <path
                d="M8 14C8 11.7909 9.79086 10 12 10C14.2091 10 16 11.7909 16 14C16 16.2091 14.2091 18 12 18C9.79086 18 8 16.2091 8 14Z"
                [attr.stroke]="color" stroke-[attr.width]="size" />
            <path d="M12 6H11.9961V5.99609H12V6Z" [attr.stroke]="color" stroke-[attr.width]="size" />
        </g>
    </g>
</svg>
  `,
  standalone: true
})
export class AudioComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
