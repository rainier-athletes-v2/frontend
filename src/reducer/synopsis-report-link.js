import { SYNOPSIS_REPORT_LINK_CLEAR, SYNOPSIS_REPORT_LINK_SET } from '../lib/types';

export default (state = null, { type, payload }) => {
  switch (type) {
    case SYNOPSIS_REPORT_LINK_SET:
      return payload;
    case SYNOPSIS_REPORT_LINK_CLEAR:
      return null;
    default:
      return state;
  }
};
