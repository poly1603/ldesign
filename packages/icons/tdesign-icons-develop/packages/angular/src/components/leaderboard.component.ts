// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/leaderboard',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
    <g id="leaderboard">
        <path id="fill1" d="M9 4H15V20H9V4Z" [attr.fill]="color" />
        <g id="fill2">
            <path d="M15 12H21V20H15V12Z" [attr.fill]="color" />
            <path d="M3 10H9V20H3V10Z" [attr.fill]="color" />
        </g>
        <path id="stroke1" d="M15 20V4H9V20M15 20H9M15 20V12H21V20H15ZM9 20V10H3V20H9Z" [attr.stroke]="color" stroke-[attr.width]="size"
            stroke-linecap="square" />
    </g>
</svg>
  `,
  standalone: true
})
export class LeaderboardComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
