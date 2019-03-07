import superagent from 'superagent';
import * as routes from '../lib/routes';

export const setSynopsisReport = sr => ({
  type: 'SYNOPSIS_REPORT_SET',
  payload: sr,
});

export const clearSynopsisReport = () => ({
  type: 'SYNOPSIS_REPORT_CLEAR',
  payload: null,
});

const translateGradeNulltoNA = (subjects) => {
  return subjects.map((subject) => {
    subject.Grade__c = subject.Grade__c === null ? 'N/A' : subject.Grade__c;
    return { ...subject };
  });
};

export const fetchSynopsisReport = (srId) => (store) => { // eslint-disable-line
  const { token } = store.getState();

  return superagent.get(`${API_URL}${routes.SYNOPSIS_REPORT_ROUTE}/${srId}`)
    .set('Authorization', `Bearer ${token}`)
    .send('Content-Type', 'application/json')
    .then((res) => {
      const sr = res.body;
      sr.records[0].PointTrackers__r.records = translateGradeNulltoNA(sr.records[0].PointTrackers__r.records);
      return store.dispatch(setSynopsisReport(sr));
    });
};

const translateGradeNAtoNull = (subjects) => {
  return subjects.map((subject) => {
    subject.Grade__c = subject.Grade__c === 'N/A' ? null : subject.Grade__c;
    return { ...subject };
  });
};

export const saveSynopsisReport = (orgSr) => (store) => { // eslint-disable-line
  const { token } = store.getState();
  const sr = JSON.parse(JSON.stringify(orgSr)); // create deep copy of SR being saved
  sr.PointTrackers__r.records = translateGradeNAtoNull(sr.PointTrackers__r.records);
  return superagent.put(`${API_URL}${routes.SYNOPSIS_REPORT_ROUTE}`)
    .set('Authorization', `Bearer ${token}`)
    .send(sr)
    .then();
};
