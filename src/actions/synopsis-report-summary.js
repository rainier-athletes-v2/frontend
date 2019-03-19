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

export const setMsgBoardUrl = url => ({
  type: 'SET_MSG_BOARD_URL',
  payload: url,
});

export const clearMsgBoardUrl = () => ({
  type: 'CLEAR_MSG_BOARD_URL',
  payload: null,
});

export const getMsgBoardUrl = studentEmail => (store) => { // eslint-disable-line
  // urlRequest = {
  //  basecampToken, studentEmail,
  // }
  const { salesforceToken, basecampToken } = store.getState();
  console.log('getMsgBoardUrl sending request');
  return superagent.get(`${API_URL}${routes.SYNOPSIS_SUMMARY_ROUTE}`)
    .set('Authorization', `Bearer ${salesforceToken}`)
    .set('Content-Type', 'application/json')
    .query({ studentEmail, basecampToken })
    .then((res) => {
      console.log('getMsgBoardUrl returned', res.body.messageBoardUrl, 'status', res.status);
      const { messageBoardUrl } = res.body;
      return store.dispatch(setMsgBoardUrl(messageBoardUrl));
    });
};

export const postSrSummary = srSummary => (store) => { // eslint-disable-line
  const token = store.getState().salesforceToken;
  // srSummary = {
  //  subject: 'message subject',
  //  content: 'rich text message body',
  //  basecampToken: store.basecampToken,
  //  messageBoardUrl: store.messageBoardUrl,
  // }
  console.log('postSrSummary action sending', srSummary);
  return superagent.post(`${API_URL}${routes.SYNOPSIS_SUMMARY_ROUTE}`)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .send(srSummary)
    .then((res) => {
      console.log('postSrSummary return status', res.status);
      const { status } = res;
      return store.dispatch(setSrSummaryStatus(status));
    });
};
