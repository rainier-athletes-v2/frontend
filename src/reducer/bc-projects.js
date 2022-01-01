import { SET_BC_PROJECTS, CLEAR_BC_PROJECTS } from '../lib/types';

export default (state = null, { type, payload }) => {
  switch (type) {
    case SET_BC_PROJECTS:
      return payload;
    case CLEAR_BC_PROJECTS:
      return null;
    default:
      return state;
  }
};
