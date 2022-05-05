'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-b78a0b4d.js');

function format(first, middle, last) {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}

const UserIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4z"/></svg>`;

const myComponentCss = ".host{display:block}";

const MyComponent = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  getText() {
    return format(this.first, this.middle, this.last);
  }
  render() {
    return index.h(index.Host, null, index.h("div", null, "Hello, World! I'm ", this.getText()), index.h("div", { class: 'svg-container', innerHTML: UserIcon }), index.h("img", { src: index.getAssetPath('/assets/media/cat.jpeg') }));
  }
};
MyComponent.style = myComponentCss;

exports.my_component = MyComponent;
