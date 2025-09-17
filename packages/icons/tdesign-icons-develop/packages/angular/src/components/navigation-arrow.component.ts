// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/navigation-arrow',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="navigation-arrow">
<path id="fill1" d="M12 4L20 20L12 17.5L4 20L12 4Z" [attr.fill]="color"/>
<path id="stroke1" d="M12 4L20 20L12 17.5L4 20L12 4Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</svg>

  `,
  standalone: true
})
export class NavigationArrowComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
