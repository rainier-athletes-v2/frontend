
import superagent from 'superagent';
import * as routes from '../routes';
import { fetchMyProfileReq } from '../../actions/profile';
import { setRole, setToken } from '../../actions/auth';

import { ON_INIT_SF } from '../types';

export default store => next => (action) => {
  const refreshToken = store.getState().salesforceRefresh;
  switch (action.type) {
    case ON_INIT_SF:
      // if refresh token present use it to try and authenticate
      if (refreshToken) {
        return superagent.post(`${API_URL}${routes.OAUTH_ROUTE}`)
          .set('Authorization', 'UNUSED')
          .set('Content-Type', 'application/json')
          .send({ refresh_token: refreshToken })
          .then((response) => {
            // schedule another ON_INIT refresh before access token expires.
            // timeout is set in salesforce (they don't send us the expires_in
            // parameter unfortunately). We have SF_SESSION_TIMEOUT_MINUTES in
            // our .env file which should match what's in salesforce.
            setTimeout(() => store.dispatch({ type: 'ON_INIT_SF' }), (SF_SESSION_TIMEOUT_MINUTES - 1) * 60 * 1000);
            store.dispatch(setToken(response.body.raToken));
            if (!store.getState().myProfile) store.dispatch(fetchMyProfileReq());
            return next(store.dispatch(setRole(response.body.raUser)));
          }) 
          .catch(console.err);
      }
      break;
    default:
      break;
  }
  return next(action);
};
