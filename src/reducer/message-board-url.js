import { SET_MSG_BOARD_URL, CLEAR_MSG_BOARD_URL } from '../lib/types';

export default (state = null, { type, payload }) => {
  switch (type) {
    case SET_MSG_BOARD_URL:
      return payload;
    case CLEAR_MSG_BOARD_URL:
      return null;
    default:
      return state;
  }
};
