import { cookieFetch } from '../lib/utils';
import { SF_REFRESH, REFRESH_TOKEN_REMOVE_SF, REFRESH_TOKEN_SET_SF } from '../lib/types';

const TOKEN_KEY = SF_REFRESH;
const token = cookieFetch(TOKEN_KEY);
const defaultState = token || null;

export default (state = defaultState, { type, payload }) => {
  switch (type) {
    case REFRESH_TOKEN_SET_SF:
      return payload;
    case REFRESH_TOKEN_REMOVE_SF:
      return null;
    default:
      return state;
  }
};
