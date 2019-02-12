import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getReportingPeriods } from '../../lib/utils';
import SynopsisReportTable from '../synopsis-report-table/synopsis-report-table';
import SynopsisReportSummary from '../synopsis-report-summary/synopsis-report-summary';
import TooltipItem from '../tooltip/tooltip';
import * as srActions from '../../actions/synopsis-report';

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

const names = {
  turnedIn: 'Point Sheet turned in and at least 25% complete: ',
  lost: 'Point Sheet Lost',
  incomplete: 'Point Sheet less than 25% completed',
  absent: 'Student Reported Absent',
  other: 'Other',
  mentorGrantedPlayingTimeComments: 'Mentor Granted Playing Time Explanation:',
  studentActionItems: 'Student Action Items:',
  sportsUpdate: 'Sports Update:',
  additionalComments: 'Additional Comments:',
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
  createSynopsisReportPdf: sr => dispatch(srActions.createSynopsisReportPdf(sr)),
});

class SynopsisReportForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.state.synopsisReport = this.props.synopsisReport;

    this.state.synopsisSaved = false;
  }

  componentDidUpdate = (prevProps) => {
    console.log('sr DidUpdate');
    // if (this.props.synopsisReportLink !== prevProps.synopsisReportLink) {
    if (this.props.synopsisReport !== prevProps.synopsisReport) {
      this.setState({
        ...this.state,
        synopsisSaved: true,
        waitingOnSaves: false,
        synopsisLink: this.props.synopsisReportLink,
      });
    }
    if (this.props.synopsisReport !== prevProps.synopsisReport) {
      this.setState({ ...this.state, synopsisReport: this.props.synopsisReport });
    }
  }

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

  componentDidMount = () => {
    console.log('componentDidMount');
    // const selectedStudent = this.props.content;
    // const { lastPointTracker } = selectedStudent.studentData;

    this.setState((prevState) => {
      let newState = { ...prevState };
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
    //   newState.synopsisSaved = false;
    //   newState.mentorGrantedPlayingTime = '';
    //   newState.synopsisComments.mentorGrantedPlayingTimeComments = '';
    //   newState.pointSheetStatusNotes = '';
    //   newState.pointSheetStatus.lost = false;
    //   newState.pointSheetStatus.incomplete = false;
    //   newState.pointSheetStatus.absent = false;
    //   newState.pointSheetStatus.other = false;
    //   newState.teachers = this.props.content.studentData.teachers;
      newState.playingTimeGranted = true;
      newState.commentsMade = true;
      newState.metWithMentee = true;
      newState.studentMissedMentor = true;
      newState.pointSheetStatusOK = true;
      return newState;
    });
  }

  handleTitleChange = (event) => {
    const newState = { ...this.state, synopsisSaved: false };
    newState.title = `${newState.studentName}: ${event.target.value}`;
    this.setState(newState);
  }

  handleSubjectChange = (event) => {
    event.persist();

    const validGrades = ['A', 'B', 'C', 'D', 'F', '', 'N', 'N/A'];

    const { name } = event.target;

    this.setState((prevState) => {
      const newState = { ...prevState };
      const [subjectName, categoryName] = name.split('-');

      const newSubjects = newState.subjects
        .map((subject) => {
          if (subject.subjectName === subjectName) {
            const newSubject = { ...subject };
            if (categoryName === 'grade') {
              newSubject.grade = validGrades.includes(event.target.value.toUpperCase()) ? event.target.value.toUpperCase() : '';
              if (newSubject.grade === 'N') newSubject.grade = 'N/A';
              if (subjectName.toLowerCase() === 'tutorial') newSubject.grade = 'N/A';
            } else if (categoryName === 'excusedDays') {
              newSubject.scoring.excusedDays = Math.min(Math.max(parseInt(event.target.value, 10), 0), 5);
            } else {
              const currentValue = parseInt(event.target.value, 10);
              // test currentValue for NaN which doesn't equal itself.
              if (currentValue !== currentValue) { // eslint-disable-line
                newSubject.scoring[categoryName] = '';
              } else {
                const maxStampsPossible = 20 - (newSubject.scoring.excusedDays * 4);
                const maxStampsAdjustment = categoryName === 'stamps'
                  ? newSubject.scoring.halfStamps
                  : newSubject.scoring.stamps;
                const maxValidStamps = maxStampsPossible - maxStampsAdjustment;
                newSubject.scoring[categoryName] = Math.floor(Math.min(Math.max(currentValue, 0), maxValidStamps));
              }
            }

            return newSubject;
          }
          return subject;
        });

      newState.subjects = newSubjects;
      return newState;
    });
  }

  // handleMentorMadeScheduledCheckinChange = (event) => {
  //   const newState = Object.assign({}, this.state);
  //   newState.mentorMadeScheduledCheckin = parseInt(event.target.value, 10);
  //   this.setState(newState);
  // }

  // handleStudentMissedScheduledCheckinChange = (event) => {
  //   const newState = Object.assign({}, this.state);
  //   newState.studentMissedScheduledCheckin = parseInt(event.target.value, 10);
  //   this.setState(newState);
  // }

  handleWeeklyCheckInChange = (event) => {
    const newState = { ...this.state };
    newState.synopsisReport.Weekly_Check_In_Status__c = event.target.value;
    this.setState(newState);
  }

  clearSRFields = (synopsisReport) => {
    synopsisReport.subjects.forEach((subject) => {
      Object.assign(subject.scoring, emptySR.subjects[0].scoring);
    });
    Object.assign(synopsisReport.synopsisComments, emptySR.synopsisComments);
    Object.assign(synopsisReport.communications, emptySR.communications);
    synopsisReport.oneTeamNotes = emptySR.oneTeamNotes;
  }

  handlePointSheetTurnedInChange = (event) => {
    const newState = Object.assign({}, this.state);
    newState.pointSheetStatus.turnedIn = event.target.value === 'true';
    if (!newState.pointSheetStatus.turnedIn) {
      const keys = Object.keys(newState.pointSheetStatus);
      keys.forEach((key) => {
        newState.pointSheetStatus[key] = false;
      });
      this.clearPtFields(newState);
    }
    this.setState(newState);
  }

  handlePointSheetStatusChange = (event) => {
    const { id } = event.target;
    this.setState((prevState) => {
      const newState = { ...prevState };
      const keys = Object.keys(newState.pointSheetStatus);
      keys.forEach((key) => {
        newState.pointSheetStatus[key] = false;
        if (key === id) newState.pointSheetStatus[key] = true;
      });
      return newState;
    });
  }

  handlePointSheetNotesChange = (event) => {
    this.setState({ pointSheetStatusNotes: event.target.value });
  }

  handleOneTeamChange = (event) => {
    const { name, checked } = event.target;

    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.synopsisReport[name] = checked;
      return newState;
    });
  }

  handleOneTeamNotesChange = (event) => {
    event.persist();
    console.log('notes:', event.target.name, event.target.value);
    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.synopsisReport.One_Team_Notes__c = event.target.value;
      return newState;
    });
  }

  handlePlayingTimeChange = (event) => {
    this.setState({ ...this.state, mentorGrantedPlayingTime: event.target.value });
  }

  handleSynopsisCommentChange = (event) => {
    const { name, value } = event.target;

    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.synopsisComments[name] = value;
      return newState;
    });
  }

  validPlayingTime = (pointTracker) => {
    const playingTimeGranted = pointTracker.pointSheetStatus.turnedIn || !!pointTracker.mentorGrantedPlayingTime;
    const commentsRequired = pointTracker.playingTimeOnly
      || !pointTracker.pointSheetStatus.turnedIn
      || (!!pointTracker.mentorGrantedPlayingTime && pointTracker.mentorGrantedPlayingTime !== pointTracker.earnedPlayingTime);
    const commentsMade = !!pointTracker.synopsisComments.mentorGrantedPlayingTimeComments || !commentsRequired;
    const metWithMentee = pointTracker.mentorMadeScheduledCheckin !== -1;
    const studentMissedMentor = pointTracker.mentorMadeScheduledCheckin === 1 || (pointTracker.mentorMadeScheduledCheckin === 0 && pointTracker.studentMissedScheduledCheckin !== -1);
    const pointSheetStatusOK = pointTracker.pointSheetStatus.turnedIn
      || (!pointTracker.pointSheetStatus.turnedIn
        && (pointTracker.pointSheetStatus.lost
          || pointTracker.pointSheetStatus.incomplete
          || pointTracker.pointSheetStatus.absent
          || (pointTracker.pointSheetStatus.other && !!pointTracker.pointSheetStatusNotes)));

    this.setState({
      playingTimeGranted,
      commentsMade,
      metWithMentee,
      studentMissedMentor,
      pointSheetStatusOK,
    });

    return playingTimeGranted && commentsMade && metWithMentee && studentMissedMentor && pointSheetStatusOK;
  }

  validScores = (pointTracker) => {
    if (!pointTracker.pointSheetStatus.turnedIn) return false;

    const goodSubjectStamps = pointTracker.subjects.every(subject => (
      subject.scoring.stamps + subject.scoring.halfStamps <= 20 - subject.scoring.excusedDays * 4 
    ));
    const school = pointTracker.student.studentData.school.find(s => s.currentSchool);
    const isElementaryStudent = school ? school.isElementarySchool : false;
    const goodSubjectGrades = isElementaryStudent
      || pointTracker.subjects.every(subject => subject.grade !== '');
    return goodSubjectStamps && goodSubjectGrades;
  }

  handleFullReportSubmit = (event) => {
    event.preventDefault();
    const { synopsisReport } = this.state;
    synopsisReport.Playing_Time_Only__c = false;
    // const valid = this.validPlayingTime(synopsisReport);
    if (true) { // valid && (synopsisReport.pointSheetStatus.turnedIn ? this.validScores(synopsisReport) : true)) {
      // delete synopsisReport._id;

      this.setState({ ...this.state, waitingOnSaves: true });
      this.props.saveSynopsisReport({ ...synopsisReport });
      // this.props.createSynopsisReportPdf({ ...synopsisReport });

      this.setState({ synopsisReport: null });
    } else {
      alert('Please provide required information before submitting full report.'); // eslint-disable-line
    }
  }

  handlePlayingTimeSubmit = (event) => {
    event.preventDefault();
    const pointTracker = this.state;
    pointTracker.playingTimeOnly = true;
    if (this.validPlayingTime(pointTracker)) {
      delete pointTracker._id;
      this.setState({ ...this.state, waitingOnSaves: true });
      this.props.createPointTracker({ ...pointTracker });
      this.props.createSynopsisReport(pointTracker);
      this.setState({ pointTracker: emptyPointTracker });
    } else {
      alert('Please provide required information before submitting playing time.'); // eslint-disable-line
    }
  }

  deleteSubject = (subjectName, teacherId) => {
    this.setState((prevState) => {
      const newState = { ...prevState };

      newState.subjects = newState.subjects.filter((subject) => {
        if (subjectName && teacherId) {
          return subject.subjectName !== subjectName && subject.teacher !== teacherId;
        }
        return subject.subjectName !== subjectName;
      });

      return newState;
    });
  }

  createSubject = (subjectName, teacherId) => {
    this.setState((prevState) => {
      const newState = { ...prevState };
      const newSubject = {
        subjectName,
        teacher: this.state.teachers.find(t => t.teacher._id.toString() === teacherId.toString()).teacher,
        scoring: {
          excusedDays: '',
          stamps: '',
          halfStamps: '',
        },
        grade: '',
      };

      newState.subjects.push(newSubject);

      return newState;
    });
  }

  saveSubjectTable = () => {
    const pointTracker = { ...this.state };
    delete pointTracker._id;
    this.props.createPointTracker({ ...pointTracker });
  }

  calcPlayingTime = () => {
    if (!this.state.student) return null;

    const { subjects } = this.state;
    const { student } = this.state;

    let isElementarySchool = null;
    if (student.studentData.school.length > 0) {
      isElementarySchool = student.studentData.school.filter(s => s.currentSchool)[0].isElementarySchool; // eslint-disable-line
    }

    const numberOfPeriods = subjects.length;
    const totalClassTokens = numberOfPeriods * 2;
    const totalTutorialTokens = isElementarySchool ? 0 : 4;
    const totalGradeTokens = isElementarySchool ? 0 : numberOfPeriods;
    const totalTokensPossible = totalClassTokens + totalGradeTokens + totalTutorialTokens;

    const totalEarnedTokens = subjects.map((subject) => {
      const { grade, subjectName } = subject;
      // halfStamps are "X"s from the scoring sheet
      const { excusedDays, stamps, halfStamps } = subject.scoring;

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
    if (earnedPlayingTime !== this.state.earnedPlayingTime) {
      this.setState({
        ...this.state,
        earnedPlayingTime,
      });
    }

    return earnedPlayingTime;
  }

  handleCommCheckboxChange = (event) => {
    const { name, checked } = event.target;
    const [role, row, columnKey] = name.split('-'); // eslint-disable-line

    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.communications[row][columnKey] = checked;
      return newState;
    });
  }

  commCheckbox = (com, row, col) => {
    const columnKeys = [
      'faceToFace',
      'digital',
      'phone',
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

  render() {
    const reportingPeriods = getReportingPeriods();

    const selectOptionsJSX = (
      <div className="row">
        <div className="col-md-6">
          <span className="title">Student</span>
          <span className="name">{ this.state.synopsisReport && this.state.synopsisReport.Student__r.Name }</span>
        </div>
        <div className="col-md-6">
          <h3 className="title">{`Reporting Period: ${this.state.synopsisReport && this.state.synopsisReport.Week__c}`}</h3>
        </div>
      </div>
    );

    // records[0].Weekly_Check_In_Status__c : Met, Mentor missed check in, Student missed check in
    const mentorMadeScheduledCheckinJSX = (
      <React.Fragment>
      <div className="mentor-met-container" key='mentorMadeCheckin'>
        <label className={this.state.metWithMentee ? '' : 'required'} htmlFor="made-meeting">Weekly Check-in Status: </label>
          <select name="made-meeting" 
            value={this.state.synopsisReport && this.state.synopsisReport.Weekly_Check_In_Status__c}
            required
            onChange={ this.handleWeeklyCheckInChange}>
            <option key="0" value="">--Select Checking Status--</option>
            <option key="1" value="Met">Met</option>
            <option key="2" value="Mentor missed check in">Mentor missed check in</option>
            <option key="3" value="Student missed check in">Student missed check in</option>
            <option key="4" value="School closed">School closed</option>
          </select>
      </div>
      </React.Fragment>
    );

    /*
    oneTeam: {
    wednesdayCheckin: false, // records[0].Wednesday_Check_In__c
    mentorMeal: false, // records[0].Mentor_Meal__c
    sportsGame: false, // records[0].Sports_Game__c
    communityEvent: false, // records[0].Community_event__c
    iepSummerReview: false, // records[0].IEP_Summer_Review_Meeting__c
    other: false, // records[0].Other_Meetup__c
    },
    */
    

    const oneTeamJSX = (
      <fieldset>
        <div className="survey-questions">
        <span className="title">One Team Face-to-Face Meet-Ups</span>
        {oneTeam.map((keyName, i) => (
          <div className="survey-question-container" key={ i }>
            <input
              type="checkbox"
              name={ names[keyName].prop} // oneTeamQuestion }
              onChange= { this.handleOneTeamChange }
              checked={ this.state.synopsisReport && this.state.synopsisReport[names[keyName].prop] }/>
            <label htmlFor={ names[keyName].prop }>{ names[keyName].text }</label>
          </div>
        ))
        }
          <div className="survey-question-container">
            <span className="title" htmlFor="oneTeamNotes">One Team Notes</span>
                <textarea
                  name="oneTeamNotes"
                  onChange={ this.handleOneTeamNotesChange }
                  value={ this.state.synopsisReport && this.state.synopsisReport.One_Team_Notes__c }
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

    // const pointSheetStatusJSX = (
    //   <fieldset>
    //     <div className="survey-questions">
    //     <span className={`title ${this.state.pointSheetStatusOK ? '' : 'required'}`}>Point Sheet Status</span>
    //       {Object.keys(this.state.pointSheetStatus)
    //         .filter(keyName => names[keyName])
    //         .map((statusQuestion, i) => {
    //           if (statusQuestion === 'turnedIn') {
    //             return (
    //               <div className="survey-question-container" key={ i }>
    //                 <label htmlFor="turned-in">{ names[statusQuestion] }</label>
    //                   <input
    //                     type="radio"
    //                     name="turned-in"
    //                     value="true"
    //                     className="inline"
    //                     checked={this.state.pointSheetStatus.turnedIn ? 'checked' : ''}
    //                     onChange={this.handlePointSheetTurnedInChange}/> Yes
    //                   <input
    //                     type="radio"
    //                     name="turned-in"
    //                     value="false"
    //                     className="inline"
    //                     checked={!this.state.pointSheetStatus.turnedIn ? 'checked' : ''}
    //                     onChange={this.handlePointSheetTurnedInChange}/> No
    //                 {/* </label> */}
    //               </div>
    //             );
    //           }

    //           return (!this.state.pointSheetStatus.turnedIn
    //             ? <div className="survey-question-container" key={ i }>
    //               <input
    //                 type="radio"
    //                 id={ statusQuestion }
    //                 name="pointSheetStatus"
    //                 required={!this.state.pointSheetStatus.turnedIn}
    //                 onChange= { this.handlePointSheetStatusChange }
    //                 checked={ this.state.pointSheetStatus.statusQuestion }/>{ names[statusQuestion] }
    //             </div>
    //             : null
    //           );
    //         })
    //         }
    //         { !this.state.pointSheetStatus.turnedIn
    //           ? <div className="survey-question-container">
    //             <span className={`title ${this.state.pointSheetStatusOK || !this.state.pointSheetStatus.other || (this.state.pointSheetStatus.other && !!this.state.pointSheetStatusNotes) ? '' : 'required'}`} htmlFor="pointSheetStatusNotes">Point Sheet Status Notes</span>
    //                 <textarea
    //                   name="pointSheetStatusNotes"
    //                   placeholder={this.state.pointSheetStatus.other ? 'Please explain selected status...' : ''}
    //                   onChange={ this.handlePointSheetNotesChange }
    //                   value={ this.state.pointSheetStatusNotes }
    //                   required={this.state.pointSheetStatus.other}
    //                   rows="2"
    //                   cols="80"
    //                   wrap="hard"
    //                 />
    //           </div>
    //           : '' }
    //     </div>
    // </fieldset>
    // );

    // const communicationPillarsTableJSX = (
    //   <fieldset>
    //     <span className="title">Communication Touch Points</span>
    //     <div className="survey-questions">
    //       <table className="table">
    //         <thead>
    //           <tr>
    //             <th>RA Core Pillar</th>
    //             <th>
    //               Face-To-Face
    //               <TooltipItem id={'tooltip-corepillar'} text={'In person communication'}/>
    //             </th>
    //             <th>
    //               Digital
    //               <TooltipItem id={'tooltip-corepillar'} text={'Communication through basecamp, text msg, email, etc.'}/>
    //             </th>
    //             <th>
    //               Phone Call
    //               <TooltipItem id={'tooltip-corepillar'} text={'Digital communication through voice or video'}/>
    //             </th>
    //             <th>Other</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           {this.state.communications.map((com, i) => (
    //             <React.Fragment key={`${com.role}${i}7`}>
    //             <tr key={`${com.role}${i}8`}>
    //               <td key={`${com.role}${i}0`}>{com.with}</td>
    //               <td key={`${com.role}${i}1`}>{this.commCheckbox(com, i, 0)}</td>
    //               <td key={`${com.role}${i}2`}>{this.commCheckbox(com, i, 1)}</td>
    //               <td key={`${com.role}${i}3`}>{this.commCheckbox(com, i, 2)}</td>
    //               <td key={`${com.role}${i}4`}>{this.commCheckbox(com, i, 3)}</td>
    //             </tr>
    //             {com.other
    //               ? <tr key={`${com.role}${i}5`}>
    //                 <td>Notes:</td>
    //                 <td colSpan="4" key={`${com.role}${i}6`}>{this.commNotes(com, i)}</td>
    //               </tr>
    //               : null}
    //             </React.Fragment>
    //           ))}
    //         </tbody>
    //       </table>
    //     </div>
    //   </fieldset>
    // );

    // // add back in calc playing time calc below
    // const playingTimeJSX = (
    //   <React.Fragment>
    //     <div className="row">
    //       { this.state.pointSheetStatus.turnedIn
    //         ? <div className="col-md-6">
    //             <span className="title">Game Eligibility Earned</span>
    //             <span className="name">{ this.calcPlayingTime() } </span>
    //         </div>
    //         : null }
    //       <div className="col-md-6">
    //         <span className={`title ${this.state.playingTimeGranted ? '' : 'required'}`} htmlFor="mentorGrantedPlayingTime">
    //           Mentor Granted Playing Time { !this.state.pointSheetStatus.turnedIn ? '(Required)' : '' } :</span>
    //         <select
    //           name="mentorGrantedPlayingTime"
    //           onChange={ this.handlePlayingTimeChange }
    //           value={ this.state.mentorGrantedPlayingTime }
    //           >
    //           <option value="" defaultValue>Select playing time override:</option>
    //           <option value="Entire Game">Entire Game</option>
    //           <option value="All but Start">All but Start</option>
    //           <option value="Three Quarters">Three Quarters</option>
    //           <option value="Two Quarters">Two Quarters</option>
    //           <option value="One Quarter">One Quarter</option>
    //           <option value="None of Game">None of Game</option>
    //         </select>
    //       </div>
    //     </div>
    //   </React.Fragment>
    // );

    // const mentorGrantedPlayingTimeCommentsJSX = (
    //   <div className="synopsis">
    //     {
    //       (!this.state.pointSheetStatus.turnedIn
    //         || this.state.playingTimeOnly
    //         || (this.state.mentorGrantedPlayingTime !== '' 
    //         && this.state.mentorGrantedPlayingTime !== this.state.earnedPlayingTime))
    //         ? <div key="mentorGrantedPlayingTimeComments">
    //             <label className={`title ${this.state.commentsMade ? '' : 'required'}`} htmlFor="mentorGrantedPlayingTimeComments">Mentor Granted Playing Time Explanation (Required):</label>
    //             <textarea
    //               name="mentorGrantedPlayingTimeComments"
    //               onChange={ this.handleSynopsisCommentChange }
    //               value={ this.state.synopsisComments.mentorGrantedPlayingTimeComments }
    //               rows="2"
    //               cols="80"
    //               wrap="hard"
    //             />
    //           </div>
    //         : null
    //     }
    //   </div>
    // );

    // const submitPlayingTimeOnlyButtonJSX = (
    //   <div className="synopsis">
    //     { this.state.waitingOnSaves 
    //       ? <FontAwesomeIcon icon="spinner" className="fa-spin fa-2x"/> 
    //       : <React.Fragment>
    //           <button type="submit" onClick={ this.handlePlayingTimeSubmit } className="btn btn-secondary" id="playing-time-only">Submit Playing Time Only</button>
    //           <p>Please plan to complete the rest of the report by Sunday evening and post Summary to Basecamp. </p> 
    //         </React.Fragment> }
    //   </div>
    // );

    // const synopsisCommentsJSX = (
    //   <div className="synopsis">
    //     {
    //       Object.keys(this.state.synopsisComments)
    //         .filter(keyName => names[keyName] && keyName !== 'mentorGrantedPlayingTimeComments')
    //         .map((synopsisComment, i) => {
    //           return (
    //             <div key={ i }>
    //               <label className="title" htmlFor={ synopsisComment }>{ names[synopsisComment] }</label>
    //               <textarea
    //                 name={ synopsisComment }
    //                 onChange={ this.handleSynopsisCommentChange }
    //                 value={ this.state.synopsisComments[synopsisComment] }
    //                 rows="6"
    //                 cols="80"
    //                 wrap="hard"
    //               />
    //             </div>
    //           );
    //         })
    //     }
    //   </div>
    // );

    const synopsisReportForm = this.props.synopsisReport
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
                { selectOptionsJSX }
                { mentorMadeScheduledCheckinJSX }
                {/* { pointSheetStatusJSX }
                { playingTimeJSX }
                { mentorGrantedPlayingTimeCommentsJSX }
                { submitPlayingTimeOnlyButtonJSX }
                { this.state.pointSheetStatus.turnedIn
                  ? <PointTrackerTable
                    handleSubjectChange={ this.handleSubjectChange }
                    subjects={ this.state.subjects }
                    teachers={ this.props.content.studentData.teachers.filter(t => t.currentTeacher) }
                    deleteSubject= { this.deleteSubject }
                    createSubject={ this.createSubject }
                    isElementaryStudent={this.state.isElementaryStudent}
                    myRole={this.props.myRole}
                    saveSubjectTable={this.saveSubjectTable}
                  />
                  : null }
                { communicationPillarsTableJSX } */}
                { oneTeamJSX }

                {/* { synopsisCommentsJSX } */}
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
      : null;

    return (
      <div className="modal-backdrop">
        { this.state.synopsisSaved ? <SynopsisReportSummary synopsisReport={this.state} onClose={ this.props.buttonClick }/> : synopsisReportForm }
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
