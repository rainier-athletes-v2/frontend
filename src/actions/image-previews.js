
import * as t from '../lib/types';

export const setImagePreviews = previews => ({
  type: t.IMAGE_PREVIEW_SET,
  payload: previews,
});

export const clearImagePreviews = () => ({
  type: t.IMAGE_PREVIEW_CLEAR,
  payload: null,
});
