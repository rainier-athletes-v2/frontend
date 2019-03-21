
import superagent from 'superagent';
import * as routes from '../routes';
import { ON_INIT_BC } from '../types';
import { setBcToken } from '../../actions/auth';

export default store => next => (action) => {
  const refreshToken = store.getState().basecampRefresh;
  switch (action.type) {
    case ON_INIT_BC:
      // if refresh token present use it to try and authenticate
      if (refreshToken) {
        return superagent.post(`${API_URL}${routes.OAUTH_ROUTE_BC}`)
          .set('Authorization', 'UNUSED')
          .set('Content-Type', 'application/json')
          .send({ refresh_token: refreshToken })
          .then((response) => {
            return next(store.dispatch(setBcToken(response.body.raBcToken)));
          })
          .catch(console.err);
      }
      break;
    default:
      break;
  }
  return next(action);
};
