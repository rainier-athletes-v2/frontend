import superagent from 'superagent';
import * as routes from '../lib/routes';

export const setSynopsisReports = srList => ({
  type: 'SYNOPSIS_REPORTS_SET',
  payload: srList,
});

export const fetchRecentSynopsisReports = (studentId) => (store) => { // eslint-disable-line
  const { token } = store.getState();

  return superagent.get(`${API_URL}${routes.SYNOPSIS_REPORTS_ROUTE}/${studentId}`)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .then((res) => {
      const recentSynopsisReports = res.body.records.map(item => ({
        id: item.Id,
        srName: item.Name,
        pointSheetStatus: item.Point_Sheet_Status__c,
        synopsisReportStatus: item.Synopsis_Report_Status__c,
        startDate: item.Start_Date__c,
        title: item.Week__c,
      }));
      return store.dispatch(setSynopsisReports(recentSynopsisReports));
    });
};

// {
//   "totalSize": 5,
//   "done": true,
//   "records": [
//       {
//           "attributes": {
//               "type": "SynopsisReport__c",
//               "url": "/services/data/v44.0/sobjects/SynopsisReport__c/a0q5C000000RkYaQAK"
//           },
//           "Id": "a0q5C000000RkYaQAK",
//           "Point_Sheet_Status__c": null,
//           "Synopsis_Report_Status__c": null,
//           "Start_Date__c": "2019-02-25",
//           "Week__c": "2/25/2019 thru 3/3/2019"
//       },