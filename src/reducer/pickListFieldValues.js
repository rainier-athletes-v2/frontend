import { PICKLIST_SET } from '../lib/types';

export default (state = null, { type, payload }) => {
  switch (type) {
    case PICKLIST_SET:
      return payload;
    default:
      return state;
  }
};
