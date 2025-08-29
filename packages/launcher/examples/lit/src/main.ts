import './my-element.js'

document.querySelector('#app')!.innerHTML = `
  <my-element>
    <p>This is child content</p>
  </my-element>
`
