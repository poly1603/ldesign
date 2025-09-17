// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/combination',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="combination">
        <g id="fill1">
            <path d="M12 3L16.3302 9.75H7.66992L12 3Z" [attr.fill]="color" />
            <path d="M3 14H10V21H3V14Z" [attr.fill]="color" />
            <path
                d="M21 17.5C21 19.433 19.433 21 17.5 21C15.567 21 14 19.433 14 17.5C14 15.567 15.567 14 17.5 14C19.433 14 21 15.567 21 17.5Z"
                [attr.fill]="color" />
        </g>
        <g id="stroke1">
            <path d="M12 3L16.3302 9.75H7.66992L12 3Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
            <path d="M3 14H10V21H3V14Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
            <path
                d="M21 17.5C21 19.433 19.433 21 17.5 21C15.567 21 14 19.433 14 17.5C14 15.567 15.567 14 17.5 14C19.433 14 21 15.567 21 17.5Z"
                [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        </g>
    </g>
</svg>
  `,
  standalone: true
})
export class CombinationComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
