import { newSpecPage } from '@stencil/core/testing';
import { SurfLiveVideo } from '../surf-live-video';

describe('surf-live-video', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [SurfLiveVideo],
      html: `<surf-live-video></surf-live-video>`,
    });
    expect(page.root).toEqualHtml(`
      <surf-live-video>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </surf-live-video>
    `);
  });
});
