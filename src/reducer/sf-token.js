import { cookieFetch } from '../lib/utils';
import { SF_ACCESS, TOKEN_SET_SF, TOKEN_REMOVE_SF } from '../lib/types';

const TOKEN_KEY = SF_ACCESS;
const token = cookieFetch(TOKEN_KEY);
const defaultState = token || null;

export default (state = defaultState, { type, payload }) => {
  switch (type) {
    case TOKEN_SET_SF:
      return payload;
    case TOKEN_REMOVE_SF:
      return null;
    default:
      return state;
  }
};
