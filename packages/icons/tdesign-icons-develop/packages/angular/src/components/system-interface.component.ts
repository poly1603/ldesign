// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/system-interface',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="system-interface">
        <path id="fill1" d="M3 21H21V8H3V21Z" [attr.fill]="color" />
        <path id="fill2" d="M21 3H3V8H21V3Z" [attr.fill]="color" />
        <path id="stroke1" d="M3 8H21M3 8V21H21V8M3 8V3H21V8" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        <g id="stroke2">
            <path d="M7.00391 12V12.0039H7V12H7.00391Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
            <path d="M11.0039 12V12.0039H11V12H11.0039Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
            <path d="M15.0039 12V12.0039H15V12H15.0039Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square" />
        </g>
    </g>
</svg>
  `,
  standalone: true
})
export class SystemInterfaceComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
