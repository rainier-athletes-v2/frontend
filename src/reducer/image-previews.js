import { IMAGE_PREVIEW_CLEAR, IMAGE_PREVIEW_SET } from '../lib/types';

export default (state = null, { type, payload }) => {
  switch (type) {
    case IMAGE_PREVIEW_SET:
      return payload;
    case IMAGE_PREVIEW_CLEAR:
      return null;
    default:
      return state;
  }
};