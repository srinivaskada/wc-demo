import type { Components, JSX } from "../types/components";

interface SurfLiveVideo extends Components.SurfLiveVideo, HTMLElement {}
export const SurfLiveVideo: {
  prototype: SurfLiveVideo;
  new (): SurfLiveVideo;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
