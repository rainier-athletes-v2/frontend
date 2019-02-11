import superagent from 'superagent';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import synopsisReportPdf from '../components/synopsis-report-pdf/synopsis-report-pdf';
import * as profileActions from './profile';
import * as routes from '../lib/routes';

export const setSynopsisReports = srList => ({
  type: 'SYNOPSIS_REPORTS_SET',
  payload: srList,
});

export const setSynopsisReport = sr => ({
  type: 'SYNOPSIS_REPORT_SET',
  payload: sr,
});

export const setSynopsisReportPdfLink = link => ({
  type: 'SYNOPSIS_REPORT_LINK_SET',
  payload: link,
});

export const clearSynopsisReportPdfLink = () => ({
  type: 'SYNOPSIS_REPORT_LINK_CLEAR',
});

export const fetchRecentSynopsisReports = (studentId) => (store) => { // eslint-disable-line
  const { token } = store.getState();

  return superagent.get(`${API_URL}${routes.SYNOPSIS_REPORTS_ROUTE}/${studentId}`)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .then((res) => {
      const recentSynopsisReports = res.body;
      return store.dispatch(setSynopsisReports(recentSynopsisReports));
    });
};

export const fetchSynopsisReport = (srId) => (store) => { // eslint-disable-line
  const { token } = store.getState();

  return superagent.get(`${API_URL}${routes.SYNOPSIS_REPORT_ROUTE}/${srId}`)
    .set('Authorization', `Bearer ${token}`)
    .send('Content-Type', 'application/json')
    .then((res) => {
      const thisSynopsisReport = res.body;
      return store.dispatch(setSynopsisReport(thisSynopsisReport));
    });
};

// export const createPointTracker = pointTracker => (store) => {
//   const { token } = store.getState();

//   console.log('createPointTracker sending report', pointTracker.title);  //eslint-disable-line

//   const studentId = pointTracker.student._id.toString();

//   return superagent.post(`${API_URL}${routes.POINTS_TRACKER_ROUTE}`)
//     .set('Authorization', `Bearer ${token}`)
//     .set('Content-Type', 'application/json')
//     .send({ ...pointTracker, student: studentId }) // this to prevent circular JSON
//     .then(() => {
//       return store.dispatch(profileActions.fetchStudentsReq());
//     })
//     .catch((err) => {
//       console.error('createPointTracker error:', err);  //eslint-disable-line
//     });
// };

const synopsisReportToHTML = (pointTracker, student) => {
  const synopsisReportPdf = <synopsisReportPdf pointTracker={pointTracker} student={student}/>;

  // this css styles the html created in components/synopsis-report
  return (
    `<style>
    img {
      width: 200px;
    }
    .image {
      height: 20px;
      background: #1f1f1f;
      width: 100%;
      padding: 10px 20px 15px 10px;
      margin-bottom: 24px;
    }
    body {
      font-family: "Raleway", Helvetica;
      color: #000;
      padding: 20px;
      margin: 0px;
      font-size: 11px;
      line-height: 18px;
      font-weight: 300;
    }
    h3 {
      text-transform: uppercase;
      color: #A9A9A9;
      font-weight: 700;
      font-size: 10px;
      margin-top: 24px;
    }
    p {
      white-space: pre-wrap;
    }
    table {
      font-family: "Raleway", Helvetica;
      border-collapse: collapse;
      font-size: 11px;
      line-height: 20px;
      font-weight: 300;

      table-layout: auto;
      width: 100%;
    }
    th {
      border-bottom: 2px solid #ddd;
      table-layout: auto;
      text-align: left;
      font-weight: 400;
    }
    td {
      table-layout: auto;
      text-align: left;
    }
    table {
      margin-left: auto;
      margin-right: auto;
    }
    .row {
      display: block;
      width: 100%;
      height: 80px;
    }
    .left {
      float: left;
    }
    .right {
      float: left;
      margin-left: 130px;
    }

    </style>
    ${ReactDOMServer.renderToString(synopsisReportPdf)}
  `);
};

export const createSynopsisReportPdf = sr => (store) => {
  const { token } = store.getState();
  const { student, studentName, title } = sr;

  const data = {
    name: studentName,
    title,
    html: synopsisReportToHTML(sr, student),
  };

  return superagent.post(`${API_URL}${routes.SYNOPSIS_REPORT}`)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .send(data)
    .then((res) => {
      return store.dispatch(setSynopsisReportPdfLink(res.body.webViewLink));
    });
};
