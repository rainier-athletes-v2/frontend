import superagent from 'superagent';
import * as routes from '../lib/routes';

export const setSrSummaryStatus = status => ({
  type: 'SET_SR_SUMMARY_STATUS',
  payload: status,
});

export const clearSrSummaryStatus = () => ({
  type: 'CLEAR_SR_SUMMARY_STATUS',
  payload: null,
});

export const postSrSummary = srSummary => (store) => { // eslint-disable-line
  const token = store.getState().salesforceToken;
  // srSummary = {
  //  subject: 'message subject',
  //  content: 'rich text message body',
  //  basecampToken: store.basecampToken,
  //  studentEmail: store.myStudents[n].primaryEmail
  // }
  console.log('postSrSummary action sending', srSummary);
  return superagent.post(`${API_URL}${routes.SYNOPSIS_SUMMARY_ROUTE}`)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .send(srSummary)
    .then((res) => {
      console.log('postSrSummary return status', res.body.status);
      const { status } = res.body;
      return store.dispatch(setSrSummaryStatus(status));
    });
};
