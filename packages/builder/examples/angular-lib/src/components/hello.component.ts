import { Component, Input } from '@angular/core'

@Component({
  selector: 'hello-comp',
  template: `<span>Hello {{name}}</span>`
})
export class HelloComponent {
  @Input() name: string = 'Angular'
}
