import { cookieFetch } from '../lib/utils';
import { RA_USER, ROLE_SET, ROLE_REMOVE } from '../lib/types';

const ROLE_KEY = RA_USER;
const role = cookieFetch(ROLE_KEY);
const defaultState = role || null;

export default (state = defaultState, { type, payload }) => {
  switch (type) {
    case ROLE_SET:
      return payload;
    case ROLE_REMOVE:
      return null;
    default:
      return state;
  }
};
