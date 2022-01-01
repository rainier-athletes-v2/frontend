import { combineReducers } from 'redux';
import salesforceToken from './sf-token';
import basecampToken from './bc-token';
import salesforceRefresh from './sf-refresh';
import basecampRefresh from './bc-refresh';
import role from './role';
import myProfile from './myProfile';
import synopsisReport from './synopsis-report'; // a single student's report
import synopsisReportList from './synopsis-report-list'; // most recent SR's for a student
import pickListFieldValues from './pickListFieldValues';
import messageBoardUrl from './message-board-url';
import myStudents from './myStudents';
import error from './error';
import bcImages from './images';
import imagePreviews from './image-previews';
import bcProjects from './bc-projects';

export default combineReducers({
  error,
  role,
  myProfile,
  myStudents,
  synopsisReportList,
  messageBoardUrl,
  bcProjects,
  pickListFieldValues,
  synopsisReport,
  imagePreviews,
  bcImages,
  salesforceToken,
  basecampToken,
  salesforceRefresh,
  basecampRefresh,
});
