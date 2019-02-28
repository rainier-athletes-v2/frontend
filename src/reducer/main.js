import { combineReducers } from 'redux';
import token from './token';
import role from './role';
// import profile from './profile';
import myProfile from './myProfile';
import synopsisReport from './synopsis-report'; // a single student's report
import synopsisReportList from './synopsis-report-list';  // most recent SR's for a student
import synopsisReportLink from './synopsis-report-link';  // link to SF PDF on google drive
// import studentData from './student-data';
// import students from './students';
// import teachers from './teachers';
import myStudents from './myStudents';
// import schedule from './schedule';
// import csvExtract from './extract';
import error from './error';

export default combineReducers({
  error,
  // profile,
  // students,
  // teachers,
  myStudents,
  synopsisReportList,
  synopsisReport,
  synopsisReportLink,
  // csvExtract,
  // studentData,
  myProfile,
  role,
  token,
});
