import superagent from 'superagent';
import * as routes from '../lib/routes';
import { setError } from './error';
import * as t from '../lib/types';

export const setSrSummaryStatus = status => ({
  type: t.SET_SR_SUMMARY_STATUS,
  payload: status,
});

export const clearSrSummaryStatus = () => ({
  type: t.CLEAR_SR_SUMMARY_STATUS,
  payload: null,
});

export const setMsgBoardUrl = url => ({
  type: t.SET_MSG_BOARD_URL,
  payload: url,
});

export const clearMsgBoardUrl = () => ({
  type: t.CLEAR_MSG_BOARD_URL,
  payload: null,
});

export const getMsgBoardUrl = studentEmail => (store) => { // eslint-disable-line
  const { salesforceToken, basecampToken } = store.getState();

  return superagent.get(`${API_URL}${routes.SYNOPSIS_SUMMARY_ROUTE}`)
    .set('Authorization', `Bearer ${salesforceToken}`)
    .set('Content-Type', 'application/json')
    .query({ studentEmail, basecampToken })
    .then((res) => {
      const { messageBoardUrl } = res.body;
      return store.dispatch(setMsgBoardUrl(messageBoardUrl));
    })
    .catch((err) => {
      return store.dispatch(setError(`getMsgBoardUrl returned status ${err.status}`));
    });
};

export const postSrSummary = srSummary => (store) => { // eslint-disable-line
  const token = store.getState().salesforceToken;

  return superagent.post(`${API_URL}${routes.SYNOPSIS_SUMMARY_ROUTE}`)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .send(srSummary)
    .then((res) => {
      const { status } = res;
      return store.dispatch(setSrSummaryStatus(status));
    });
};
