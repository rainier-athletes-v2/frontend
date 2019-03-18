
import superagent from 'superagent';
import * as routes from '../routes';

export default store => next => (action) => {
  const refreshToken = store.getState().basecampRefresh;
  switch (action.type) {
    case 'ON_INIT_BC':
      // if refresh token present use it to try and authenticate
      if (refreshToken) {
        return superagent.post(`${API_URL}${routes.OAUTH_ROUTE_BC}`)
          .set('Authorization', 'UNUSED')
          .set('Content-Type', 'application/json')
          .send({ refresh_token: refreshToken })
          .then((response) => {
            // schedule another ON_INIT refresh before access token expires.
            // timeout is set in salesforce (they don't send us the expires_in
            // parameter unfortunately). We have SF_SESSION_TIMEOUT_MINUTES in
            // our .env file which should match what's in salesforce.
            // console.log('setting timeout for ON_INIT_BC in', (SF_SESSION_TIMEOUT_MINUTES - 1), 'minutes');
            // setTimeout(() => store.dispatch({ type: 'ON_INIT_BC' }), (SF_SESSION_TIMEOUT_MINUTES - 1) * 60 * 1000);
            next({
              type: 'TOKEN_SET_BC',
              payload: response.body.raBcToken,
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
