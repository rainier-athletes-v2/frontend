import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { getReportingPeriods } from '../../lib/utils';
import PointTrackerTable from '../point-tracker-table/point-tracker-table';
import SynopsisReportSummary from '../synopsis-report-summary/synopsis-report-summary';
import TooltipItem from '../tooltip/tooltip';
import * as srActions from '../../actions/synopsis-report';
import * as srPdfActions from '../../actions/synopsis-report-pdf';

import './synopsis-report-form.scss';

const emptySR = {
  date: new Date(Date.now()).toDateString(), // records[0].Start_Date__c
  title: '', // records[0].Week__c
  student: '', // undefined
  studentName: '', // records[0].Student__r.Name
  subjects: [{ // records[0].PointTrackers__r.records[n]
    subjectName: 'Tutorial', // ...Class__r.Name
    period: '', // ...Class__r.Period__c,
    teacher: '', // ...Class__r.Teacher__r.Name
    scoring: {
      excusedDays: 0, // records[n].Excused_Days__c
      stamps: 0, // records[n].Stamps__c,
      halfStamps: 0, // records[n].Half_Stamps__c
    },
    grade: 'N/A', // records[n].Grade__c
  }],
  playingTimeOnly: true, // records[0].Playing_Time_Only__c
  mentorMadeScheduledCheckin: -1, // records[0].Weekly_Check_In_Status__c
  studentMissedScheduledCheckin: -1, // same as above
  communications: [
    {
      with: 'Student', // records[0].Student_Touch_Points__c
      role: 'student',
      f2fCheckIn: false,
      f2fRaEvent: false,
      f2fGameOrPractice: false,
      basecampOrEmail: false,
      phoneOrText: false,
      familyMeeting: false,
      notes: '', // records[0].Student_Touch_Points_Other_c
    },
    {
      with: 'Family', // records[0].Family_Touch_Points__c
      role: 'family',
      f2fCheckIn: false,
      f2fRaEvent: false,
      f2fGameOrPractice: false,
      basecampOrEmail: false,
      phoneOrText: false,
      familyMeeting: false,
      notes: '', // records[0].Family_Touch_Points_Other__c
    },
    {
      with: 'Teacher', // records[0].Teacher_Touch_Points__c
      role: 'teacher',
      f2fCheckIn: false,
      f2fRaEvent: false,
      f2fGameOrPractice: false,
      basecampOrEmail: false,
      phoneOrText: false,
      familyMeeting: false,
      notes: '', // records[0].Teacher_Touch_Points_Other__c
    },
    {
      with: 'Coach', // records[0].Coach_Touch_Points__c
      role: 'coach',
      f2fCheckIn: false,
      f2fRaEvent: false,
      f2fGameOrPractice: false,
      basecampOrEmail: false,
      phoneOrText: false,
      familyMeeting: false,
      notes: '', // records[0].Coach_Touch_Points_Other__c
    },
  ],
  oneTeam: {
    wednesdayCheckin: false, // records[0].Wednesday_Check_In__c
    mentorMeal: false, // records[0].Mentor_Meal__c
    sportsGame: false, // records[0].Sports_Game__c
    communityEvent: false, // records[0].Community_event__c
    iepSummerReview: false, // records[0].IEP_Summer_Review_Meeting__c
    other: false, // records[0].Other_Meetup__c
  },
  oneTeamNotes: '', // records[0].One_Team_Notes__c
  pointSheetStatus: { // records[0].Point_Sheet_Status__c,
    turnedIn: true,
    lost: false,
    incomplete: false,
    absent: false,
    other: false,
  },
  pointSheetStatusNotes: '', // records[0].Point_Sheet_Status_Notes__c
  earnedPlayingTime: '', // records[0].Earned_Playing_Time__c
  mentorGrantedPlayingTime: '', // records[0].Mentor_Granted_Playing_Time__c
  synopsisComments: {
    mentorGrantedPlayingTimeComments: '', // records[0].Mentor_Granted_Playing_Time_Explanation__c
    studentActionItems: '', // records[0].Student_Action_Items__c
    sportsUpdate: '', // records[0].Sports_Update__c
    additionalComments: '', // records[0].Additional_Comments__c
  },
};

