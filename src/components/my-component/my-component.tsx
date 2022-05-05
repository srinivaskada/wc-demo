import { Component, Prop, h, Host, getAssetPath } from '@stencil/core';
import { format } from '../../utils/utils';
import UserIcon from '@material-icons/svg/svg/person/round.svg'
// const UserIcon = 'hi'
@Component({
  tag: 'my-component',
  styleUrl: 'my-component.scss',
  shadow: true,
})
export class MyComponent {
  /**
   * The first name
   */
  @Prop() first: string;

  /**
   * The middle name
   */
  @Prop() middle: string;

  /**
   * The last name
   */
  @Prop() last: string;

  private getText(): string {
    return format(this.first, this.middle, this.last);
  }

  render() {
    return <Host>
      <div>Hello, World! I'm {this.getText()}</div>
      <div class='svg-container' innerHTML={UserIcon} />
      <img src={getAssetPath('/assets/media/cat.jpeg')} />
    </Host>
  }
}
