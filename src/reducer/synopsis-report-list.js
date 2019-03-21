import { SYNOPSIS_LIST_SET } from '../lib/types';

export default (state = null, { type, payload }) => {
  switch (type) {
    case SYNOPSIS_LIST_SET:
      return payload;
    default:
      return state;
  }
};