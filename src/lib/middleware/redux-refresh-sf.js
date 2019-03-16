
import superagent from 'superagent';
import * as routes from '../routes';
import { fetchMyProfileReq } from '../../actions/profile';

export default store => next => (action) => {
  const refreshToken = store.getState().salesforceRefresh;
  switch (action.type) {
    case 'ON_INIT_SF':
      console.log('ON_INIT_SF processing');
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
            console.log('setting timeout for ON_INIT_SF in', (SF_SESSION_TIMEOUT_MINUTES - 1), 'minutes');
            setTimeout(() => store.dispatch({ type: 'ON_INIT_SF' }), (SF_SESSION_TIMEOUT_MINUTES - 1) * 60 * 1000);
            store.dispatch({
              type: 'TOKEN_SET_SF',
              payload: response.body.raToken,
            });
            if (!store.getState().myProfile) store.dispatch(fetchMyProfileReq());
            next({
              type: 'ROLE_SET',
              payload: response.body.raUser,
            });
          }) 
          .catch(console.err);
      }
      break;
    default:
      break;
  }
  return next(action);
};
