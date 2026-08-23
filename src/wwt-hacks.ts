// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { WWTControl } from "@wwtelescope/engine";

const originalRenderFrame = WWTControl.singleton.renderOneFrame.bind(WWTControl.singleton);
export function renderOneFrame() {
  originalRenderFrame();

  if (this.renderFrameCallback) {
    try {
      this.renderFrameCallback(this);
    } catch (error) {
      console.error(error);
    }
  }
}

export function splitString(target: string, delimiters: string[]): string[] {
  const parts = [];
  let start = 0;
  let end = 0;

  for (let i = 0; i < target.length; i++) {
    const index = delimiters.indexOf(target[i]);
    if (index > -1) {
      const part = target.substring(start, end);
      if (part.length > 0) {
        parts.push(part);
      }
      start = end + 1;
    }
    end++;
  }

  if (end > start) {
    const suffix = target.substring(start, end);
    if (suffix.length > 0) {
      parts.push(suffix);
    }
  }

  return parts;
}
