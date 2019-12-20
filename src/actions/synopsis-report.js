import superagent from 'superagent';
import * as routes from '../lib/routes';
import { SYNOPSIS_REPORT_SET, SYNOPSIS_REPORT_CLEAR } from '../lib/types';
import { setError, clearError } from './error';

export const setSynopsisReport = sr => ({
  type: SYNOPSIS_REPORT_SET,
  payload: sr,
});

export const clearSynopsisReport = () => ({
  type: SYNOPSIS_REPORT_CLEAR,
  payload: null,
});

const translateGradeNulltoNA = (subjects) => {
  return subjects.map((subject) => {
    subject.Grade__c = subject.Grade__c === null ? 'N/A' : subject.Grade__c;
    return { ...subject };
  });
};

export const fetchSynopsisReport = (srId) => (store) => { // eslint-disable-line
  const token = store.getState().salesforceToken;

  store.dispatch(clearError());
  store.dispatch(clearSynopsisReport());

  return superagent.get(`${API_URL}${routes.SYNOPSIS_REPORT_ROUTE}/${srId}`)
    .set('Authorization', `Bearer ${token}`)
    .send('Content-Type', 'application/json')
    .then((res) => {
      const sr = res.body;
      if (sr.records[0].PointTrackers__r) {
        sr.records[0].PointTrackers__r.records = translateGradeNulltoNA(sr.records[0].PointTrackers__r.records);
        sr.records[0].summer_SR = false;
      } else {
        sr.records[0].summer_SR = true;
      }
      return store.dispatch(setSynopsisReport(sr));
    });
};

// const translateGradeNAtoNull = (subjects) => {
//   return subjects.map((subject) => {
//     subject.Grade__c = subject.Grade__c === 'N/A' ? null : subject.Grade__c;
//     return { ...subject };
//   });
// };

export const saveSynopsisReport = (orgSr) => (store) => { // eslint-disable-line
  const token = store.getState().salesforceToken;

  store.dispatch(clearError());

  if (!orgSr.summer_SR) {
    // orgSr.PointTrackers__r.records = translateGradeNAtoNull(orgSr.PointTrackers__r.records);
  }
  const sr = JSON.parse(JSON.stringify(orgSr)); // create deep copy of SR being saved
  return superagent.put(`${API_URL}${routes.SYNOPSIS_REPORT_ROUTE}`)
    .set('Authorization', `Bearer ${token}`)
    .send(sr)
    .then((result) => {
      console.log('Back from saving sr. Status:', result.status);
      return store.dispatch(setError(result.status));
    });
};
