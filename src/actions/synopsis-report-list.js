import superagent from 'superagent';
import * as routes from '../lib/routes';
import { SYNOPSIS_LIST_SET, PICKLIST_SET } from '../lib/types';

export const setSynopsisReports = srList => ({
  type: SYNOPSIS_LIST_SET,
  payload: srList,
});

export const setPicklistValues = pickListValues => ({
  type: PICKLIST_SET,
  payload: pickListValues,
});

export const fetchRecentSynopsisReports = (studentId) => (store) => { // eslint-disable-line
  const token = store.getState().salesforceToken;

  if (!store.pickListFieldValues) {
    superagent.get(`${API_URL}${routes.PICKLISTS_ROUTE}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .then((res) => {
        return store.dispatch(setPicklistValues(res.body.picklistFieldValues));
      });
  }

  return superagent.get(`${API_URL}${routes.SYNOPSIS_LIST_ROUTE}/${studentId}`)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .then((res) => {
      const recentSynopsisReports = res.body.records.map(item => ({
        id: item.Id,
        srName: item.Name,
        pointSheetStatus: item.PointTrackers__r === null ? 'Virtual' : item.Point_Sheet_Status__c,
        synopsisReportStatus: item.Synopsis_Report_Status__c,
        startDate: item.Start_Date__c,
        title: item.Week__c,
      }));
      return store.dispatch(setSynopsisReports(recentSynopsisReports));
    });
};
