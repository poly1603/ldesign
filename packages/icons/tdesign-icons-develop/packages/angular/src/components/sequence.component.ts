// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/sequence',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="sequence">
<g id="fill1">
<path d="M3 5H9V9H3V5Z" [attr.fill]="color"/>
<path d="M15 5H21V9H15V5Z" [attr.fill]="color"/>
</g>
<path id="stroke1" d="M6 19V9M18 19V9M3 5H9V9H3V5ZM15 5H21V9H15V5Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M12.6052 18.5L15 16L12.6052 13.5M13.75 16L9 16" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class SequenceComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
