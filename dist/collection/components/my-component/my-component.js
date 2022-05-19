import { Component, Prop, h, Host } from '@stencil/core';
import { format, getMediaPath } from '../../utils/utils';
import UserIcon from '@material-icons/svg/svg/person/round.svg';
// const UserIcon = 'hi'
export class MyComponent {
  getText() {
    return format(this.first, this.middle, this.last);
  }
  render() {
    return h(Host, null,
      h("div", null,
        "Hello, World! I'm ",
        this.getText()),
      h("div", { class: 'svg-container', innerHTML: UserIcon }),
      h("img", { src: getMediaPath('cat.jpeg') }));
  }
  static get is() { return "my-component"; }
  static get encapsulation() { return "shadow"; }
  static get originalStyleUrls() { return {
    "$": ["my-component.scss"]
  }; }
  static get styleUrls() { return {
    "$": ["my-component.css"]
  }; }
  static get properties() { return {
    "first": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "The first name"
      },
      "attribute": "first",
      "reflect": false
    },
    "middle": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "The middle name"
      },
      "attribute": "middle",
      "reflect": false
    },
    "last": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": "The last name"
      },
      "attribute": "last",
      "reflect": false
    }
  }; }
}
