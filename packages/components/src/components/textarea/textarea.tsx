import { Component, h } from '@stencil/core';

export @Component({
  tag: 'ld-textarea',
  styleUrl: 'textarea.css',
  shadow: true,
})
class Textarea {
  render() {
    return h('textarea', { rows: 3 });
  }
}