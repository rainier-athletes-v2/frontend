import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PointTrackerTable from '../point-tracker-table/point-tracker-table';
import SynopsisReportSummary from '../synopsis-report-summary/synopsis-report-summary';
import TooltipItem from '../tooltip/tooltip';
import DropDown from '../drop-down/drop-down';
import TextArea from '../text-area/text-area';
import ImagePreviews from '../image-previews/image-previews';
// import ImageButton from '../image-button/image-button';
import * as ttText from '../../lib/tooltip-text';
import * as srActions from '../../actions/synopsis-report';
import * as srPdfActions from '../../actions/synopsis-report-pdf';
import * as msgBoardUrlActions from '../../actions/message-board-url';
import * as pl from '../../lib/pick-list-tests';
import * as pt from '../../lib/playing-time-utils';
import * as errorActions from '../../actions/error';
import * as imageActions from '../../actions/images';

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
  studentActionItems: { 
    text: 'Student Action Items:', 
    prop: 'Student_Action_Items__c', 
    placeholder: 'Explain specific actions you and the student discussed about taking over the weekend or the following week. This may be anything from retaking a test or organizing a binder or practicing 10 made baskets before Monday.', 
    required: true,
  },
  sportsUpdate: { 
    text: 'Sports Update:',
    prop: 'Sports_Update__c', 
    placeholder: 'After discussing with the student, explain highlights from previous games/practices. Also include date, time and location for upcoming games so everyone can attend when they are able!', 
    required: true,
  },
  additionalComments: { 
    text: 'Additional Comments to inform the core community:', 
    prop: 'Additional_Comments__c', 
    placeholder: '',
    required: false,
  },
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
  myRole: state.myProfile.role,
  messageBoardUrl: state.messageBoardUrl,
  error: state.error,
  bcImages: state.bcImages,
  imagePreviews: state.imagePreviews,
});

const mapDispatchToProps = dispatch => ({
  saveSynopsisReport: synopsisReport => dispatch(srActions.saveSynopsisReport(synopsisReport)),
  createSynopsisReportPdf: (student, sr) => dispatch(srPdfActions.createSynopsisReportPdf(student, sr)),
  setSynopsisReportLink: link => dispatch(srPdfActions.setSynopsisReportLink(link)),
  getMsgBoardUrl: studentEmail => dispatch(msgBoardUrlActions.getMsgBoardUrl(studentEmail)),
  clearMsgBoardUrl: () => dispatch(msgBoardUrlActions.clearMsgBoardUrl()),
  clearError: () => dispatch(errorActions.clearError()),
  uploadImages: imageData => dispatch(imageActions.uploadImages(imageData)),
  clearImages: () => dispatch(imageActions.clearImageSgids()),
});

class SynopsisReportForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.state.synopsisReport = this.props.synopsisReport;
    this.state.communications = this.initCommunicationsState(this.props.synopsisReport);
    this.state.waitingOnImages = false;
    this.state.imagesSaved = false;
    this.state.savedToSalesforce = false;
    this.state.waitingOnSalesforce = false;
    this.state.savedToGoogleDrive = false;
    this.state.waitingOnGoogleDrive = false;
    this.state.imageUploading = false;
    this.props.clearMsgBoardUrl();
  }

  componentDidMount = () => {
    this.props.clearImages();
    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.synopsisSaved = false;
      newState.communications = this.initCommunicationsState(this.props.synopsisReport);
      newState.playingTimeGranted = true;
      newState.commentsMade = true;
      newState.metWithMentee = true;
      newState.missedCheckinReasonOK = true;
      newState.pointSheetMissedReasonOK = true;
      newState.pointSheetStatusOK = true;
      newState.pointSheetStatusNotesOK = true;
      newState.mentorSupportRequestOK = true;
      newState.mentorSupportRequestNotesOK = true;
      return newState;
    });
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.error !== prevProps.error) {
      if (this.state.waitingOnImages) {
        this.props.clearError();
        const { synopsisReport, communications } = this.state;
        const mergedSynopsisReport = this.mergeCommuncationsWithSR(synopsisReport, communications);
        this.setState({
          waitingOnImages: false,
          imagesSaved: true,
          waitingOnSalesforce: true,
        });
        this.props.saveSynopsisReport({ ...mergedSynopsisReport });
      }
      if (this.state.waitingOnSalesforce
        && (this.state.synopsisReport 
        && !pl.playingTimeOnly(this.state.synopsisReport.Synopsis_Report_Status__c))) {
        this.props.clearError();
        const { synopsisReport, communications } = this.state;
        const mergedSynopsisReport = this.mergeCommuncationsWithSR(synopsisReport, communications);
        this.setState({
          waitingOnSalesforce: false,
          savedToSalesforce: true,
          waitingOnGoogleDrive: true,
          savedToGoogleDrive: false,
        });
        this.props.createSynopsisReportPdf(this.props.content, { ...mergedSynopsisReport });
      }
      if (this.state.waitingOnSalesforce
        && (this.state.synopsisReport
        && pl.playingTimeOnly(this.state.synopsisReport.Synopsis_Report_Status__c))) {
        this.props.clearError();
        this.setState({
          waitingOnSalesforce: false,
          savedToSalesforce: true,
          waitingOnGoogleDrive: false,
          savedToGoogleDrive: true,
        });
      }
    }
    if (this.props.synopsisReportLink !== prevProps.synopsisReportLink) {
      this.setState({
        savedToGoogleDrive: true,
        waitingOnGoogleDrive: false,
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
      this.props.clearError();
      this.props.getMsgBoardUrl(this.props.synopsisReport.Student__r.Email);
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
              let grade = event.target.value.toUpperCase();
              if (grade === 'N') grade = 'N/A';
              if (subjectName.toLowerCase() === 'tutorial') grade = 'N/A';
              if (grade !== 'N/A') {
                // newSubject.Grade__c = pt.validateGrade(grade) ? parseInt(grade, 10) : '';
                newSubject.Grade__c = pt.validateGrade(grade) ? grade : '';
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
    const { value } = event.target;
    if (value && value.length <= 1000) {
      this.handleSimpleFieldChange(event);
    }
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
    const missedCheckinReasonOK = sr.Weekly_Check_In_Status__c === 'Met' || !!sr.Weekly_Check_In_Missed_Reason__c;
    const pointSheetStatusOK = !!sr.Point_Sheet_Status__c;
    const pointSheetMissedReasonOK = sr.Point_Sheet_Status__c === 'Turned in' || !!sr.Point_Sheet_Status_Reason__c;
    const pointSheetStatusNotesOK = sr.Point_Sheet_Status__c === 'Turned in'
      || sr.Point_Sheet_Status_Reason__c !== 'Other'
      || !!sr.Point_Sheet_Status_Notes__c;
    const mentorSupportRequestOK = pl.playingTimeOnly(sr.Synopsis_Report_Status__c) || !!sr.Mentor_Support_Request__c;
    const mentorSupportRequestNotesOK = pl.playingTimeOnly(sr.Synopsis_Report_Status__c)
      || !pl.yes(sr.Mentor_Support_Request__c)
      || (pl.yes(sr.Mentor_Support_Request__c) && !!sr.Mentor_Support_Request_Notes__c);

    this.setState({
      playingTimeGranted,
      commentsMade,
      metWithMentee,
      missedCheckinReasonOK,
      pointSheetStatusOK,
      pointSheetMissedReasonOK,
      pointSheetStatusNotesOK,
      mentorSupportRequestOK,
      mentorSupportRequestNotesOK,
    });

    return playingTimeGranted 
      && commentsMade 
      && metWithMentee 
      && missedCheckinReasonOK
      && pointSheetStatusOK
      && pointSheetMissedReasonOK
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

    this.props.clearError();

    if (validMentorInput 
      && pt.validPointTrackerScores(synopsisReport)
      && this.commNotesAreValid()
      && this.oneTeamNotesAreValid()) {
      if (this.props.imagePreviews) {   
        this.setState({ waitingOnImages: true });
        this.props.uploadImages(this.props.imagePreviews.map(preview => (preview.file))); // justs end file objects
      } else {
        this.setState({ waitingOnSalesforce: true });
        const mergedSynopsisReport = this.mergeCommuncationsWithSR(synopsisReport, communications);
        this.props.saveSynopsisReport({ ...mergedSynopsisReport });
      }
    } else {
      alert('Please provide required information before submitting full report.'); // eslint-disable-line
    }
  }

  handlePlayingTimeSubmit = (event) => {
    event.preventDefault();
    const { synopsisReport } = this.state;
    synopsisReport.Synopsis_Report_Status__c = pl.SrStatus.PlayingTimeOnly;

    if (this.validMentorInput(synopsisReport)) {
      this.setState({ 
        ...this.state, 
        waitingOnSalesforce: true,
        savedToGoogleDrive: true,
      });
      this.props.saveSynopsisReport({ ...synopsisReport });
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
      className="comm-notes-textarea"
      rows="3"
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

  handleImageUpload = (event) => {
    const errs = []; 
    const files = Array.from(event.target.files);

    const types = ['image/png', 'image/jpeg', 'image/gif'];

    files.forEach((file) => {
      if (types.every(type => file.type !== type)) {
        errs.push(`'${file.type}' is not a supported format`);
      }
    });

    if (errs.length) {
      return alert(errs[0]); // errs.forEach(err => this.toast(err, 'custom', 2000, toastColor))
    }

    if (files.length > 0) {
      this.setState({ inputImageLabelText: `${files.length} file(s) selected` });
    }

    this.setState({ imageUploading: true });
    
    this.props.uploadImages(files);

    return 1;
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
      <fieldset>
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
              { value: 'Did not meet', label: 'Did not meet' },
            ]
          }/>
          { this.state.synopsisReport && !!this.state.synopsisReport.Weekly_Check_In_Status__c 
            && this.state.synopsisReport.Weekly_Check_In_Status__c === 'Did not meet' 
            ? <div className="survey-question-container">
                <TextArea
                  compClass={`title ${this.state.missedCheckinReasonOK ? '' : 'required'}`}
                  compName="Weekly_Check_In_Missed_Reason__c"
                  label="The RA student did not meet because"
                  placeholder="Please explain missed checkin..."
                  value={ this.state.synopsisReport && this.state.synopsisReport.Weekly_Check_In_Missed_Reason__c
                    ? this.state.synopsisReport.Weekly_Check_In_Missed_Reason__c
                    : '' }
                  required={this.state.synopsisReport && this.state.synopsisReport.Weekly_Check_In_Status__c === 'Did not meet'}
                  onChange={ this.handleTextAreaChange }
                  rows={ 2 }
                  cols={ 80 }
                />
              </div>
            : '' }
      </div>
      </fieldset>
    );

    const anyOneTeamChecked = this.state.synopsisReport
                    && oneTeam.some(team => this.state.synopsisReport[names[team].prop]);

    const oneTeamJSX = (
      <fieldset>
        <div className="mentor-met-container">
        <label className="title">In addition to your regular weekly check in, please indicate which, if any, additional ONE Team meet-ups you had with Rainier Athletes this week</label>
        {/* <TooltipItem id="tooltip-oneTeamMeetups" text={ttText.oneTeamMeetups}/> */}
        {oneTeam.map((keyName, i) => (
          <div className="survey-question-container" key={ i }>
            <input
              type="checkbox"
              name={ names[keyName].prop} // oneTeamQuestion }
              className="text-align"
              onChange= { this.handleCheckboxChange }
              checked={ (this.state.synopsisReport && this.state.synopsisReport[names[keyName].prop]) || false }/>
            <label htmlFor={ names[keyName].prop }>{ names[keyName].text }</label>
          </div>
        ))
        }
        { anyOneTeamChecked
          ? <div className="survey-question-container">
            <TextArea
              compClass={ this.oneTeamNotesAreValid() ? 'title' : 'title required' }
              compName="One_Team_Notes__c"
              label="Additional ONE Team Meet-Ups Notes:"
              value={ this.state.synopsisReport && this.state.synopsisReport.One_Team_Notes__c
                ? this.state.synopsisReport.One_Team_Notes__c
                : '' }
              onChange={ this.handleTextAreaChange }
              // placeholder={ this.state.synopsisReport && this.state.synopsisReport.Other_Meetup__c ? 'Please explain selection of Other' : ''}
              placeholder="Please provide any details about how your additional meeting(s) went."
              required={ this.state.synopsisReport && !!this.state.synopsisReport.Other_Meetup__c }
            />
          </div>
          : '' }
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
                { value: 'Turned in', label: 'Turned in' },
                { value: 'Not turned in', label: 'Not turned in' },
              ]
            }/>
          {this.state.synopsisReport && !!this.state.synopsisReport.Point_Sheet_Status__c && this.state.synopsisReport.Point_Sheet_Status__c === 'Not turned in'
            ? <DropDown
                compClass={this.state.pointSheetMissedReasonOK ? 'title' : 'title required'}
                compName="Point_Sheet_Status_Reason__c"
                label="The RA student did not turn in a point sheet because:"
                value={this.state.synopsisReport && this.state.synopsisReport.Point_Sheet_Status_Reason__c
                  ? this.state.synopsisReport.Point_Sheet_Status_Reason__c
                  : ''}
                onChange={ this.handleSimpleFieldChange}
                options={
                  [
                    { value: '', label: '--Select Reason for no point sheet--' },
                    { value: 'It was lost', label: 'It was lost' },
                    { value: 'Student was absent from school', label: 'Student was absent from school' },
                    { value: 'Other', label: 'Other' },
                  ]
                }/> 
            : ''}
            { this.state.synopsisReport && this.state.synopsisReport.Point_Sheet_Status__c 
              && this.state.synopsisReport.Point_Sheet_Status__c === 'Not turned in' 
              && !!this.state.synopsisReport.Point_Sheet_Status_Reason__c 
              && this.state.synopsisReport.Point_Sheet_Status_Reason__c === 'Other'
              ? <div className="survey-question-container">
                  <TextArea
                    compClass={`title ${this.state.pointSheetStatusNotesOK ? '' : 'required'}`}
                    compName="Point_Sheet_Status_Notes__c"
                    label="What happened?"
                    placeholder={this.state.synopsisReport && !pl.turnedIn(this.state.synopsisReport.Point_Sheet_Status__c) 
                      ? 'Please explain...' 
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
        <span className="title">Please check boxes to indicate how and with whom you communicated this week:</span>
        <div className="survey-questions">
          <table className="comm-tp">
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
                  <tr key={`${com.role}${i}5`} className={ com.other ? 'show-comm-notes' : 'hide-comm-notes'}>
                      <td className={ this.state.communications[i].other && !this.state.communications[i].notes ? 'comm-notes-label required' : 'comm-notes-label' }>Notes:</td>
                      <td colSpan="4" key={`${com.role}${i}6`} className="comm-notes-textarea">{this.commNotes(com, i)}</td>
                  </tr>
                  {/* {com.other
                    ? <tr key={`${com.role}${i}5`}>
                      <td className={ this.state.communications[i].other && !this.state.communications[i].notes ? 'required' : '' }>Notes:</td>
                      <td colSpan="4" key={`${com.role}${i}6`}>{this.commNotes(com, i)}</td>
                    </tr>
                    : null} */}
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
          {this.props.content && this.props.content.studentData.synergyPassword} 
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
        const psStatus = !!this.state.synopsisReport.Point_Sheet_Status__c && this.state.synopsisReport.Point_Sheet_Status__c === 'Not turned in';
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
        <div key="mentorGrantedPlayingTimeComments">
                <TextArea
                  compClass={`title ${this.state.commentsMade ? '' : 'required'}`}
                  compName="Mentor_Granted_Playing_Time_Explanation__c"
                  label="Playing Time Comments"
                  value={ this.state.synopsisReport && this.state.synopsisReport.Mentor_Granted_Playing_Time_Explanation__c
                    ? this.state.synopsisReport.Mentor_Granted_Playing_Time_Explanation__c
                    : '' }
                  placeholder={showMentorGrantedPlayingTimeExplanation() ? 'Please explain why you over-rode earned playing time.' : ''}
                  onChange={ this.handleTextAreaChange }
                  rows={ 2 }
                  cols={ 80 }
                />
        </div>
      </div>
    );

    const submitPlayingTimeOnlyButtonJSX = (
      <div className="synopsis">
        { this.state.waitingOnSalesforce 
          ? <FontAwesomeIcon icon="spinner" className="fa-spin fa-2x"/> 
          : <React.Fragment>
              <button type="submit" onClick={ this.handlePlayingTimeSubmit } className="btn btn-secondary" id="playing-time-only">Submit Playing Time Only</button>
              <p>Please plan to complete the rest of the report by Sunday evening. Thank you!</p> 
            </React.Fragment> }
      </div>
    );

    const synopsisComments = [
      'studentActionItems', // records[0].Student_Action_Items__c
      'sportsUpdate', // records[0].Sports_Update__c
      'additionalComments', // records[0].Additional_Comments__c
    ];

    const synopsisCommentsJSX = (
      <fieldset>
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
                placeholder={ names[comment].placeholder }
                required={ names[comment].required }
                onChange={ this.handleTextAreaChange }
                rows={ 6 }
                cols={ 80 } />
            </div>
          ))
        }
      </div>
      </fieldset>
    );

    const identityStatementStatusJSX = (
      <div className="container">
        <div className="column ms-select">
          <div className="request-prompt-container">
            <span >Please select where you currently are with the Identity Statement Project:</span>
          </div>
          <div className="request-dropdown-container">
            <select
              name="Identity_Statement_Status__c"
              onChange={ this.handleSimpleFieldChange }
              value={ this.state.synopsisReport ? this.state.synopsisReport.Identity_Statement_Status__c : '' }>
              <option value="Tier 0: Not Started">Tier 0: Not Started</option>
              <option value="Tier 1: Values Tables">Tier 1: Values Tables</option>
              <option value="Tier 2: Identity Statement Questions">Tier 2: Identity Statement Questions</option>
              <option value="Tier 3: Values and Questions Complete">Tier 3: Values and Questions Complete</option>
            </select>
          </div>
        </div>
      </div>
    );


    const mentorSupportRequestJSX = (
      <div className="container">
        <div className="column ms-select">
          <div className="request-prompt-container">
            <span className={ this.state.mentorSupportRequestOK ? '' : 'required'}>
            Do you need additional support?
            </span>
          </div>
          <div className="request-dropdown-container">
            <select
              className="request-select"
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
              value={ (this.state.synopsisReport && this.state.synopsisReport.Mentor_Support_Request_Notes__c) || ''}
              onChange={ this.handleTextAreaChange }
              rows={ 2 }
              cols={ 80 } />
          : null
        }
        </div>
      </div>
    );

    const formButtonOrMessage = () => { 
      if (this.state.waitingOnImages) {
        return (<React.Fragment>
          <h3>Uploading images to Basecamp...</h3>
          <p>This may take a moment depending on image size(s).</p>
        </React.Fragment>);
      } 
      if (this.state.waitingOnGoogleDrive) {
        return (<React.Fragment>
          <h3>Saving PDF to Google Drive...</h3>
          <p>This is slow. Please be patient.</p>
        </React.Fragment>);
      }
      if (this.state.waitingOnSalesforce) {
        return (<h3>Saving synopsis report to Salesforce...</h3>);
      }
      if (!this.props.messageBoardUrl) {
        if (!this.props.error) {
          return (<React.Fragment>
            <h5>Waiting for Basecamp Messaging connection...</h5>
            <p>If the submit button doesn&#39;t appear soon contact an administrator.</p>
          </React.Fragment>);
        }
      } 
      if (!(this.state.waitingOnSalesforce && this.state.savedToSalesforce
        && this.state.waitingOnGoogleDrive && this.state.savedToGoogleDrive)) {
        if (this.props.messageBoardUrl) {
          return (<h5><button onClick={ this.handleFullReportSubmit } className="btn btn-secondary" id="full-report" type="submit">Submit Full Report</button>  to Student&#39;s Core Community</h5>);
        }
        return (<React.Fragment><h5><button onClick={ this.handleFullReportSubmit } className="btn btn-secondary" id="full-report" type="submit">Save to Salesforce</button></h5><p>(There&#39;s an issue retrieving Basecamp info. Please alert an administrator.)</p></React.Fragment>);  
      }
      return null;
    };

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
                { synopsisCommentsJSX }
                {/* <ImageButton onChange={this.handleImageUpload} labelText={this.state.inputImageLabelText} /> */}
                <ImagePreviews />
                { communicationPillarsTableJSX }
                { oneTeamJSX }
                <div className="modal-footer">
                  <h5>The following items are viewed by RA Staff only:</h5>
                  { identityStatementStatusJSX }
                  { mentorSupportRequestJSX }
                  { formButtonOrMessage() }
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
        { this.state.savedToGoogleDrive
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
  messageBoardUrl: PropTypes.string,
  error: PropTypes.number,
  uploadImages: PropTypes.func,
  clearImages: PropTypes.func,
  imagePreviews: PropTypes.any,
  bcImages: PropTypes.any,
};

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportForm);