const oneTeam = [
  'wednesdayCheckin',
  'mentorMeal',
  'sportsGame',
  'communityEvent',
  'iepSummerReview',
  'oneTeamOther',
];

const commPillars = [
  'Student',
  'Family',
  'Teacher',
  'Coach',
];

const names = {
  turnedIn: 'Point Sheet turned in and at least 25% complete: ',
  lost: 'Point Sheet Lost',
  incomplete: 'Point Sheet less than 25% completed',
  absent: 'Student Reported Absent',
  other: 'Other',
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
  createSynopsisReportPdf: sr => dispatch(srPdfActions.createSynopsisReportPdf(sr)),
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

  // shouldComponentUpdate = (prevProps, prevState) => {
  //   if (prevState.synopsisReport) return false;
  //   return true;
  // }

  // static getDerivedStateFromProps = (nextProps) => {
  //   console.log('sr getDerivedState', nextProps);
  //   if (nextProps.synopsisReport) {
  //     return { synopsisReport: nextProps.synopsisReport };
  //   }

  //   return null;
  // }

  // componentDidUpdate = (prevProps, prevState) => {
  //   debugger;
  //   if (!prevProps.synopsisReport && this.props.synopsisReport) {
  //     this.state.setState({ ...prevState, synopsisReport: this.props.synopsisReport });
  //   }
  // }

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
    // const selectedStudent = this.props.content;
    // const { lastPointTracker } = selectedStudent.studentData;

    this.setState((prevState) => {
      const newState = { ...prevState };
    //   newState = lastPointTracker || emptySR;
    //   newState.student = selectedStudent;
    //   newState.studentName = `${selectedStudent.firstName} ${selectedStudent.lastName}`;
    //   newState.isElementaryStudent = selectedStudent.studentData.school
    //     && selectedStudent.studentData.school.length
    //     ? selectedStudent.studentData.school.find(s => s.currentSchool).isElementarySchool
    //     : false;
    //   newState.mentorMadeScheduledCheckin = -1;
    //   newState.studentMissedScheduledCheckin = -1;
    //   newState.playingTimeOnly = false;
    //   // elementary has no tutorial so pop it from the empty point tracker
    //   if (newState.isElementaryStudent && !lastPointTracker) newState.subjects.pop();
    //   newState.title = `${newState.studentName}: ${getReportingPeriods()[1]}`;
      newState.synopsisSaved = false;
    //   newState.mentorGrantedPlayingTime = '';
    //   newState.synopsisComments.mentorGrantedPlayingTimeComments = '';
    //   newState.pointSheetStatusNotes = '';
    //   newState.pointSheetStatus.lost = false;
    //   newState.pointSheetStatus.incomplete = false;
    //   newState.pointSheetStatus.absent = false;
    //   newState.pointSheetStatus.other = false;
    //   newState.teachers = this.props.content.studentData.teachers;
      newState.communications = this.initCommunicationsState(this.props.synopsisReport);
      newState.playingTimeGranted = true;
      newState.commentsMade = true;
      newState.metWithMentee = true;
      // newState.studentMissedMentor = true;
      newState.pointSheetStatusOK = true;
      newState.pointSheetStatusNotesOK = true;
      return newState;
    });
  }

  // handleTitleChange = (event) => {
  //   const newState = { ...this.state, synopsisSaved: false };
  //   newState.title = `${newState.studentName}: ${event.target.value}`;
  //   this.setState(newState);
  // }

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
    const playingTimeGranted = sr.Point_Sheet_Status__c === 'Turned In' || !!sr.Mentor_Granted_Playing_Time__c;
    const commentsRequired = sr.Playing_Time_Only__c
      || !sr.Point_Sheet_Status__c === 'Turned In'
      || (!!sr.Mentor_Granted_Playing_Time__c && sr.Mentor_Granted_Playing_Time__c !== sr.Earned_Playing_Time__c);
    const commentsMade = !!sr.Mentor_Granted_Playing_Time_Explanation__c || !commentsRequired;
    const metWithMentee = !!sr.Weekly_Check_In_Status__c;
    const pointSheetStatusOK = !!sr.Point_Sheet_Status__c;
    const pointSheetStatusNotesOK = sr.Point_Sheet_Status__c === 'Turned In' 
      || (sr.Point_Sheet_Status__c !== 'Turned In' && !!sr.Point_Sheet_Status_Notes__c);

    this.setState({
      playingTimeGranted,
      commentsMade,
      metWithMentee,
      pointSheetStatusOK,
      pointSheetStatusNotesOK,
    });

    return playingTimeGranted 
      && commentsMade 
      && metWithMentee 
      && pointSheetStatusOK
      && pointSheetStatusNotesOK;
  }

  validPointTrackerScores = (sr) => {
    if (sr.Point_Sheet_Status__c !== 'Turned In') return false;

    const goodSubjectStamps = sr.PointTrackers__r.records.every(subject => (
      subject.Stamps__c + subject.Half_Stamps__c <= 20 - subject.Excused_Days__c * 4 
    ));
    const isElementaryStudent = sr.Student_Grade__c < 6;
    const goodSubjectGrades = isElementaryStudent
      || sr.PointTrackers__r.records.every(subject => subject.Grade__c !== '');
    return goodSubjectStamps && goodSubjectGrades;
  }

  handleFullReportSubmit = (event) => {
    event.preventDefault();
    const { synopsisReport, communications } = this.state;
    synopsisReport.Playing_Time_Only__c = false;
    const validMentorInput = this.validMentorInput(synopsisReport);
    if (validMentorInput && (synopsisReport.Point_Sheet_Status__c === 'Turned In' ? this.validPointTrackerScores(synopsisReport) : true)) {      
      this.setState({ ...this.state, waitingOnSaves: true });
      const mergedSynopsisReport = this.mergeCommuncationsWithSR(synopsisReport, communications);
      this.props.saveSynopsisReport({ ...mergedSynopsisReport });
      this.props.createSynopsisReportPdf({ ...synopsisReport });
      // this.setState({ synopsisReport: null });
    } else {
      alert('Please provide required information before submitting full report.'); // eslint-disable-line
    }
  }

  handlePlayingTimeSubmit = (event) => {
    event.preventDefault();
    const { synopsisReport } = this.state;
    synopsisReport.Playing_Time_Only__c = true;
    if (this.validMentorInput(synopsisReport)) {
      this.setState({ ...this.state, waitingOnSaves: true, synopsisReport });
      this.props.saveSynopsisReport({ ...synopsisReport });
      this.props.createSynopsisReportPdf({ ...synopsisReport });
      this.setState({ synopsisReport: null });
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

    let selectValues = ''; // this.state.synopsisReport && this.state.synopsisReport[`${name}_Touch_Points__c`];
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
        <div className="survey-questions">
        <span className="title">One Team Face-to-Face Meet-Ups</span>
        {oneTeam.map((keyName, i) => (
          <div className="survey-question-container" key={ i }>
            <input
              type="checkbox"
              name={ names[keyName].prop} // oneTeamQuestion }
              onChange= { this.handleCheckboxChange }
              checked={ this.state.synopsisReport && this.state.synopsisReport[names[keyName].prop] }/>
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
        <div className="survey-questions">
          <span className={`title ${this.state.pointSheetStatusOK ? '' : 'required'}`}>Point Sheet Status</span>
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
            { this.state.synopsisReport && this.state.synopsisReport.Point_Sheet_Status__c !== 'Turned In'
              ? <div className="survey-question-container">
                  <span className={`title ${this.state.pointSheetStatusNotesOK 
                    ? '' : 'required'}`} htmlFor="Point_Sheet_Status_Notes__c">Point Sheet Status Notes</span>
                    <textarea
                      name="Point_Sheet_Status_Notes__c"
                      placeholder={this.state.synopsisReport && this.state.synopsisReport.Point_Sheet_Status__c === 'Other' 
                        ? 'Please explain selected status...' 
                        : ''}
                      onChange={ this.handleTextAreaChange }
                      value={ this.state.synopsisReport && this.state.synopsisReport.Point_Sheet_Status_Notes__c
                        ? this.state.synopsisReport.Point_Sheet_Status_Notes__c
                        : '' }
                      required={this.state.synopsisReport && this.state.synopsisReport.Point_Sheet_Status__c === 'Other'}
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
                  <TooltipItem id={'tooltip-corepillar'} text={'In person communication'}/>
                </th>
                <th>
                  Digital
                  <TooltipItem id={'tooltip-corepillar'} text={'Communication through basecamp, text msg, email, etc.'}/>
                </th>
                <th>
                  Phone Call
                  <TooltipItem id={'tooltip-corepillar'} text={'Digital communication through voice or video'}/>
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

    // // add back in calc playing time calc below
    const playingTimeJSX = (
      <React.Fragment>
        <div className="row">
          { this.state.synopsisReport && this.state.synopsisReport.Point_Sheet_Status__c === 'Turned In'
            ? <div className="col-md-6">
                <span className="title">Game Eligibility Earned</span>
                <span className="name">{ this.calcPlayingTime() } </span>
            </div>
            : null }
          <div className="col-md-6">
            <span className={`title ${this.state.playingTimeGranted ? '' : 'required'}`} 
              htmlFor="Mentor_Granted_Playing_Time__c">
              Mentor Granted Playing Time { this.state.synopsisReport && this.state.synopsisReport.Point_Sheet_Status__c !== 'Turned In' ? '(Required)' : '' } :</span>
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
            && (this.state.synopsisReport.Point_Sheet_Status__c !== 'Turned In'
            || this.state.synopsisReport.Earned_Playing_Time__c !== this.state.synopsisReport.Mentor_Granted_Playing_Time__c)
            ? <div key="mentorGrantedPlayingTimeComments">
                <label className={`title ${this.state.commentsMade ? '' : 'required'}`} 
                  htmlFor="Mentor_Granted_Playing_Time_Explanation__c">Mentor Granted Playing Time Explanation:</label>
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
      // 'mentorGrantedPlayingTimeComments', // records[0].Mentor_Granted_Playing_Time_Explanation__c
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

    const isValidSynopsisReport = (
      this.props.synopsisReport
      && this.props.synopsisReport.PointTrackers__r
      && this.props.synopsisReport.PointTrackers__r.records
      && this.props.synopsisReport.PointTrackers__r.records[0].Class__r
      && this.props.synopsisReport.PointTrackers__r.records[0].Class__r.Teacher__r
      && this.props.synopsisReport.Student__r
    );
    // isValidSynopsisReport = () => {
    //   const sr = !!this.props.synopsisReport;
    //   const srpt = !!this.propslsynopsisReport.PointTrackers__r;
    //   const srptr = !!this.props.synopsisReport.PointTrackers__r.records;
    //   const srptr0c = !!this.props.synopsisReport.PointTrackers__r.records[0].Class__r;
    //   const srptr0ct = !! this.props.synopsisReport.PointTrackers__r.records[0].Class__r.Teacher__r;
    //   const srs = !!this.props.synopsisReport.Student__r;
    //   return sr && srpt && srptr && srptr0c && srptr0ct & srs;
    // };

    const synopsisReportForm = this.props.synopsisReport // || isValidSynopsisReport
      ? (
      <div className="points-tracker panel point-tracker-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title title">SYNOPSIS REPORT</h5>
              <button type="button" className="close" onClick={ this.props.buttonClick } data-dismiss="modal" aria-label="Close">
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
                { this.state.synopsisReport && this.state.synopsisReport.Point_Sheet_Status__c === 'Turned In'
                  ? <PointTrackerTable
                    handleSubjectChange={ this.handleSubjectChange }
                    synopsisReport={ this.state.synopsisReport }
                    // teachers={ this.props.content.studentData.teachers.filter(t => t.currentTeacher) }
                    // deleteSubject= { this.deleteSubject }
                    // createSubject={ this.createSubject }
                    // isElementaryStudent={this.state.isElementaryStudent}
                    myRole={this.props.myRole}
                    // saveSubjectTable={this.saveSubjectTable}
                  />
                  : null }
                { communicationPillarsTableJSX }
                { oneTeamJSX }
                { synopsisCommentsJSX }
                <div className="modal-footer">
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
      : null; // alert('Student does not have properly initialized data.');

    return (
      <div className="modal-backdrop">
        { this.state.synopsisSaved ? <SynopsisReportSummary synopsisReport={this.state.synopsisReport} onClose={ this.props.buttonClick }/> : synopsisReportForm }
        {/* { synopsisReportForm } */}
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
  buttonClick: PropTypes.func,
  content: PropTypes.object,
  myRole: PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportForm);
