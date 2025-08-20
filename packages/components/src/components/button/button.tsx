import { Component, h } from '@stencil/core';

export @Component({
  tag: 'ld-button',
  styleUrl: 'button.css',
  shadow: true,
})
class Button {
  render() {
    return h('button', { type: 'button' }, h('slot'));
  }
}