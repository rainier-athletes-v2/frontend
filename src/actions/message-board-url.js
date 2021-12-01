import superagent from 'superagent';
import * as routes from '../lib/routes';
import * as t from '../lib/types';
import { setError, clearError } from './error';

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

  store.dispatch(clearError());
  store.dispatch(clearMsgBoardUrl());

  return superagent.get(`${API_URL}${routes.SYNOPSIS_SUMMARY_ROUTE}`)
    .set('Authorization', `Bearer ${salesforceToken}`)
    .set('Content-Type', 'application/json')
    .query({ studentEmail, basecampToken })
    .then((res) => {
      const { messageBoardUrl } = res.body;
      return store.dispatch(setMsgBoardUrl(messageBoardUrl));
    })
    .catch((err) => {
      // store.dispatch(setMsgBoardUrl('ERROR'));
      return store.dispatch(setError(err.status));
    });
};
