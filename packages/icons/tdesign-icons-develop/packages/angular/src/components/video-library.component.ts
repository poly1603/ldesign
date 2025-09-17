// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/video-library',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="video-library">
<path id="fill1" d="M3 9H21L19.2 21H4.8L3 9Z" [attr.fill]="color"/>
<path id="fill2" d="M13.5 15L11.5 16.5V13.5L13.5 15Z" [attr.fill]="color"/>
<path id="stroke1" d="M5 6H19M7 3H17M3 9H21L19.2 21H4.8L3 9Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M13.5 15L11.5 16.5V13.5L13.5 15Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
</g>
</svg>

  `,
  standalone: true
})
export class VideoLibraryComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
