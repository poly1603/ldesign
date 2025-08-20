import { Component, h } from '@stencil/core';

export @Component({
  tag: 'ld-input',
  styleUrl: 'input.css',
  shadow: true,
})
class Input {
  render() {
    return h('input', { type: 'text' });
  }
}