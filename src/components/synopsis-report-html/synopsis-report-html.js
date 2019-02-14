import React from 'react';
import PropTypes from 'prop-types';
import './synopsis-report-html.scss';

export default function SynopsisReportHtml(props) {
  const { synopsisReport, student } = props;

  // const studentsSchool = student.studentData.school.find(s => s.currentSchool);
  const studentsSchoolName = 'School Name'; // studentsSchool ? studentsSchool.schoolName : 'Score Table';
  const gradeLevel = synopsisReport.Student__r.Student_Grade__c;
  const isMiddleSchool = gradeLevel > 5 && gradeLevel < 9;
  const playingTimeOverride = synopsisReport.Mentor_Granted_Playing_Time__c !== ''
    && synopsisReport.Mentor_Granted_Playing_Time__c !== synopsisReport.Earned_Playing_Time__c;

  const pointPercentage = (subject) => {
    const excusedDays = subject.Excused_Days__c;
    const stamps = subject.Stamps__c;
    const halfStamps = subject.Half_Stamps__c;
    
    const maxPointsPossible = subject.Class__r.Name.toLowerCase() !== 'tutorial'
      ? (40 - excusedDays * 8)
      : 8 - excusedDays * 2;
    const pointsEarned = 2 * stamps + halfStamps;
    const percentage = pointsEarned / maxPointsPossible;
    return Math.round((percentage * 100));
  };

  // styling for this html is in actions/point-tracker.js
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
        {synopsisReport.PointTrackers__r.records.map((subject, row) => {
          if (subject.Class__r.Name.toLowerCase() !== 'tutorial') {
            return (
            <tr key={ subject.Class__r.Name }>
              {isMiddleSchool ? <td>{subject.Class__r.Teacher__r.LastName}</td> : ''}
              <td key={ `${subject.Class__r.LastName}${row}1` }>{ subject.Class__r.Name }</td>
              {isMiddleSchool ? <td>{ subject.Grade__c }</td> : ''}
              <td key={ `${subject.Class__r.Name}${row}2` }>{ !synopsisReport.Playing_Time_Only__c ? subject.Excused_Days__c : 'N/A' } </td>
              <td key={ `${subject.Class__r.Name}${row}3` }>{ !synopsisReport.Playing_Time_Only__c ? subject.Stamps__c : 'N/A' }</td>
              <td key={ `${subject.Class__r.Name}${row}4` }>{ !synopsisReport.Playing_Time_Only__c ? subject.Half_Stamps__c : 'N/A' }</td>
              <td key={ `${subject.Class__r.Name}${row}5` }>{ !synopsisReport.Playing_Time_Only__c ? 20 - subject.Excused_Days__c * 4 - subject.Stamps__c - subject.scoring.Half_Stamps__c : 'N/A' }</td>
              <td key={ `${subject.Class__r.Name}${row}6` }>{ !synopsisReport.Playing_Time_Only__c ? pointPercentage(subject) : 'N/A' }</td>
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
                <td key={ `${subject.Class__r.Name}${row}2` }>{ !synopsisReport.Playing_Time_Only__c ? subject.Excused_Days__c : 'N/A' } </td>
                <td key={ `${subject.Class__r.Name}${row}3` }>{ !synopsisReport.Playing_Time_Only__c ? subject.Stamps__c : 'N/A' }</td>
                <td key={ `${subject.Class__r.Name}${row}4` }>{ !synopsisReport.Playing_Time_Only__c ? subject.Half_Stamps__c : 'N/A' }</td>
                <td key={ `${subject.Class__r.Name}${row}5` }>{ !synopsisReport.Playing_Time_Only__c ? 20 - subject.Excused_Days__c * 4 - subject.Stamps__c - subject.Half_Stamps__c : 'N/A' }</td>
                <td key={ `${subject.Class__r.Name}${row}6` }>{ !synopsisReport.Playing_Time_Only__c ? pointPercentage(subject) : 'N/A' }</td>
              </tr>
              );
            }
            return '';
          })
          : ''}
      </tbody>
    </table>
    </React.Fragment>;
  
  // const sportsInfoJSX = <React.Fragment>
  //   <h3>Team Information</h3>
  //   <table>
  //     <thead>
  //       <tr>
  //         <th>Team</th>
  //         <th>Sport</th>
  //         <th>League</th>
  //         <th>Calendar</th>
  //       </tr>
  //     </thead>
  //     <tbody>
  //       {student.studentData.sports.filter(s => s.currentlyPlaying).map((sport, i) => (
  //         <tr key={sport.sport}>
  //           <td key={`${sport.team}${i}`}>{sport.team}</td>
  //           <td key={`${sport.sport}${i}`}>{sport.sport}</td>
  //           <td key={`${sport.league}${i}`}>{sport.league}</td>
  //           <td key={`calendar${i}`}><a href={sport.teamCalendarUrl} target="_blank" rel="noopener noreferrer">Calendar</a></td>
  //         </tr>
  //       ))}
  //     </tbody>
  //   </table>
  // </React.Fragment>;

  const studentCalendarJSX = <React.Fragment>
    <h3><a href={student.studentData.googleCalendarUrl} target="_blank" rel="noopener noreferrer">Student&rsquo;s Google Calendar</a></h3>
  </React.Fragment>;

  const playingTimeJSX = <React.Fragment>
    <div className="row">
      <div className="left">
        { !synopsisReport.Playing_Time_Only__c 
          && synopsisReport.Point_Sheet_Status__c === 'Turned In'
          && (synopsisReport.Mentor_Granted_Playing_Time__c === '' || synopsisReport.Mentor_Granted_Playing_Time__c === synopsisReport.Earned_Playing_Time__c)
          ? <React.Fragment>
            <h3>Game Eligibility Earned</h3>
            <p>{synopsisReport.Earned_Playing_Time_c}</p>
          </React.Fragment>
          : <React.Fragment>
            <h3>Mentor Granted Playing Time</h3>
            <p>{synopsisReport.Mentor_Granted_Playing_Time__c}</p>
        </React.Fragment> }
      </div>
    </div>
  </React.Fragment>;

  const mentorCommentsJSX = playingTimeOverride || synopsisReport.Playing_Time_Only__c
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
          { synopsisReport.Point_Sheet_Status__c === 'Turned In' ? null
            : <React.Fragment>
              <p>Point Sheet not turned in.</p>
              </React.Fragment> }
          {scoreTableJSX}
          {studentCalendarJSX}
          {/* {sportsInfoJSX} */}
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
