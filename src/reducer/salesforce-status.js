import {
  SALESFORCE_STATUS_CLEAR, 
  SALESFORCE_STATUS_SET, 
} from '../lib/types';

export default (state = null, { type, payload }) => {
  switch (type) {
    case SALESFORCE_STATUS_CLEAR:
      return null;
    case SALESFORCE_STATUS_SET:
      return payload;
    default:
      return state;
  }
};
