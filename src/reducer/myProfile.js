import { MY_PROFILE_SET, TOKEN_REMOVE_SF } from '../lib/types';

export default (state = null, { type, payload }) => {
  switch (type) {
    case MY_PROFILE_SET:
      return payload;
    case TOKEN_REMOVE_SF:
      return null;
    default:
      return state;
  }
};
