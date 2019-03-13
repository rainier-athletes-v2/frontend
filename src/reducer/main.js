import { combineReducers } from 'redux';
import token from './token';
import refresh from './refresh';
import role from './role';
import myProfile from './myProfile';
import synopsisReport from './synopsis-report'; // a single student's report
import synopsisReportList from './synopsis-report-list'; // most recent SR's for a student
import synopsisReportLink from './synopsis-report-link'; // link to SF PDF on google drive
import myStudents from './myStudents';
import error from './error';

export default combineReducers({
  error,
  myProfile,
  myStudents,
  synopsisReportList,
  synopsisReport,
  synopsisReportLink,
  role,
  token,
  refresh,
});
