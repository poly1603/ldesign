// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/merge-cells',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="merge-cells">
<path id="fill1" d="M3 3L21 3L21 21L3 21L3 3Z" [attr.fill]="color"/>
<path id="stroke1" d="M12 7V3M12 21V17M3 3V21H21V3H3Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M8.33008 13.768L10.0978 12.0002L8.33008 10.2324M15.768 10.2321L14.0002 11.9998L15.768 13.7676" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class MergeCellsComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
