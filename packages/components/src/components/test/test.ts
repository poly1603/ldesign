import { Component, h } from '@stencil/core';

@Component({
  tag: 'ld-test',
  shadow: true,
})
export class Test {
  render() {
    return h('div', null, 'Hello World');
  }
}