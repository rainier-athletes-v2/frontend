import { SET_BC_PROJECTS, SCAN_PROJECT } from '../lib/types';

export default (state = null, { type, payload }) => {
  switch (type) {
    case SET_BC_PROJECTS:
      return payload;
    case SCAN_PROJECT:
      return payload;
    default:
      return state;
  }
};
