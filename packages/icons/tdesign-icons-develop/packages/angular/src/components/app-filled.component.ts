// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/app-filled',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M12.5 6.5C12.5 3.73858 14.7386 1.5 17.5 1.5C20.2614 1.5 22.5 3.73858 22.5 6.5C22.5 9.26142 20.2614 11.5 17.5 11.5C14.7386 11.5 12.5 9.26142 12.5 6.5ZM2 2H11V11H2V2ZM2 13H11V22H2V13ZM13 13H22V22H13V13Z"
        [attr.fill]="color" />
</svg>
  `,
  standalone: true
})
export class AppFilledComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
