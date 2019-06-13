import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SynopsisReportsList from '../synopsis-reports-list/synopsis-reports-list';
import * as util from '../../lib/utils';

import './_mentor-content.scss';

export default function MentorContent(props) {
  const student = props.content;
  const haveData = !!student.studentData;

  const currentSchoolName = haveData ? student.studentData.schoolName.trim() : '';
  const schoolNameText = `${currentSchoolName}${haveData ? `, Grade ${student.studentData.grade}` : ''}${haveData && student.studentData.teacher ? `, Teacher: ${student.studentData.teacher}` : ''}`;

  const currentSportsJSX = haveData ? (student.studentData.teams && student.studentData.teams.filter(t => t.currentlyPlaying).map((t, i) => (
    <div className="team-info" key={`sport-${i}`}>
      <span className="label">Team: {t.teamName}</span>
      <span className="indented label">Sport: {t.sport}</span>
      <span className="indented label">League: {t.league}</span>
      <span className="indented label">Calendar: <a href={t.teamCalendarUrl ? t.teamCalendarUrl : '#'}
          alt="team calendar url"
          target="_blank"
          rel="noopener noreferrer"
          className="team-calendar-url">Click here</a></span>
      <span className="indented label">Coach: {t.coach}</span>
      <span className="indented label">Phone: {t.phone}</span>
      <span className="indented label">Email: <a
        href={t.email ? `mailto:${t.email}` : '#'}
        target="_blank"
        rel="noopener noreferrer">{t.email}</a></span>
    </div>
  ))) : null;

  const familyMembersJSX = haveData ? (student.studentData.family && student.studentData.family.map((f, i) => (
    <div className="current-family" key={ i }>
      <span className="label">Name: {`${f.name}`}</span>
      <span className="indented label">Phone: {f.phone ? f.phone : ''}</span>
      <span className="indented label">Email: <a
        href={f.email ? `mailto:${f.email}` : '#'}
        target="_blank"
        rel="noopener noreferrer">{f.email}</a></span>
    </div>
  ))) : null;

  const studentProfile = (
    <div className="student-profile container">
      <div className="profile-primary row">
        <div>
          <span>
            <FontAwesomeIcon icon="birthday-cake" className="fa-2x"/>
            { student.studentData ? util.convertDateToValue(student.studentData.dateOfBirth) : null }
          </span>
          <span>
            <FontAwesomeIcon icon="school" className="fa-2x"/>
            { schoolNameText }
          </span>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">

          <span className="title">Contact</span>
          <span>
            <FontAwesomeIcon icon="phone" className="fa-2x"/>
            { student.phone }
          </span>
          <span>
            <FontAwesomeIcon icon="at" className="fa-2x"/>
            { student.primaryEmail }
          </span>
        </div>
        <div className="col-md-6">
          <span className="title"><a href="https://wa-bsd405-psv.edupoint.com/PXP2_Login_Student.aspx?regenerateSessionId=True"
            alt="team calendar url"
            target="_blank"
            rel="noopener noreferrer">Synergy Account (Click to Visit)</a>
          </span>
          <span>
            <FontAwesomeIcon icon="user" className="fa-2x"/>
            {haveData ? student.studentData.synergyUsername : ''}
          </span>
          <span>
            <FontAwesomeIcon icon="key" className="fa-2x"/>
            {haveData ? student.studentData.synergyPassword : ''} {/* Buffer.from(student.studentData.synergyPassword, 'base64').toString() */}
          </span>
        </div>
      </div>
      <div className="row">
        <div className="profile-link">
          <a className="btn-link-1" 
            href={ student.studentData ? student.studentData.synopsisReportArchiveUrl : null }
            alt="link to synopsis report archive"
            target="blank"
            rel="noopener noreferrer">Synopsis Report Archive</a>
          <a className="btn-link-1" href={ student.studentData ? student.studentData.googleCalendarUrl : null }
            alt="link to student calendar"
            target="blank"
            rel="noopener noreferrer">Student Calendar</a>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <span className="title">Sport Info</span>
          {currentSportsJSX}
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <span className="title">Family Info</span>
            {familyMembersJSX}
        </div>
      </div>
    </div>
  );
  
  return (
    <React.Fragment>
    <div role="main" className="col-md-8 panel content-panel" style={ { overflow: 'scroll' } }>
      <div className="sidebar-sticky">
        <span className="content-heading">{`Student Profile: ${student.firstName ? student.firstName : ''} ${student.lastName ? student.lastName : ''}`}</span>
        <SynopsisReportsList onClick={ props.editRegularSrClick } onSummerClick={ props.editSummerSrClick }/>
        { student.studentData ? studentProfile : null }
      </div>
    </div>
    {
      props.children
    }
    </React.Fragment>
  );
}

MentorContent.propTypes = {
  content: PropTypes.object,
  title: PropTypes.string,
  btnClick: PropTypes.func,
  children: PropTypes.node,
  editRegularSrClick: PropTypes.func,
  editSummerSrClick: PropTypes.func,
};
