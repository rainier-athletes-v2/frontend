import superagent from 'superagent';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import SynopsisReportHtml from '../components/synopsis-report-html/synopsis-report-html';
import * as routes from '../lib/routes';
import { SYNOPSIS_REPORT_LINK_CLEAR, SYNOPSIS_REPORT_LINK_SET } from '../lib/types';
import { setError, clearError } from './error';

export const setSynopsisReportLink = link => ({
  type: SYNOPSIS_REPORT_LINK_SET,
  payload: link,
});

export const clearSynopsisReportLink = () => ({
  type: SYNOPSIS_REPORT_LINK_CLEAR,
});

const synopsisReportToHTML = (student, synopsisReport) => {
  const synopsisReportHTML = <SynopsisReportHtml student={student} synopsisReport={synopsisReport}/>;

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
    ${ReactDOMServer.renderToString(synopsisReportHTML)}`
  );
};

export const createSynopsisReportPdf = (student, synopsisReport) => (store) => {
  const token = store.getState().salesforceToken;
  
  const data = {
    name: synopsisReport.Student__r.Name,
    school: synopsisReport.PointTrackers__r.records[0].Class__r.School__r.Name,
    title: synopsisReport.Week__c,
    html: synopsisReportToHTML(student, synopsisReport),
  };

  store.dispatch(clearError());
  
  return superagent.post(`${API_URL}${routes.SYNOPSIS_PDF_ROUTE}`)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .send(data)
    .then((res) => {
      store.dispatch(setSynopsisReportLink(res.body.webViewLink));
      return store.dispatch(setError(res.status));
    })
    .catch((err) => {
      return store.dispatch(setError(err.status));
    });
};
