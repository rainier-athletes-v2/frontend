import { combineReducers } from 'redux';
import salesforceToken from './sf-token';
import basecampToken from './bc-token';
import salesforceRefresh from './sf-refresh';
import basecampRefresh from './bc-refresh';
import role from './role';
import myProfile from './myProfile';
import synopsisReport from './synopsis-report'; // a single student's report
import synopsisReportList from './synopsis-report-list'; // most recent SR's for a student
import synopsisReportLink from './synopsis-report-link'; // link to SF PDF on google drive
import srSummaryStatus from './synopsis-report-summary';
import myStudents from './myStudents';
import error from './error';

export default combineReducers({
  error,
  myProfile,
  myStudents,
  synopsisReportList,
  synopsisReport,
  synopsisReportLink,
  srSummaryStatus,
  role,
  salesforceToken,
  basecampToken,
  salesforceRefresh,
  basecampRefresh,
});
