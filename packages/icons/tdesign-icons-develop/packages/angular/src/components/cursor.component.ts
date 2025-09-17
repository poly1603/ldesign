// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/cursor',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="cursor">
<path id="fill1" fill-rule="evenodd" clip-rule="evenodd" d="M17.8237 9.34379L4.74219 4.7476L9.33838 17.8291L11.99 14.1168L17.8237 19.9504L19.945 17.8291L14.1114 11.9954L17.8237 9.34379Z" [attr.fill]="color"/>
<path id="stroke1" fill-rule="evenodd" clip-rule="evenodd" d="M17.8237 9.34375L4.74219 4.74756L9.33838 17.829L11.99 14.1167L17.8237 19.9504L19.945 17.829L14.1114 11.9954L17.8237 9.34375Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</svg>

  `,
  standalone: true
})
export class CursorComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
