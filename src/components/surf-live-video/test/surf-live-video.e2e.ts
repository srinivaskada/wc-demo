import { newE2EPage } from '@stencil/core/testing';

describe('surf-live-video', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<surf-live-video></surf-live-video>');

    const element = await page.find('surf-live-video');
    expect(element).toHaveClass('hydrated');
  });
});
