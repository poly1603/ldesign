// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/play-demo',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="play-demo">
<path id="fill1" d="M20 17V3H4V17H20Z" [attr.fill]="color"/>
<path id="fill2" d="M13 10L11 11.5V8.5L13 10Z" [attr.fill]="color"/>
<path id="stroke1" d="M3 3H21M11.5 17.5L7 22M12.5 17.5L17 22M20 3V17H4V3H20Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M13 10L11 11.5V8.5L13 10Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class PlayDemoComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
