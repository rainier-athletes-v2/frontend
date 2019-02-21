import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PointTrackerTable from '../point-tracker-table/point-tracker-table';
import SynopsisReportSummary from '../synopsis-report-summary/synopsis-report-summary';
import TooltipItem from '../tooltip/tooltip';
import * as srActions from '../../actions/synopsis-report';
import * as srPdfActions from '../../actions/synopsis-report-pdf';
import * as pl from '../../lib/pick-list-tests';

import './synopsis-report-form.scss';

const oneTeam = [
  'wednesdayCheckin',
  'mentorMeal',
  'sportsGame',
  'communityEvent',
  'iepSummerReview',
  'oneTeamOther',
];

const names = {
  mentorGrantedPlayingTimeComments: { text: 'Mentor Granted Playing Time Explanation:', prop: 'Mentor_Granted_Playing_Time_Explanation__c' },
  studentActionItems: { text: 'Student Action Items:', prop: 'Student_Action_Items__c' },
  sportsUpdate: { text: 'Sports Update:', prop: 'Sports_Update__c' },
  additionalComments: { text: 'Additional Comments:', prop: 'Additional_Comments__c' },
  wednesdayCheckin: { text: 'Wednesday Check-In', prop: 'Wednesday_Check_In__c' },
  mentorMeal: { text: 'Mentor Meal', prop: 'Mentor_Meal__c' },
  sportsGame: { text: 'Sports Game Meet-Up', prop: 'Sports_Game__c' },
  communityEvent: { text: 'RA Comm. Event Meet-Up', prop: 'Community_Event__c' },
  iepSummerReview: { text: 'IEP/Summer Review Meeting', prop: 'IEP_Summer_Review_Meeting__c' },
  oneTeamOther: { text: 'Other meetup', prop: 'Other_Meetup__c' },
};

const mapStateToProps = state => ({
  synopsisReportLink: state.synopsisReportLink,
  synopsisReport: state.synopsisReport && state.synopsisReport.records && state.synopsisReport.records[0],
  // pointTrackers: state.synopsisReport && state.synopsisReport.records && state.synopsisReport.records[0].PointTrackers__r.records,
  myRole: state.myProfile.role,
});

const mapDispatchToProps = dispatch => ({
  saveSynopsisReport: synopsisReport => dispatch(srActions.saveSynopsisReport(synopsisReport)),
  createSynopsisReportPdf: (student, sr) => dispatch(srPdfActions.createSynopsisReportPdf(student, sr)),
  setSynopsisReportLink: link => dispatch(srPdfActions.setSynopsisReportLink(link)),
});

class SynopsisReportForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.state.synopsisReport = this.props.synopsisReport;
    this.state.communications = this.initCommunicationsState(this.props.synopsisReport);
    this.state.synopsisSaved = false;
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.synopsisReportLink !== prevProps.synopsisReportLink) {
      this.setState({
        ...this.state,
        synopsisSaved: true,
        waitingOnSaves: false,
        synopsisLink: this.props.synopsisReportLink,
        // synopsisReport: this.props.synopsisReport,
      });
    }
    if (this.props.synopsisReport !== prevProps.synopsisReport) {
      this.setState({ 
        ...this.state, 
        synopsisReport: this.props.synopsisReport,
        communications: this.initCommunicationsState(this.props.synopsisReport),
      });
    }
  }

  initCommunicationsState = (sr) => {
    if (!sr) return null;
    // convert SF comm pillars multi-select fields into legacy communications object:
    // communications: [
    //   {
    //     with: 'Student', // records[0].Student_Touch_Points__c
    //     role: 'student',
    //     f2fCheckIn: false,
    //     f2fRaEvent: false,
    //     f2fGameOrPractice: false,
    //     basecampOrEmail: false,
    //     phoneOrText: false,
    //     familyMeeting: false,
    //     notes: '', // records[0].Student_Touch_Points_Other_c
    //   },
    //   etc for Family, Teacher and Coach
    // SF multiselect values are Face-to-Face, Digital, Phone Call, Other
    const comm = [];
    const pillar = [
      'Student',
      'Family',
      'Teacher',
      'Coach',
    ];
    for (let i = 0; i < pillar.length; i++) {
      const p = {};
      const tpKey = `${pillar[i]}_Touch_Points__c`;
      const notes = `${pillar[i]}_Touch_Points_Other__c`;
      p.with = pillar[i];
      p.role = pillar[i].toLowerCase();
      p.f2fCheckIn = sr[tpKey] && sr[tpKey].indexOf('Face-To-Face') > -1;
      p.digital = sr[tpKey] && sr[tpKey].indexOf('Digital') > -1;
      p.phoneCall = sr[tpKey] && sr[tpKey].indexOf('Phone Call') > -1;
      p.other = sr[tpKey] && sr[tpKey].indexOf('Other') > -1;
      p.notes = sr[notes] || '';
      comm.push(p);
    }
    return comm;
  }

  mergeCommuncationsWithSR = (sr, comm) => {
    // refactor legacy communications array into SF fields
    const keys = ['Student', 'Family', 'Teacher', 'Coach'];
    comm.forEach((p, i) => {
      const tpKey = `${keys[i]}_Touch_Points__c`;
      const notesKey = `${keys[i]}_Touch_Points_Other__c`;
      let str = '';
      if (p.f2fCheckIn) str = 'Face-To-Face';
      str += str.length > 0 && p.digital ? ';' : '';
      if (p.digital) str += 'Digital';
      str += str.length > 0 && p.phoneCall ? ';' : '';
      if (p.phoneCall) str += 'Phone Call';
      str += str.length > 0 && p.other ? ';' : '';
      if (p.other) str += 'Other';
      sr[tpKey] = str;
      sr[notesKey] = p.notes; 
    });
    return sr;
  }

  componentDidMount = () => {
    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.synopsisSaved = false;
      newState.communications = this.initCommunicationsState(this.props.synopsisReport);
      newState.playingTimeGranted = true;
      newState.commentsMade = true;
      newState.metWithMentee = true;
      newState.pointSheetStatusOK = true;
      newState.pointSheetStatusNotesOK = true;
      return newState;
    });
  }

  handleSubjectChange = (event) => {
    event.persist();

    const validGrades = ['A', 'B', 'C', 'D', 'F', '', 'N', 'N/A'];

    const { name } = event.target;

    this.setState((prevState) => {
      const newState = { ...prevState };
      const [subjectName, categoryName] = name.split('-');
      const newSubjects = newState.synopsisReport.PointTrackers__r.records
        .map((subject) => {
          if (subject.Class__r.Name === subjectName) {
            const newSubject = { ...subject };
            if (categoryName === 'grade') {
              newSubject.Grade__c = validGrades.includes(event.target.value.toUpperCase()) ? event.target.value.toUpperCase() : '';
              if (newSubject.Grade__c === 'N') newSubject.Grade__c = 'N/A';
              if (subjectName.toLowerCase() === 'tutorial') newSubject.Grade__c = 'N/A';
            } else if (categoryName === 'Excused_Days__c') {
              newSubject.Excused_Days__c = Math.min(Math.max(parseInt(event.target.value, 10), 0), 5);
            } else {
              const currentValue = parseInt(event.target.value, 10);
              // test currentValue for NaN which doesn't equal itself.
              if (currentValue !== currentValue) { // eslint-disable-line
                newSubject[categoryName] = '';
              } else {
                const maxStampsPossible = 20 - (newSubject.Excused_Days__c * 4);
                const maxStampsAdjustment = categoryName === 'Stamps__c'
                  ? newSubject.Half_Stamps__c
                  : newSubject.Stamps__c;
                const maxValidStamps = maxStampsPossible - maxStampsAdjustment;
                newSubject[categoryName] = Math.floor(Math.min(Math.max(currentValue, 0), maxValidStamps));
              }
            }

            return newSubject;
          }
          return subject;
        });

      newState.synopsisReport.PointTrackers__r.records = newSubjects;
      return newState;
    });
  }

  handleSimpleFieldChange = (event) => {
    const { name, value } = event.target;
    const newState = { ...this.state };
    newState.synopsisReport[name] = value;
    return this.setState(newState);
  }

  handleTextAreaChange = (event) => {
    event.persist();
    this.handleSimpleFieldChange(event);
  }

  handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.synopsisReport[name] = checked;
      return newState; 
    });
  }

  validMentorInput = (sr) => {
    const playingTimeGranted = !!sr.Mentor_Granted_Playing_Time__c || (pl.turnedIn(sr.Point_Sheet_Status__c) && this.validPointTrackerScores(sr));
    const commentsRequired = (pl.playingTimeOnly(sr.Synopsis_Report_Status__c) && !pl.turnedIn(sr.Point_Sheet_Status__c))
      // || !pl.turnedIn(sr.Point_Sheet_Status__c)
      || (!!sr.Mentor_Granted_Playing_Time__c && sr.Mentor_Granted_Playing_Time__c !== sr.Earned_Playing_Time__c);
    const commentsMade = !!sr.Mentor_Granted_Playing_Time_Explanation__c || !commentsRequired;
    const metWithMentee = !!sr.Weekly_Check_In_Status__c;
    const pointSheetStatusOK = !!sr.Point_Sheet_Status__c;
    const pointSheetStatusNotesOK = pl.turnedIn(sr.Point_Sheet_Status__c) 
      || (!pl.turnedIn(sr.Point_Sheet_Status__c) && !!sr.Point_Sheet_Status_Notes__c);
    const supportRequestNotesOK = !pl.yes(sr.Mentor_Support_Request__c)
      || (pl.yes(sr.Mentor_Support_Request__c) && !!sr.Mentor_Support_Request_Notes__c);

    this.setState({
      playingTimeGranted,
      commentsMade,
      metWithMentee,
      pointSheetStatusOK,
      pointSheetStatusNotesOK,
      supportRequestNotesOK,
    });

    return playingTimeGranted 
      && commentsMade 
      && metWithMentee 
      && pointSheetStatusOK
      && pointSheetStatusNotesOK
      && supportRequestNotesOK;
  }

  validPointTrackerScores = (sr) => {
    if (!pl.turnedIn(sr.Point_Sheet_Status__c)) return false;

    const goodSubjectStamps = sr.PointTrackers__r.records.every(subject => (
      subject.Stamps__c >= 0 && subject.Half_Stamps__c >= 0 && subject.Excused_Days__c >= 0 
      && subject.Stamps__c + subject.Half_Stamps__c <= 20 - subject.Excused_Days__c * 4 
    ));
    const isElementaryStudent = sr.Student__r && sr.Student__r.Student_Grade__c < 6;
    const goodSubjectGrades = isElementaryStudent
      || sr.PointTrackers__r.records.every(subject => !!subject.Grade__c);

    return goodSubjectStamps && goodSubjectGrades;
  }

  handleFullReportSubmit = (event) => {
    event.preventDefault();
    const { synopsisReport, communications } = this.state;
    synopsisReport.Synopsis_Report_Status__c = pl.SrStatus.Completed;
    const validMentorInput = this.validMentorInput(synopsisReport);
    if (validMentorInput && (pl.turnedIn(synopsisReport.Point_Sheet_Status__c) ? this.validPointTrackerScores(synopsisReport) : true)) {      
      this.setState({ ...this.state, waitingOnSaves: true });
      const mergedSynopsisReport = this.mergeCommuncationsWithSR(synopsisReport, communications);
      this.props.saveSynopsisReport({ ...mergedSynopsisReport });
      this.props.createSynopsisReportPdf(this.props.content, { ...mergedSynopsisReport });
    } else {
      alert('Please provide required information before submitting full report.'); // eslint-disable-line
    }
  }

  handlePlayingTimeSubmit = (event) => {
    event.preventDefault();
    const { synopsisReport } = this.state;
    synopsisReport.Synopsis_Report_Status__c = pl.SrStatus.PlayingTimeOnly;

    if (this.validMentorInput(synopsisReport)) {
      this.setState({ ...this.state, waitingOnSaves: true });
      this.props.saveSynopsisReport({ ...synopsisReport });
      this.props.setSynopsisReportLink('playing time only'); // so SR summary model is triggered.
    } else {
      alert('Please provide required information before submitting playing time.'); // eslint-disable-line
    }
  }

  calcPlayingTime = () => {
    if (!this.state.synopsisReport) return null;

    const subjects = this.state.synopsisReport.PointTrackers__r.records;
    const student = this.state.synopsisReport.Student__r;
    const sr = this.state.synopsisReport;

    const isElementarySchool = student.Student_Grade__c < 6;

    const numberOfPeriods = subjects.length;
    const totalClassTokens = numberOfPeriods * 2;
    const totalTutorialTokens = isElementarySchool ? 0 : 4;
    const totalGradeTokens = isElementarySchool ? 0 : numberOfPeriods;
    const totalTokensPossible = totalClassTokens + totalGradeTokens + totalTutorialTokens;

    const totalEarnedTokens = subjects.map((subject) => {
      const grade = subject.Grade__c;
      const subjectName = subject.Class__r.Name;
      // halfStamps are "X"s from the scoring sheet
      const excusedDays = subject.Excused_Days__c;
      const stamps = subject.Stamps__c;
      const halfStamps = subject.Half_Stamps__c;

      let pointsPossible = 40 - (excusedDays * 8);
      if (subjectName.toLowerCase() === 'tutorial') pointsPossible = 8 - (excusedDays * 2);
      if (isElementarySchool && subjectName.toLowerCase() === 'tutorial') pointsPossible = 0;

      const totalClassPointsEarned = (2 * stamps) + halfStamps;
      const classPointPercentage = totalClassPointsEarned / pointsPossible;

      let classTokensEarned = 0;
      if (classPointPercentage >= 0.50) classTokensEarned = 1;
      if (classPointPercentage >= 0.75) classTokensEarned = 2;

      let gradeTokensEarned = 0;
      if (!isElementarySchool && ['A', 'B', 'N/A'].includes(grade)) gradeTokensEarned = 2;
      if (!isElementarySchool && grade === 'C') gradeTokensEarned = 1;

      const totalTokensEarned = classTokensEarned + gradeTokensEarned;

      return totalTokensEarned;
    });

    const totalTokensEarned = totalEarnedTokens.reduce((acc, cur) => acc + cur, 0);
    const tokenPercentage = totalTokensEarned / totalTokensPossible;

    let earnedPlayingTime = 'None of Game';
    if (tokenPercentage >= 0.35) earnedPlayingTime = 'One Quarter';
    if (tokenPercentage >= 0.55) earnedPlayingTime = 'Two Quarters';
    if (tokenPercentage >= 0.65) earnedPlayingTime = 'Three Quarters';
    if (tokenPercentage >= 0.75) earnedPlayingTime = 'All but Start';
    if (tokenPercentage >= 0.8) earnedPlayingTime = 'Entire Game';
    if (earnedPlayingTime !== sr.Earned_Playing_Time__c) {
      this.setState({
        ...this.state,
        synopsisReport: { ...this.state.synopsisReport, Earned_Playing_Time__c: earnedPlayingTime },
      });
    }

    return earnedPlayingTime;
  }

  handleCommPillarChange = (event) => {
    const { name, options } = event.target;

    let selectValues = '';
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectValues += `${selectValues.length > 0 ? ';' : ''}${options[i].value}`;
      }
    }

    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.synopsisReport[`${name}_Touch_Points__c`] = selectValues;
      return newState;
    });
  }

  handleCommCheckboxChange = (event) => {
    const { name, checked } = event.target;
    const [role, row, columnKey] = name.split('-'); // eslint-disable-line

    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.communications[row][columnKey] = checked;
      if (columnKey === 'other' && !checked) {
        newState.communications[row].notes = '';
      }
      return newState;
    });
  }

  commCheckbox = (com, row, col) => {
    const columnKeys = [
      'f2fCheckIn',
      'digital',
      'phoneCall',
      'other',
    ];
  
    const checked = this.state.communications[row][columnKeys[col]] || false;

    return (
      <input
        type="checkbox"
        name={ `${com.role}-${row}-${columnKeys[col]}` }
        onChange= { this.handleCommCheckboxChange }
        checked={ checked }
        />
    );
  }

  handleCommNotesChange = (event) => {
    const { id, value } = event.target;
    const row = id.split('-')[1];

    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.communications[row].notes = value;
      return newState;
    });
  }

  commNotes = (com, row) => {
    return (<textarea
      rows="2"
      wrap="hard"
      required={this.state.communications[row].other}
      placeholder={this.state.communications[row].other ? 'Please explain choice of Other' : ''}
      id={`${com.role}-${row}-notes`}
      value={this.state.communications[row].notes} onChange={this.handleCommNotesChange}/>
    );
  }

  handleTouchPointNotesChange = (event) => {
    const { name, value } = event.target;

    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.synopsisReport[`${name}_Touch_Points_Other__c`] = value;
      return newState;
    });
  }

  render() {
    const srHeadingJSX = (
      <div className="row">
        <div className="col-md-6">
          <span className="title">Student</span>
          <span className="name">{ this.state.synopsisReport && this.state.synopsisReport.Student__r.Name }</span>
        </div>
        <div className="col-md-6">
          <span className="title">Reporting Period</span>
          <span className="name">{`${this.state.synopsisReport && this.state.synopsisReport.Week__c}`}</span>
        </div>
      </div>
    );

    const mentorMadeScheduledCheckinJSX = (
      <React.Fragment>
      <div className="mentor-met-container" key='mentorMadeCheckin'>
        <label className={this.state.metWithMentee ? 'title' : 'title required'} 
          htmlFor="Weekly_Check_In_Status__c">Weekly Check-in Status: </label>
          <TooltipItem id="tooltip-weeklyCheckin" text="Report the success of your weekly check in."/>
          <select
            value={this.state.synopsisReport && this.state.synopsisReport.Weekly_Check_In_Status__c
              ? this.state.synopsisReport.Weekly_Check_In_Status__c
              : ''}
            required
            name="Weekly_Check_In_Status__c"
            onChange={ this.handleSimpleFieldChange}>
            <option key="0" value="">--Select Check In Status--</option>
            <option key="1" value="Met">Met</option>
            <option key="2" value="Mentor missed check in">Mentor missed check in</option>
            <option key="3" value="Student missed check in">Student missed check in</option>
          </select>
      </div>
      </React.Fragment>
    );

    const oneTeamJSX = (
      <fieldset>
        <div className="mentor-met-container">
        <label className="title">One Team Face-to-Face Meet-Ups</label>
        <TooltipItem id="tooltip-oneTeamMeetups" text="Indicate which, if any, One Team activities you participated in this week."/>
        {oneTeam.map((keyName, i) => (
          <div className="survey-question-container" key={ i }>
            <input
              type="checkbox"
              name={ names[keyName].prop} // oneTeamQuestion }
              onChange= { this.handleCheckboxChange }
              checked={ (this.state.synopsisReport && this.state.synopsisReport[names[keyName].prop]) || false }/>
            <label htmlFor={ names[keyName].prop }>{ names[keyName].text }</label>
          </div>
        ))
        }
          <div className="survey-question-container">
            <span className="title" htmlFor="One_Team_Notes__c">One Team Notes</span>
                <textarea
                  name="One_Team_Notes__c"
                  onChange={ this.handleTextAreaChange }
                  value={ this.state.synopsisReport && this.state.synopsisReport.One_Team_Notes__c
                    ? this.state.synopsisReport.One_Team_Notes__c
                    : '' }
                  placeholder={ this.state.synopsisReport && this.state.synopsisReport.Other_Meetup__c ? 'Please explain selection of Other' : ''}
                  required={this.state.synopsisReport && this.state.synopsisReport.Other_Meetup__c}
                  rows="2"
                  cols="80"
                  wrap="hard"
                />
          </div>
        </div>
    </fieldset>
    );

    const pointSheetStatusJSX = (
      <fieldset>
        <div className="mentor-met-container">
          <label className={this.state.pointSheetStatusOK ? 'title' : 'title required'} htmlFor="Point_Sheet_Status__c">Point Sheet Status: </label>
          <TooltipItem id="tooltip-pointSheetStatus" text="Did student turn in Point Sheet? Select the appropriate status from the list."/>
            <select
              name="Point_Sheet_Status__c" 
              value={this.state.synopsisReport && this.state.synopsisReport.Point_Sheet_Status__c
                ? this.state.synopsisReport.Point_Sheet_Status__c
                : ''}
              required
              onChange={ this.handleSimpleFieldChange}>
              <option key="0" value="">--Select Point Sheet Status--</option>
              <option key="1" value="Turned In">Turned In</option>
              <option key="2" value="Lost">Lost</option>
              <option key="3" value="Incomplete">Incomplete</option>
              <option key="4" value="Absent">Absent</option>
              <option key="5" value="Other">Other</option>
            </select>
            { this.state.synopsisReport && !(pl.turnedIn(this.state.synopsisReport.Point_Sheet_Status__c) || pl.none(this.state.synopsisReport.Point_Sheet_Status__c))
              ? <div className="survey-question-container">
                  <label className={`title ${this.state.pointSheetStatusNotesOK 
                    ? '' : 'required'}`} htmlFor="Point_Sheet_Status_Notes__c">Point Sheet Status Notes</label>
                    <TooltipItem id="tooltip-pointSheetStatusNotes" 
                      text="Explain any Point Sheet status other than Turned In."/>
                    <textarea
                      name="Point_Sheet_Status_Notes__c"
                      placeholder={this.state.synopsisReport && pl.other(this.state.synopsisReport.Point_Sheet_Status__c) 
                        ? 'Please explain selected status...' 
                        : ''}
                      onChange={ this.handleTextAreaChange }
                      value={ this.state.synopsisReport && this.state.synopsisReport.Point_Sheet_Status_Notes__c
                        ? this.state.synopsisReport.Point_Sheet_Status_Notes__c
                        : '' }
                      required={this.state.synopsisReport && pl.other(this.state.synopsisReport.Point_Sheet_Status__c)}
                      rows="2"
                      cols="80"
                      wrap="hard"
                    />
                </div>
              : '' }
        </div>
    </fieldset>
    );

    const communicationPillarsTableJSX = (
      <fieldset>
        <span className="title">Communication Touch Points</span>
        <div className="survey-questions">
          <table className="table">
            <thead>
              <tr>
                <th>RA Core Pillar</th>
                <th>
                  Face-To-Face
                  <TooltipItem id={'tooltip-corepillar'} text={'In person communication.'}/>
                </th>
                <th>
                  Digital
                  <TooltipItem id={'tooltip-corepillar'} text={'Communication through basecamp, text msg, email, etc.'}/>
                </th>
                <th>
                  Phone Call
                  <TooltipItem id={'tooltip-corepillar'} text={'Digital communication through voice or video.'}/>
                </th>
                <th>Other</th>
              </tr>
            </thead>
            <tbody>
              {this.state.communications
                ? this.state.communications.map((com, i) => (
                  <React.Fragment key={`${com.role}${i}7`}>
                  <tr key={`${com.role}${i}8`}>
                    <td key={`${com.role}${i}0`}>{com.with}</td>
                    <td key={`${com.role}${i}1`}>{this.commCheckbox(com, i, 0)}</td>
                    <td key={`${com.role}${i}2`}>{this.commCheckbox(com, i, 1)}</td>
                    <td key={`${com.role}${i}3`}>{this.commCheckbox(com, i, 2)}</td>
                    <td key={`${com.role}${i}4`}>{this.commCheckbox(com, i, 3)}</td>
                  </tr>
                  {com.other
                    ? <tr key={`${com.role}${i}5`}>
                      <td>Notes:</td>
                      <td colSpan="4" key={`${com.role}${i}6`}>{this.commNotes(com, i)}</td>
                    </tr>
                    : null}
                  </React.Fragment>
                ))
                : null
            }
            </tbody>
          </table>
        </div>
      </fieldset>
    );

    const synergyJSX = (
      <div className="col-md-6">
        <span className="title"><a href="https://wa-bsd405-psv.edupoint.com/PXP2_Login_Student.aspx?regenerateSessionId=True"
          alt="team calendar url"
          target="_blank"
          rel="noopener noreferrer">Synergy Account (Click to Visit)</a></span>
        <span>
          <FontAwesomeIcon icon="user" className="fa-2x"/>
          {this.props.content && this.props.content.studentData.synergyUsername}
        </span>
        <span>
          <FontAwesomeIcon icon="key" className="fa-2x"/>
          {this.props.content && this.props.content.studentData.synergyPassword} {/* Buffer.from(this.props.content.studentData.synergy.password, 'base64').toString()} */}
        </span>
      </div>
    );

    // // add back in calc playing time calc below
    const playingTimeJSX = (
      <React.Fragment>
        <div className="row">
          { this.state.synopsisReport && pl.turnedIn(this.state.synopsisReport.Point_Sheet_Status__c)
            ? <div className="col-md-6">
                <span className="title">Game Eligibility Earned</span>
                <span className="name">{ this.calcPlayingTime() } </span>
            </div>
            : null }
          <div className="col-md-6">
            <label className={this.state.playingTimeGranted ? 'title' : 'title required'} 
              htmlFor="Mentor_Granted_Playing_Time__c">
              Mentor Granted Playing Time: </label>
              <TooltipItem id="tooltip-mentorGrantedPlayingTime" text="You may override earned playing time. This selection is required if no Point Sheet has been turned in."/>
            <select
              name="Mentor_Granted_Playing_Time__c"
              onChange={ this.handleSimpleFieldChange }
              value={ this.state.synopsisReport && this.state.synopsisReport.Mentor_Granted_Playing_Time__c
                ? this.state.synopsisReport.Mentor_Granted_Playing_Time__c
                : '' }
              >
              <option value="" defaultValue>Select playing time override:</option>
              <option value="Entire Game">Entire Game</option>
              <option value="All but Start">All but Start</option>
              <option value="Three Quarters">Three Quarters</option>
              <option value="Two Quarters">Two Quarters</option>
              <option value="One Quarter">One Quarter</option>
              <option value="None of Game">None of Game</option>
            </select>
          </div>
        </div>
      </React.Fragment>
    );

    const mentorGrantedPlayingTimeCommentsJSX = (
      <div className="synopsis">
        {
          this.state.synopsisReport
            && (!pl.turnedIn(this.state.synopsisReport.Point_Sheet_Status__c)
            || this.state.synopsisReport.Earned_Playing_Time__c !== this.state.synopsisReport.Mentor_Granted_Playing_Time__c)
            ? <div key="mentorGrantedPlayingTimeComments">
                <label className={`title ${this.state.commentsMade ? '' : 'required'}`} 
                  htmlFor="Mentor_Granted_Playing_Time_Explanation__c">Mentor Granted Playing Time Explanation: </label>
                  <TooltipItem id="tooltip-mentorExplanation" text="If you selected a playing time other that what the student earned, please explain your choice here."/>
                <textarea
                  name="Mentor_Granted_Playing_Time_Explanation__c"
                  onChange={ this.handleTextAreaChange }
                  value={ this.state.synopsisReport && this.state.synopsisReport.Mentor_Granted_Playing_Time_Explanation__c
                    ? this.state.synopsisReport.Mentor_Granted_Playing_Time_Explanation__c
                    : '' }
                  rows="2"
                  cols="80"
                  wrap="hard"
                />
              </div>
            : null
        }
      </div>
    );

    const submitPlayingTimeOnlyButtonJSX = (
      <div className="synopsis">
        { this.state.waitingOnSaves 
          ? <FontAwesomeIcon icon="spinner" className="fa-spin fa-2x"/> 
          : <React.Fragment>
              <button type="submit" onClick={ this.handlePlayingTimeSubmit } className="btn btn-secondary" id="playing-time-only">Submit Playing Time Only</button>
              <p>Please plan to complete the rest of the report by Sunday evening and post Summary to Basecamp. </p> 
            </React.Fragment> }
      </div>
    );

    const synopsisComments = [
      'studentActionItems', // records[0].Student_Action_Items__c
      'sportsUpdate', // records[0].Sports_Update__c
      'additionalComments', // records[0].Additional_Comments__c
    ];

    const synopsisCommentsJSX = (
      <div className="synopsis">
        {
          synopsisComments.map((comment, i) => (
            <div key={ i }>
              <label className="title" htmlFor={ names[comment].prop }>{ names[comment].text }</label>
              <textarea
                name={ names[comment].prop }
                onChange={ this.handleTextAreaChange }
                value={ this.state.synopsisReport && this.state.synopsisReport[names[comment].prop]
                  ? this.state.synopsisReport[names[comment].prop]
                  : '' }
                rows="6"
                cols="80"
                wrap="hard"
              />
            </div>
          ))
        }
      </div>
    );

    const mentorSupportRequestJSX = (
      <div className="container">
        <div className="row ms-select">
        <span>Do you need additional support from RA staff? </span>
        <select className="form-control col-md-3"
          name="Mentor_Support_Request__c"
          onChange={ this.handleSimpleFieldChange }
          value={ this.state.synopsisReport && this.state.synopsisReport.Mentor_Support_Request__c }>
          <option value="No">No</option>
          <option value="Student Follow Up">Student Follow Up</option>
          <option value="Technical Support">Technical Support</option>
          <option value="Other">Other</option>
        </select>
        </div>
        { this.state.synopsisReport && pl.yes(this.state.synopsisReport.Mentor_Support_Request__c)
          ? <React.Fragment>
            <div className="support-request-notes">
              <label 
                className={`title ${pl.yes(this.state.synopsisReport.Mentor_Support_Request__c)
                  && !this.state.synopsisReport.Mentor_Support_Request_Notes__c ? 'required' : ''}`}
                htmlFor="Mentor_Support_Request_Notes__c">
                Please explain: </label>
              <textarea
                name="Mentor_Support_Request_Notes__c"
                onChange={this.handleTextAreaChange}
                value={this.state.synopsisReport && this.state.synopsisReport.Mentor_Support_Request_Notes__c}
                rows="2"
                cols="80"
                wrap="hard"
              />
            </div>
          </React.Fragment>
          : null
        }
      </div>
    );

    const synopsisReportForm = this.props.synopsisReport
      ? (
      <div className="points-tracker panel point-tracker-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">SYNOPSIS REPORT</h5>
              <button type="button" 
                className="close" 
                onClick={ this.props.cancelClick }
                data-dismiss="modal" 
                aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <form className="data-entry container">
                { srHeadingJSX }
                { mentorMadeScheduledCheckinJSX }
                { pointSheetStatusJSX }
                { playingTimeJSX }
                { mentorGrantedPlayingTimeCommentsJSX }
                { submitPlayingTimeOnlyButtonJSX }
                { this.state.synopsisReport && pl.turnedIn(this.state.synopsisReport.Point_Sheet_Status__c)
                  ? <PointTrackerTable
                    handleSubjectChange={ this.handleSubjectChange }
                    synopsisReport={ this.state.synopsisReport }
                    myRole={this.props.myRole}
                  />
                  : null }
                { synergyJSX }
                { communicationPillarsTableJSX }
                { oneTeamJSX }
                { synopsisCommentsJSX }
                <div className="modal-footer">
                { mentorSupportRequestJSX }
                  { this.state.waitingOnSaves 
                    ? <FontAwesomeIcon icon="spinner" className="fa-spin fa-2x"/> 
                    : <h3><button onClick={ this.handleFullReportSubmit } className="btn btn-secondary" id="full-report" type="submit">Submit Full Report</button>  to Student&#39;s Core Community</h3> }
                </div>

              </form>
            </div>

          </div>
        </div>
      </div>
      )
      : null; 

    return (
      <div className="modal-backdrop">
        { this.state.synopsisSaved 
          ? <SynopsisReportSummary 
            synopsisReport={this.state.synopsisReport} 
            onClose={ this.props.saveClick }/> 
          : synopsisReportForm }
      </div>
    );
  }
}

SynopsisReportForm.propTypes = {
  synopsisReportLink: PropTypes.string,
  synopsisReport: PropTypes.object,
  pointTrackers: PropTypes.object,
  handleChange: PropTypes.func,
  saveSynopsisReport: PropTypes.func,
  createSynopsisReportPdf: PropTypes.func,
  setSynopsisReportLink: PropTypes.func,
  saveClick: PropTypes.func,
  cancelClick: PropTypes.func,
  content: PropTypes.object,
  myRole: PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportForm);
