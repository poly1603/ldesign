// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/exposure',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="exposure">
<circle id="fill1" cx="12" cy="12" r="10" [attr.fill]="color"/>
<circle id="stroke1" cx="12" cy="12" r="10" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path id="stroke2" d="M12 7V10M12 10V13M12 10H9M12 10H15M9 17H15" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class ExposureComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
