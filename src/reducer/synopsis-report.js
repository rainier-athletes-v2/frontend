import {
  SYNOPSIS_REPORT_CLEAR, 
  SYNOPSIS_REPORT_SET, 
  SALESFORCE_STATUS_CLEAR, 
  SALESFORCE_STATUS_SET, 
} from '../lib/types';

export default (state = null, { type, payload }) => {
  switch (type) {
    case SYNOPSIS_REPORT_SET:
      return payload;
    case SYNOPSIS_REPORT_CLEAR:
      return null;
    case SALESFORCE_STATUS_CLEAR:
      return null;
    case SALESFORCE_STATUS_SET:
      return payload;
    default:
      return state;
  }
};
