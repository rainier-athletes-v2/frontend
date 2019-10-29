import { IMAGE_DATA_CLEAR, IMAGE_DATA_SET } from '../lib/types';

export default (state = null, { type, payload }) => {
  switch (type) {
    case IMAGE_DATA_SET:
      return payload;
    case IMAGE_DATA_CLEAR:
      return null;
    default:
      return state;
  }
};
