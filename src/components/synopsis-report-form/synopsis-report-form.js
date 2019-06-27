import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PointTrackerTable from '../point-tracker-table/point-tracker-table';
import SynopsisReportSummary from '../synopsis-report-summary/synopsis-report-summary';
import TooltipItem from '../tooltip/tooltip';
import DropDown from '../drop-down/drop-down';
import TextArea from '../text-area/text-area';
import * as ttText from '../../lib/tooltip-text';
import * as srActions from '../../actions/synopsis-report';
import * as srPdfActions from '../../actions/synopsis-report-pdf';
import * as srSummaryActions from '../../actions/synopsis-report-summary';
import * as pl from '../../lib/pick-list-tests';
import * as pt from '../../lib/playing-time-utils';
import * as errorActions from '../../actions/error';

import './_synopsis-report-form.scss';

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
  getMsgBoardUrl: studentEmail => dispatch(srSummaryActions.getMsgBoardUrl(studentEmail)),
  clearMsgBoardUrl: () => dispatch(srSummaryActions.clearMsgBoardUrl()),
  clearError: () => dispatch(errorActions.clearError()),
});

class SynopsisReportForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.state.synopsisReport = this.props.synopsisReport;
    this.state.communications = this.initCommunicationsState(this.props.synopsisReport);
    this.state.synopsisSaved = false;

    this.props.clearMsgBoardUrl();
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.synopsisReportLink !== prevProps.synopsisReportLink) {
      this.setState({
        synopsisSaved: true,
        waitingOnSaves: false,
        synopsisLink: this.props.synopsisReportLink,
      });
      this.props.clearError();
    }
    if (this.props.synopsisReport !== prevProps.synopsisReport) {
      this.props.clearError();
      this.setState({ 
        synopsisReport: { ...this.props.synopsisReport },
        communications: this.initCommunicationsState(this.props.synopsisReport),
      });
      this.props.getMsgBoardUrl(this.props.synopsisReport.Student__r.npe01__HomeEmail__c);
    }
    const earnedPlayingTime = this.props.synopsisReport && this.props.synopsisReport.summer_SR ? '' : pt.calcPlayingTime(this.state.synopsisReport);
    if (this.state.synopsisReport && earnedPlayingTime !== this.state.synopsisReport.Earned_Playing_Time__c) {
      this.setState({
        synopsisReport: { ...this.state.synopsisReport, Earned_Playing_Time__c: earnedPlayingTime },
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
      newState.mentorSupportRequestOK = true;
      newState.mentorSupportRequestNotesOK = true;
      return newState;
    });
  }

  handleSubjectChange = (event) => {
    event.persist();

    const { name } = event.target;

    this.setState((prevState) => {
      const newState = { ...prevState };
      const firstSeparator = name.indexOf('+');
      const lastSeparator = name.lastIndexOf('+');
      const subjectName = name.slice(0, firstSeparator);
      const subjectId = name.slice(firstSeparator + 1, lastSeparator);
      const categoryName = name.slice(lastSeparator + 1);

      const newSubjects = newState.synopsisReport.PointTrackers__r.records
        .map((subject) => {
          if (subject.Id === subjectId) {
            const newSubject = { ...subject };
            if (categoryName === 'grade') {
              let grade = event.target.value;
              if (grade.toUpperCase() === 'N') grade = 'N/A';
              if (subjectName.toLowerCase() === 'tutorial') grade = 'N/A';
              if (grade !== 'N/A') {
                newSubject.Grade__c = pt.validateGrade(grade) ? parseInt(grade, 10) : '';
              } else {
                newSubject.Grade__c = 'N/A';
              }
            } else if (categoryName === 'Excused_Days__c') {
              const classDays = subjectName.toLowerCase() === 'tutorial' ? 4 : 5; // no tutorial on Wednesdays
              newSubject.Excused_Days__c = Math.min(Math.max(parseInt(event.target.value, 10), 0), classDays);
            } else {
              const currentValue = parseInt(event.target.value, 10);
              // test currentValue for NaN which doesn't equal itself.
              if (currentValue !== currentValue) { // eslint-disable-line
                newSubject[categoryName] = '';
              } else {
                const maxStampsAdjustment = categoryName === 'Stamps__c'
                  ? newSubject.Half_Stamps__c
                  : newSubject.Stamps__c;
                const maxValidStamps = pt.maxStampsPossible(subject) - maxStampsAdjustment;
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
    const playingTimeGranted = this.state.synopsisReport.Mentor_Granted_Playing_Time__c || (pl.turnedIn(sr.Point_Sheet_Status__c) && pt.validPointTrackerScores(sr));
    const commentsRequired = (pl.playingTimeOnly(sr.Synopsis_Report_Status__c) && !pl.turnedIn(sr.Point_Sheet_Status__c))
      || (!!sr.Mentor_Granted_Playing_Time__c && sr.Mentor_Granted_Playing_Time__c !== sr.Earned_Playing_Time__c);
    const commentsMade = !!sr.Mentor_Granted_Playing_Time_Explanation__c || !commentsRequired;
    const metWithMentee = !!sr.Weekly_Check_In_Status__c;
    const pointSheetStatusOK = !!sr.Point_Sheet_Status__c;
    const pointSheetStatusNotesOK = pl.turnedIn(sr.Point_Sheet_Status__c) 
      || (!pl.turnedIn(sr.Point_Sheet_Status__c) && !!sr.Point_Sheet_Status_Notes__c);
    const mentorSupportRequestOK = pl.playingTimeOnly(sr.Synopsis_Report_Status__c) || !!sr.Mentor_Support_Request__c;
    const mentorSupportRequestNotesOK = pl.playingTimeOnly(sr.Synopsis_Report_Status__c)
      || !pl.yes(sr.Mentor_Support_Request__c)
      || (pl.yes(sr.Mentor_Support_Request__c) && !!sr.Mentor_Support_Request_Notes__c);

    this.setState({
      playingTimeGranted,
      commentsMade,
      metWithMentee,
      pointSheetStatusOK,
      pointSheetStatusNotesOK,
      mentorSupportRequestOK,
      mentorSupportRequestNotesOK,
    });

    return playingTimeGranted 
      && commentsMade 
      && metWithMentee 
      && pointSheetStatusOK
      && pointSheetStatusNotesOK
      && mentorSupportRequestOK
      && mentorSupportRequestNotesOK;
  }

  commNotesAreValid = () => this.state.communications.every(pillar => !pillar.other || (pillar.other && !!pillar.notes));

  oneTeamNotesAreValid = () => (this.state.synopsisReport
    && (!this.state.synopsisReport.Other_Meetup__c || !!this.state.synopsisReport.One_Team_Notes__c));

  handleFullReportSubmit = (event) => {
    event.preventDefault();
    const { synopsisReport, communications } = this.state;
    synopsisReport.Synopsis_Report_Status__c = pl.SrStatus.Completed;
    const validMentorInput = this.validMentorInput(synopsisReport);
    if (validMentorInput 
      && pt.validPointTrackerScores(synopsisReport)
      && this.commNotesAreValid()
      && this.oneTeamNotesAreValid()) {      
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
      <div className="mentor-met-container" key='mentorMadeCheckin'>
        <DropDown
          compClass={this.state.metWithMentee ? 'title' : 'title required'}
          compName="Weekly_Check_In_Status__c"
          label="Weekly Check-in Status:"
          value={this.state.synopsisReport && this.state.synopsisReport.Weekly_Check_In_Status__c
            ? this.state.synopsisReport.Weekly_Check_In_Status__c
            : ''}
          onChange={ this.handleSimpleFieldChange}
          options={
            [
              { value: '', label: '--Select Check In Status--' },
              { value: 'Met', label: 'Met' },
              { value: 'Mentor missed check in', label: 'Mentor missed check in' },
              { value: 'Student missed check in', label: 'Student missed check in' },
            ]
          }/>
      </div>
    );

    const oneTeamJSX = (
      <fieldset>
        <div className="mentor-met-container">
        <label className="title">One Team Face-to-Face Meet-Ups</label>
        <TooltipItem id="tooltip-oneTeamMeetups" text={ttText.oneTeamMeetups}/>
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
            <TextArea
              compClass={ this.oneTeamNotesAreValid() ? 'title' : 'title required' }
              compName="One_Team_Notes__c"
              label="One Team Notes:"
              value={ this.state.synopsisReport && this.state.synopsisReport.One_Team_Notes__c
                ? this.state.synopsisReport.One_Team_Notes__c
                : '' }
              onChange={ this.handleTextAreaChange }
              placeholder={ this.state.synopsisReport && this.state.synopsisReport.Other_Meetup__c ? 'Please explain selection of Other' : ''}
              required={ this.state.synopsisReport && !!this.state.synopsisReport.Other_Meetup__c }
            />
          </div>
        </div>
    </fieldset>
    );

    const pointSheetStatusJSX = (
      <fieldset>
        <div className="mentor-met-container">
          <DropDown
            compClass={this.state.pointSheetStatusOK ? 'title' : 'title required'}
            compName="Point_Sheet_Status__c"
            label="Point Sheet Status:"
            value={this.state.synopsisReport && this.state.synopsisReport.Point_Sheet_Status__c
              ? this.state.synopsisReport.Point_Sheet_Status__c
              : ''}
            onChange={ this.handleSimpleFieldChange}
            options={
              [
                { value: '', label: '--Select Point Sheet Status--' },
                { value: 'Turned In', label: 'Turned In' },
                { value: 'Lost', label: 'Lost' },
                { value: 'Incomplete', label: 'Incomplete' },
                { value: 'Absent', label: 'Absent' },
                { value: 'Other', label: 'Other' },
              ]
            }/>
            { this.state.synopsisReport && !!this.state.synopsisReport.Point_Sheet_Status__c && !pl.turnedIn(this.state.synopsisReport.Point_Sheet_Status__c)
              ? <div className="survey-question-container">
                  <TextArea
                    compClass={`title ${this.state.pointSheetStatusNotesOK ? '' : 'required'}`}
                    compName="Point_Sheet_Status_Notes__c"
                    label="Point Sheet Status Notes"
                    placeholder={this.state.synopsisReport && !pl.turnedIn(this.state.synopsisReport.Point_Sheet_Status__c) 
                      ? 'Please explain selected status...' 
                      : ''}
                    value={ this.state.synopsisReport && this.state.synopsisReport.Point_Sheet_Status_Notes__c
                      ? this.state.synopsisReport.Point_Sheet_Status_Notes__c
                      : '' }
                    required={this.state.synopsisReport && pl.other(this.state.synopsisReport.Point_Sheet_Status__c)}
                    onChange={ this.handleTextAreaChange }
                    rows={ 2 }
                    cols={ 80 }
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
                  <TooltipItem id={'tooltip-corepillar'} text={ttText.ctpInPerson}/>
                </th>
                <th>
                  Digital
                  <TooltipItem id={'tooltip-corepillar'} text={ttText.ctpDigital}/>
                </th>
                <th>
                  Phone Call
                  <TooltipItem id={'tooltip-corepillar'} text={ttText.ctpPhoneCall}/>
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
                      <td className={ this.state.communications[i].other && !this.state.communications[i].notes ? 'required' : '' }>Notes:</td>
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
                <span className="name">{ this.state.synopsisReport.Earned_Playing_Time__c } </span>
            </div>
            : null }
          <div className="col-md-6">
            <DropDown
              compClass={this.state.playingTimeGranted ? 'title' : 'title required'}
              compName="Mentor_Granted_Playing_Time__c"
              label="Mentor Granted Playing Time:"
              value={ this.state.synopsisReport && this.state.synopsisReport.Mentor_Granted_Playing_Time__c
                ? this.state.synopsisReport.Mentor_Granted_Playing_Time__c
                : '' }
              onChange={ this.handleSimpleFieldChange}
              options={
                [
                  { value: '', label: '--Select Playing Time Override--' },
                  { value: 'Entire Game', label: 'Entire Game' },
                  { value: 'All but Start', label: 'All but Start' },
                  { value: 'Three Quarters', label: 'Three Quarters' },
                  { value: 'Two Quarters', label: 'Two Quarters' },
                  { value: 'One Quarter', label: 'One Quarter' },
                  { value: 'None of Game', label: 'None of Game' },
                ]
              }/>
          </div>
        </div>
      </React.Fragment>
    );

    const showMentorGrantedPlayingTimeExplanation = () => {
      if (this.state.synopsisReport) {
        // point sheet status is selected (truthy) and is not Turned In
        const psStatus = !!this.state.synopsisReport.Point_Sheet_Status__c && !pl.turnedIn(this.state.synopsisReport.Point_Sheet_Status__c);
        // mentor override status is anything truthy
        const mStatus = !!this.state.synopsisReport.Mentor_Granted_Playing_Time__c;
        // Initially (new SR) both status fields should be falsy (null or blank) and we shouldn't show mentor comments
        // if psStatus is true then we should show mentor comments, OR if mStatus is true
        return psStatus || mStatus;
      }
      return false;
    };

    const mentorGrantedPlayingTimeCommentsJSX = (
      <div className="synopsis">
        {
          showMentorGrantedPlayingTimeExplanation()
            ? <div key="mentorGrantedPlayingTimeComments">
                <TextArea
                  compClass={`title ${this.state.commentsMade ? '' : 'required'}`}
                  compName="Mentor_Granted_Playing_Time_Explanation__c"
                  label="Mentor Granted Playing Time Explanation:"
                  value={ this.state.synopsisReport && this.state.synopsisReport.Mentor_Granted_Playing_Time_Explanation__c
                    ? this.state.synopsisReport.Mentor_Granted_Playing_Time_Explanation__c
                    : '' }
                  onChange={ this.handleTextAreaChange }
                  rows={ 2 }
                  cols={ 80 }
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
              <TextArea
                compClass="title"
                compName={ names[comment].prop }
                label={ names[comment].text }
                value={ this.state.synopsisReport && this.state.synopsisReport[names[comment].prop]
                  ? this.state.synopsisReport[names[comment].prop]
                  : '' }
                onChange={ this.handleTextAreaChange }
                rows={ 6 }
                cols={ 80 } />
            </div>
          ))
        }
      </div>
    );

    const mentorSupportRequestJSX = (
      <div className="container">
        <div className="row ms-select">
          <div className="request-prompt-container">
            <span className={ this.state.mentorSupportRequestOK ? '' : 'required'}>Do you need additional support? </span>
          </div>
          <div className="request-dropdown-container">
            <select
              name="Mentor_Support_Request__c"
              onChange={ this.handleSimpleFieldChange }
              value={ this.state.synopsisReport ? this.state.synopsisReport.Mentor_Support_Request__c : '' }>
              <option value="">Pick One...</option>
              <option value="No">No</option>
              <option value="Student Follow Up">Student Follow Up</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="support-request-notes">
        { this.state.synopsisReport && !!this.state.synopsisReport.Mentor_Support_Request__c && this.state.synopsisReport.Mentor_Support_Request__c !== 'No'
          ? <TextArea
              compClass={ this.state.mentorSupportRequestNotesOK ? 'title' : 'title required' }
              compName="Mentor_Support_Request_Notes__c"
              label="Please explain:"
              value={ this.state.synopsisReport && this.state.synopsisReport.Mentor_Support_Request_Notes__c }
              onChange={ this.handleTextAreaChange }
              rows={ 2 }
              cols={ 80 } />
          : null
        }
        </div>
      </div>
    );

    const synopsisReportFormJSX = this.props.synopsisReport
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
                { this.state.synopsisReport && !this.state.synopsisReport.summer_SR
                  ? <PointTrackerTable
                    handleSubjectChange={ this.handleSubjectChange }
                    synopsisReport={ this.state.synopsisReport }
                    myRole={this.props.myRole}
                  />
                  : <h3>There are no Point Trackers assocated with this Synopsis Report</h3> }
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
          : synopsisReportFormJSX }
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
  clearMsgBoardUrl: PropTypes.func,
  clearError: PropTypes.func,
  getMsgBoardUrl: PropTypes.func,
  saveClick: PropTypes.func,
  cancelClick: PropTypes.func,
  content: PropTypes.object,
  myRole: PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportForm);
