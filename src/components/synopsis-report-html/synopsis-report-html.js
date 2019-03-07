import React from 'react';
import PropTypes from 'prop-types';
import * as pl from '../../lib/pick-list-tests';
import * as pt from '../../lib/playing-time-utils';
import './_synopsis-report-html.scss';

export default function SynopsisReportHtml(props) {
  const { student, synopsisReport } = props;
  const pointTrackers = synopsisReport.PointTrackers__r.records;
  const studentsSchoolName = pointTrackers[0] && pointTrackers[0].Class__r.School__r.Name;
  const gradeLevel = synopsisReport.Student__r.Student_Grade__c;
  const isMiddleSchool = gradeLevel > 5 && gradeLevel < 9;
  const playingTimeOverride = synopsisReport.Mentor_Granted_Playing_Time__c !== ''
    && synopsisReport.Mentor_Granted_Playing_Time__c !== synopsisReport.Earned_Playing_Time__c;
  const playingTimeOnly = pl.playingTimeOnly(synopsisReport.Synopsis_Report_Status__c) || !pl.turnedIn(synopsisReport.Point_Sheet_Status__c);

  const pointPercentage = (subject) => {
    const pointsEarned = (2 * subject.Stamps__c) + subject.Half_Stamps__c;
    const percentage = pointsEarned / pt.maxPointsPossible(subject);
    return Math.round((percentage * 100));
  };

  // styling for this html is in actions/synopsis-report-pdf.js
  const scoreTableJSX = <React.Fragment>
    <table className="scoring-table">
      <thead>
        <tr>
          {isMiddleSchool ? <th>Teacher</th> : ''}
          <th>Class</th>
          {isMiddleSchool ? <th>Grade</th> : ''}
          <th>Excused</th>
          <th>Stamps</th>
          <th>Xs</th>
          <th>Blanks</th>
          <th>Point %</th>
        </tr>
      </thead>
      <tbody>
        {pointTrackers.map((subject, row) => {
          if (subject.Class__r.Name.toLowerCase() !== 'tutorial') {
            return (
            <tr key={ subject.Class__r.Name }>
              {isMiddleSchool && subject.Class__r.Teacher__r ? <td>{subject.Class__r.Teacher__r.LastName}</td> : ''}
              <td key={ `${subject.Class__r.LastName}${row}1` }>{ subject.Class__r.Name }</td>
              {isMiddleSchool ? <td>{ subject.Grade__c }</td> : ''}
              <td key={ `${subject.Class__r.Name}${row}2` }>{ !playingTimeOnly ? subject.Excused_Days__c : 'N/A' } </td>
              <td key={ `${subject.Class__r.Name}${row}3` }>{ !playingTimeOnly ? subject.Stamps__c : 'N/A' }</td>
              <td key={ `${subject.Class__r.Name}${row}4` }>{ !playingTimeOnly ? subject.Half_Stamps__c : 'N/A' }</td>
              <td key={ `${subject.Class__r.Name}${row}5` }>{ !playingTimeOnly ? 20 - subject.Excused_Days__c * 4 - subject.Stamps__c - subject.Half_Stamps__c : 'N/A' }</td>
              <td key={ `${subject.Class__r.Name}${row}6` }>{ !playingTimeOnly ? pointPercentage(subject) : 'N/A' }</td>
            </tr>
            );
          }
          return undefined;
        })}
        {isMiddleSchool
          ? synopsisReport.PointTrackers__r.records.map((subject, row) => {
            if (subject.Class__r.Name.toLowerCase() === 'tutorial') {
              return (
              <tr key={ subject.Class__r.Name }>
                {isMiddleSchool ? <td></td> : ''}
                <td key={ `${subject.Class__r.Name}${row}1` }>{ subject.Class__r.Name }</td>
                <td key={ `${subject.Class__r.Name}${row}1.5` }>{ '' }</td>
                <td key={ `${subject.Class__r.Name}${row}2` }>{ !playingTimeOnly ? subject.Excused_Days__c : 'N/A' } </td>
                <td key={ `${subject.Class__r.Name}${row}3` }>{ !playingTimeOnly ? subject.Stamps__c : 'N/A' }</td>
                <td key={ `${subject.Class__r.Name}${row}4` }>{ !playingTimeOnly ? subject.Half_Stamps__c : 'N/A' }</td>
                <td key={ `${subject.Class__r.Name}${row}5` }>{ !playingTimeOnly ? 20 - subject.Excused_Days__c * 4 - subject.Stamps__c - subject.Half_Stamps__c : 'N/A' }</td>
                <td key={ `${subject.Class__r.Name}${row}6` }>{ !playingTimeOnly ? pointPercentage(subject) : 'N/A' }</td>
              </tr>
              );
            }
            return '';
          })
          : ''}
      </tbody>
    </table>
    </React.Fragment>;
  
  const sportsInfoJSX = <React.Fragment>
    <h3>Team Information</h3>
    <table>
      <thead>
        <tr>
          <th>Team</th>
          <th>Coach</th>
          <th>Coach&#39;s Email</th>
          <th>Coach&#39;s Phone</th>
          <th>Calendar</th>
        </tr>
      </thead>
      <tbody>
        {student.studentData.teams.filter(s => s.currentlyPlaying).map((sport, i) => (
          <tr key={ sport.sport }>
            <td key={`${sport.teamName}${i}`}>{sport.teamName}</td>
            <td key={`${sport.coach}${i}`}>{sport.coach}</td>
            <td key={`${sport.email}${i}`}>{sport.email}</td>
            <td key={`${sport.phone}${i}`}>{sport.phone}</td>
            <td key={`calendar${i}`}><a href={sport.teamCalendarUrl} target="_blank" rel="noopener noreferrer">Calendar</a></td>
          </tr>
        ))}
      </tbody>
    </table>
  </React.Fragment>;

  const studentCalendarJSX = <React.Fragment>
    <h3><a href={student.studentData.googleCalendarUrl} target="_blank" rel="noopener noreferrer">Student&rsquo;s Google Calendar</a></h3>
  </React.Fragment>;

  const playingTimeJSX = <React.Fragment>
    <div className="row">
      <div className="left">
        { !synopsisReport.playingTimeOnly 
          && pl.turnedIn(synopsisReport.Point_Sheet_Status__c)
          && (synopsisReport.Mentor_Granted_Playing_Time__c === '' || synopsisReport.Mentor_Granted_Playing_Time__c === synopsisReport.Earned_Playing_Time__c)
          ? <React.Fragment>
            <h3>Game Eligibility Earned</h3>
            <p>{synopsisReport.Earned_Playing_Time__c}</p>
          </React.Fragment>
          : <React.Fragment>
            <h3>Mentor Granted Playing Time</h3>
            <p>{synopsisReport.Mentor_Granted_Playing_Time__c}</p>
        </React.Fragment> }
      </div>
    </div>
  </React.Fragment>;

  const mentorCommentsJSX = playingTimeOverride || synopsisReport.playingTimeOnly
    ? <div>
        <h3>Mentor&#39;s Comments re: Playing Time</h3>
          <p>{synopsisReport.Mentor_Granted_Playing_Time_Explanation__c}</p>
      </div>
    : null;

  const synopsisReportHTML = <React.Fragment>
    <body>
      <div className="image">
        <img style={{ WebkitUserSelect: 'none' }} src="http://portal.rainierathletes.org/2dbb0b1d137e14479018b5023d904dec.png" />
      </div>
          <h1>{synopsisReport.Student__r.Name}</h1>
          <h2>{synopsisReport.Week__c}</h2>
          <h3>{studentsSchoolName}</h3>
          { pl.turnedIn(synopsisReport.Point_Sheet_Status__c) ? null
            : <React.Fragment>
              <p>Point Sheet not turned in.</p>
              </React.Fragment> }
          {scoreTableJSX}
          {studentCalendarJSX}
          {sportsInfoJSX}
          {playingTimeJSX} 
          {mentorCommentsJSX}        
          <h3>Student Action Items</h3>
            <p>{synopsisReport.Student_Action_Items__c}</p>
          <h3>Sports Update</h3>
            <p>{synopsisReport.Sports_Update__c}</p>
          <h3>Additional Comments</h3>
            <p>{synopsisReport.Additional_Comments__c}</p>

    </body>
  </React.Fragment>;
  return synopsisReportHTML;
}

SynopsisReportHtml.propTypes = {
  synopsisReport: PropTypes.object,
  student: PropTypes.object,
};
