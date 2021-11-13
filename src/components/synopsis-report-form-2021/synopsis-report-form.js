import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SynopsisReportSummary from '../synopsis-report-summary/synopsis-report-summary';
// import TooltipItem from '../tooltip/tooltip';
import DropDown from '../drop-down/drop-down';
import TextArea from '../text-area/text-area';
import ImagePreviews from '../image-previews/image-previews';
// import ImageButton from '../image-button/image-button';
// import * as ttText from '../../lib/tooltip-text';
import * as srActions from '../../actions/synopsis-report';
// import * as srPdfActions from '../../actions/synopsis-report-pdf';
import * as msgBoardUrlActions from '../../actions/message-board-url';
import * as errorActions from '../../actions/error';
import * as imageActions from '../../actions/images';

import './_synopsis-report-form.scss';

const mapStateToProps = state => ({
  // synopsisReportLink: state.synopsisReportLink,
  synopsisReport: state.synopsisReport && state.synopsisReport.records && state.synopsisReport.records[0],
  myRole: state.myProfile.role,
  messageBoardUrl: state.messageBoardUrl,
  error: state.error,
  bcImages: state.bcImages,
  imagePreviews: state.imagePreviews,
});

const mapDispatchToProps = dispatch => ({
  saveSynopsisReport: synopsisReport => dispatch(srActions.saveSynopsisReport(synopsisReport)),
  // createSynopsisReportPdf: (student, sr) => dispatch(srPdfActions.createSynopsisReportPdf(student, sr)),
  // setSynopsisReportLink: link => dispatch(srPdfActions.setSynopsisReportLink(link)),
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
    this.state.waitingOnImages = false;
    this.state.imagesSaved = false;
    this.state.savedToSalesforce = false;
    this.state.waitingOnSalesforce = false;
    // this.state.savedToGoogleDrive = false;
    // this.state.waitingOnGoogleDrive = false;
    this.state.imageUploading = false;
    this.props.clearMsgBoardUrl();
  }

  componentDidMount = () => {
    this.props.clearImages();
    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.synopsisSaved = false;
      newState.metWithMentee = true;
      newState.commStatusMetOK = true;
      newState.commStatusDidNotMeetOK = true;
      newState.commMethodNoCheckinOK = true;
      newState.howSupportRequiredOK = true;
      newState.commNoResponseOK = true;
      newState.metWithFamilyOK = true;
      newState.metWithTeacherOK = true;
      newState.metWithCoachOK = true;
      newState.identityStatusOK = true;
      newState.identityPromptOK = true;
      newState.pointSheetStatusOK = true;
      newState.msSelfReflectionOK = true;
      newState.esSelfReflectionOK = true;
      newState.msTeacherConvoOK = true;
      newState.esTeacherConvoOK = true;
      newState.pointSheetMissedReasonOK = true;
      newState.pointSheetStatusNotesOK = true;
      newState.psAndSchoolUpdateOK = true;
      newState.sportsUpdateOK = true;
      newState.mentorSupportRequestOK = true;
      newState.mentorSupportRequestNotesOK = true;
      return newState;
    });
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.error !== prevProps.error) {
      if (this.state.waitingOnImages) {
        this.props.clearError();
        const { synopsisReport } = this.state;
        this.setState({
          waitingOnImages: false,
          imagesSaved: true,
          waitingOnSalesforce: true,
        });
        this.props.saveSynopsisReport({ ...synopsisReport });
      }
      if (this.state.waitingOnSalesforce) {
        // && (this.state.synopsisReport 
        // && !pl.playingTimeOnly(this.state.synopsisReport.Synopsis_Report_Status__c))) {
        this.props.clearError();
        // const { synopsisReport } = this.state;
        this.setState({
          waitingOnSalesforce: false,
          savedToSalesforce: true,
          // waitingOnGoogleDrive: true,
          // savedToGoogleDrive: false,
        });
        // this.props.createSynopsisReportPdf(this.props.content, { ...synopsisReport });
      }
      // if (this.state.waitingOnGoogleDrive) {
      //   // && (this.state.synopsisReport
      //   // && pl.playingTimeOnly(this.state.synopsisReport.Synopsis_Report_Status__c))) {
      //   this.props.clearError();
      //   this.setState({
      //     waitingOnSalesforce: false,
      //     savedToSalesforce: true,
      //     waitingOnGoogleDrive: false,
      //     savedToGoogleDrive: true,
      //   });
      // }
    }
    // if (this.props.synopsisReportLink !== prevProps.synopsisReportLink) {
    //   this.setState({
    //     savedToGoogleDrive: true,
    //     waitingOnGoogleDrive: false,
    //     synopsisLink: this.props.synopsisReportLink,
    //   });
    //   this.props.clearError();
    // }
    if (this.props.synopsisReport !== prevProps.synopsisReport) {
      this.props.clearError();
      this.setState({ 
        synopsisReport: { ...this.props.synopsisReport },
        studentGrade: this.props.synopsisReport.Student__r.Student_Grade__c,
      });
      this.props.clearError();
      this.props.getMsgBoardUrl(this.props.synopsisReport.Student__r.Email);
    }
    // const earnedPlayingTime = this.props.synopsisReport && this.props.synopsisReport.summer_SR ? '' : pt.calcPlayingTime(this.state.synopsisReport);
    // if (this.state.synopsisReport && earnedPlayingTime !== this.state.synopsisReport.Earned_Playing_Time__c) {
    //   this.setState({
    //     synopsisReport: { ...this.state.synopsisReport, Earned_Playing_Time__c: earnedPlayingTime },
    //   });
    // }
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

  srSafe = (prop) => {
    return this.state.synopsisReport && this.state.synopsisReport[prop]; // Object.keys(this.state.synopsisReport).includes(prop);
  }

  validMentorInput = (sr) => {
    const metWithMentee = !!sr.Weekly_Check_In_Status__c;
    const commStatusMetOK = sr.Weekly_Check_In_Status__c === 'Met'
      && !!sr.Communication_Status_Met__c;
    const commStatusDidNotMeetOK = (sr.Weekly_Check_In_Status__c === 'Did not meet'
      && !!sr.Did_not_meet_communication__c)
      || commStatusMetOK; 
    const commMethodNoCheckinOK = (sr.Did_not_meet_communication__c === 'I communicated with the student and/or family but we weren’t able to have a check in'
      && !!sr.Communication_Method_No_Check_In__c)
      || commStatusMetOK;
    const commNoResponseOK = (sr.Communication_Method_No_Check_In__c === 'I tried reaching out to student and family and did not hear back, and then I reached out to RA Staff'
      && !!sr.Communication_Method_No_Response__c)
      || commStatusMetOK;
    const howSupportRequiredOK = (sr.Weekly_Check_In_Status__c === 'Did not meet'
      && sr.Communication_Method_No_Check_In__c === 'I did not connect with student and/or family for other reasons explained below'
      && !!sr.How_can_we_support_required__c)
      || commStatusMetOK;
    const metWithFamilyOK = !!sr.Family_Connection__c;
    const metWithTeacherOK = !!sr.Teacher_Connection__c;
    const metWithCoachOK = !!sr.Coach_Connection__c;
    const identityStatusOK = !!sr.Identity_Statement_Weekly_Status__c;
    const identityPromptOK = !!sr.Identity_Statement_Prompts__c;
    const pointSheetStatusOK = !!sr.Point_Sheet_Status__c;
    const msSelfReflectionOK = (this.state.studentGrade > 5
      && !!sr.Point_Sheet_MS_Self_Reflection__c)
      || this.state.studentGrade <= 5;
    const esSelfReflectionOK = (this.state.studentGrade <= 5
      && !!sr.Point_Sheet_ES_Self_Reflection__c)
      || this.state.studentGrade > 5;
    const msTeacherConvoOK = (this.state.studentGrade > 5
      && sr.Point_Sheet_Status__c === 'Turned in'
      && !!sr.Point_Sheet_Teacher_Convo_MS__c) 
      || sr.Point_Sheet_Status__c === 'Not turned in'
      || this.state.studentGrade <= 5;
    const esTeacherConvoOK = (this.state.studentGrade <= 5
      && sr.Point_Sheet_Status__c === 'Turned in'
      && !!sr.Point_Sheet_Teacher_Convo_ES__c) 
      || sr.Point_Sheet_Status__c === 'Not turned in'
      || this.state.studentGrade > 5;
    const pointSheetMissedReasonOK = (sr.Point_Sheet_Status__c === 'Not turned in'
      && !!sr.No_Point_Sheet__c) || sr.Point_Sheet_Status__c === 'Turned in';
    const pointSheetStatusNotesOK = (sr.Point_Sheet_Status__c === 'Not turned in'
      && sr.No_Point_Sheet__c !== 'Other'
      && !!sr.No_Point_Sheet_What_Happened__c) || sr.Point_Sheet_Status__c === 'Turned in';
    const psAndSchoolUpdateOK = !!sr.Point_Sheet_and_School_Update__c;
    const sportsUpdateOK = !!sr.Weekly_Sports_Update__c;
    const mentorSupportRequestOK = !!sr.Mentor_Support_Request__c;
    const mentorSupportRequestNotesOK = (sr.Mentor_Support_Request__c !== 'No'
      && !!sr.Mentor_Support_Request_Notes__c) || sr.Mentor_Support_Request__c === 'No';

    this.setState({
      metWithMentee,
      commStatusMetOK,
      commStatusDidNotMeetOK,
      commMethodNoCheckinOK,
      howSupportRequiredOK,
      commNoResponseOK,
      metWithFamilyOK,
      metWithTeacherOK,
      metWithCoachOK,
      identityStatusOK,
      identityPromptOK,
      pointSheetStatusOK,
      msSelfReflectionOK,
      esSelfReflectionOK,
      msTeacherConvoOK,
      esTeacherConvoOK,
      pointSheetMissedReasonOK,
      pointSheetStatusNotesOK,
      psAndSchoolUpdateOK,
      sportsUpdateOK,
      mentorSupportRequestOK,
      mentorSupportRequestNotesOK,
    });

    return metWithMentee 
      && commStatusMetOK 
      && commStatusDidNotMeetOK
      && commMethodNoCheckinOK
      && howSupportRequiredOK
      && commNoResponseOK
      && metWithFamilyOK
      && metWithTeacherOK
      && metWithCoachOK
      && identityStatusOK
      && identityPromptOK
      && pointSheetStatusOK
      && msSelfReflectionOK
      && esSelfReflectionOK
      && msTeacherConvoOK
      && esTeacherConvoOK
      && pointSheetMissedReasonOK
      && pointSheetStatusNotesOK
      && psAndSchoolUpdateOK
      && sportsUpdateOK
      && mentorSupportRequestOK
      && mentorSupportRequestNotesOK;
  }

  handleFullReportSubmit = (event) => {
    event.preventDefault();
    const { synopsisReport } = this.state;
    const validMentorInput = this.validMentorInput(synopsisReport);
    console.log('valid input?', validMentorInput);
    this.props.clearError();

    if (validMentorInput) {
      synopsisReport.Synopsis_Report_Status__c = 'Completed';
      if (this.props.imagePreviews) {   
        this.setState({ waitingOnImages: true });
        this.props.uploadImages(this.props.imagePreviews.map(preview => (preview.file))); // justs end file objects
      } else {
        this.setState({ waitingOnSalesforce: true });
        this.props.saveSynopsisReport({ ...synopsisReport });
      }
    } else {
      alert('Please provide required information before submitting full report.'); // eslint-disable-line
    }
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
    const headerJSX = (
      <div className="row">
        <div className="col-md-6">
          <span className="title">Student</span>
          <span className="name">{ this.state.synopsisReport && this.state.synopsisReport.Student__r.Name }</span>
        </div>
        <div className="col-md-6">
          <span className="title">Reporting Period</span>
          <span className="name">{`${this.state.synopsisReport && this.state.synopsisReport.Week__c}`}</span>
        </div>
        <div className="title">
          <h5>WEEKLY CHECK IN AND COMMUNICATION</h5>
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
          value={ this.srSafe('Weekly_Check_In_Status__c') ? this.state.synopsisReport.Weekly_Check_In_Status__c : undefined}
          onChange={ this.handleSimpleFieldChange}
          options={
            [
              { value: undefined, label: 'Did you meet with your student?' },
              { value: 'Met', label: 'Met' },
              { value: 'Did not meet', label: 'Did not meet' },
            ]
          }/>
          { this.state.synopsisReport && !!this.state.synopsisReport.Weekly_Check_In_Status__c 
            && this.state.synopsisReport.Weekly_Check_In_Status__c === 'Met' 
            ? <div className="survey-question-container">
                <DropDown
                  compClass={this.state.commStatusMetOK ? 'title' : 'title required'}
                  compName="Communication_Status_Met__c"
                  label="Great! What did you do to make this happen?"
                  value={ this.srSafe('Communication_Status_Met__c') ? this.state.synopsisReport.Communication_Status_Met__c : undefined }
                  onChange={ this.handleSimpleFieldChange }
                  options={
                    [
                      { value: undefined, label: '-- Select an action --' },
                      { value: 'I reached out to family (Basecamp, Phone/Text)', label: 'I reached out to family (Basecamp, Phone/Text)' },
                      { value: 'I reached out to student (Basecamp, Teams, Phone/Text)', label: 'I reached out to student (Basecamp, Teams, Phone/Text)' },
                      { value: 'I reached out to student and family (Basecamp, Teams, Phone/Text)', label: 'I reached out to student and family (Basecamp, Teams, Phone/Text)' },
                      { value: 'I tried reaching out to student and family and did not hear back, and then I reached out to RA Staff', label: 'I tried reaching out to student and family and did not hear back, and then I reached out to RA Staff' },
                      { value: 'I didn’t have any additional reach outs beyond RA staff reminders to student and family', label: 'I didn’t have any additional reach outs beyond RA staff reminders to student and family' },
                    ]
                  }
                />
              </div>
            : '' }
          { this.state.synopsisReport && !!this.state.synopsisReport.Weekly_Check_In_Status__c 
            && this.state.synopsisReport.Weekly_Check_In_Status__c === 'Did not meet' 
            ? <div className="survey-question-container">
                <DropDown
                  compClass={this.state.commStatusDidNotMeetOK ? 'title' : 'title required'}
                  compName="Did_not_meet_communication__c"
                  label="Communication status:"
                  value={ this.srSafe('Did_not_meet_communication__c') ? this.state.synopsisReport.Did_not_meet_communication__c : undefined }
                  onChange={ this.handleSimpleFieldChange }
                  options={
                    [
                      { value: undefined, label: '-- Select an action --' },
                      { value: 'I communicated with the student and/or family but we weren’t able to have a check in', label: 'I communicated with the student and/or family but we weren’t able to have a check in' },
                      { value: 'I did not communicate with the student and/or family because I reached out and did not hear back', label: 'I did not communicate with the student and/or family because I reached out and did not hear back' },
                    ]
                  }
                />
              </div>
            : '' }
          { this.state.synopsisReport && !!this.state.synopsisReport.Did_not_meet_communication__c 
            && this.state.synopsisReport.Did_not_meet_communication__c === 'I communicated with the student and/or family but we weren’t able to have a check in' 
            && this.state.synopsisReport.Weekly_Check_In_Status__c !== 'Met'
            ? <div className="survey-question-container">
                <DropDown
                  compClass={this.state.commMethodNoCheckinOK ? 'title' : 'title required'}
                  compName="Communication_Method_No_Check_In__c"
                  label="How did you communicate this week?"
                  value={ this.srSafe('Communication_Method_No_Check_In__c') ? this.state.synopsisReport.Communication_Method_No_Check_In__c : undefined }
                  onChange={ this.handleSimpleFieldChange }
                  options={
                    [
                      { value: undefined, label: '-- Select an action --' },
                      { value: 'I reached out to family (Basecamp, Phone/Text)', label: 'I reached out to family (Basecamp, Phone/Text)' },
                      { value: 'I reached out to student (Basecamp, Teams, Phone/Text)', label: 'I reached out to student (Basecamp, Teams, Phone/Text)' },
                      { value: 'I reached out to student and family (Basecamp, Teams, Phone/Text)', label: 'I reached out to student and family (Basecamp, Teams, Phone/Text)' },
                      { value: 'I tried reaching out to student and family and did not hear back, and then I reached out to RA Staff', label: 'I tried reaching out to student and family and did not hear back, and then I reached out to RA Staff' },
                      { value: 'I did not connect with student and/or family for other reasons explained below', label: 'I did not connect with student and/or family for other reasons explained below' },
                    ]
                  }
                />
              </div>
            : '' }
          { this.state.synopsisReport && !!this.state.synopsisReport.Communication_Method_No_Check_In__c 
            && this.state.synopsisReport.Communication_Method_No_Check_In__c === 'I did not connect with student and/or family for other reasons explained below' 
            && this.state.synopsisReport.Weekly_Check_In_Status__c !== 'Met'
            ? <div className="survey-question-container"> 
            <TextArea
              compClass={ this.state.howSupportRequiredOK ? 'title' : 'title required' }
              compName="How_can_we_support_required__c"
              label="Please provide any additional context to RA staff in order to help inform how we can best support"
              value={ this.srSafe('How_can_we_support_required__c') ? this.state.synopsisReport.How_can_we_support_required__c : undefined }
              onChange={ this.handleTextAreaChange }
              required={ !this.state.howSupportRequiredOK }
            />
            </div>
            : '' }
          { this.state.synopsisReport && !!this.state.synopsisReport.Communication_Method_No_Check_In__c 
            && this.state.synopsisReport.Communication_Method_No_Check_In__c === 'I tried reaching out to student and family and did not hear back, and then I reached out to RA Staff' 
            && this.state.synopsisReport.Weekly_Check_In_Status__c !== 'Met'
            ? <div className="survey-question-container">
                <DropDown
                  compClass={this.state.commNoResponseOK ? 'title' : 'title required'}
                  compName="Communication_Method_No_Response__c"
                  label="What action did you take when you got no response?"
                  value={ this.srSafe('Communication_Method_No_Response__c') ? this.state.synopsisReport.Communication_Method_No_Response__c : undefined }
                  onChange={ this.handleSimpleFieldChange }
                  options={
                    [
                      { value: undefined, label: '-- Select an action --' },
                      { value: 'I reached out to family (Basecamp, Phone/Text)', label: 'I reached out to family (Basecamp, Phone/Text)' },
                      { value: 'I reached out to student (Basecamp, Teams, Phone/Text)', label: 'I reached out to student (Basecamp, Teams, Phone/Text)' },
                      { value: 'I reached out to student and family (Basecamp, Teams, Phone/Text)', label: 'I reached out to student and family (Basecamp, Teams, Phone/Text)' },
                      { value: 'I tried reaching out to student and family and did not hear back, and then I reached out to RA Staff', label: 'I tried reaching out to student and family and did not hear back, and then I reached out to RA Staff' },
                      { value: 'I did not connect with student and/or family for other reasons explained below', label: 'I did not connect with student and/or family for other reasons explained below' },
                    ]
                  }
                />
            </div>
            : '' }
            { this.state.synopsisReport && !!this.state.synopsisReport.Communication_Method_No_Response__c 
            && this.state.synopsisReport.Communication_Method_No_Response__c === 'I did not connect with student and/or family for other reasons explained below' 
            && this.state.synopsisReport.Weekly_Check_In_Status__c !== 'Met'
              ? <div className="survey-question-container"> 
              <TextArea
                compClass="title"
                compName="How_can_we_support__c"
                label="Please provide any additional context to RA staff in order to help inform how we can best support"
                value={ this.srSafe('How_can_we_support__c') ? this.state.synopsisReport.How_can_we_support__c : undefined }
                onChange={ this.handleTextAreaChange }
              />
              </div>
              : '' }
      </div>
      </fieldset>
    );

    const oneTeamJSX = (
      <React.Fragment>
      <div className="title">
          <h5>ONE TEAM CONNECTIONS</h5>
      </div>
      <div>
          <p>(Connecting with your student’s core community is ONE Team in action! Please let RA staff know who you were able to connect with over the past week.)</p>
      </div>
      <fieldset>
        <div className="mentor-met-container">
        <DropDown
          compClass={this.state.metWithFamilyOK ? 'title' : 'title required'}
          compName="Family_Connection__c"
          label="Family Connection"
          value={ this.srSafe('Family_Connection__c')
            ? this.state.synopsisReport.Family_Connection__c
            : ''}
          onChange={ this.handleSimpleFieldChange}
          options={
            [
              { value: undefined, label: 'Did you connect with your RA student’s family this week?' },
              { value: 'Yes', label: 'Yes (met in person or over video call and/or communicated via Basecamp, email or phone)' },
              { value: 'No', label: 'No' },
            ]
          }/>
        <DropDown
          compClass={this.state.metWithTeacherOK ? 'title' : 'title required'}
          compName="Teacher_Connection__c"
          label="Teacher Connection"
          value={this.srSafe('Teacher_Connection__c')
            ? this.state.synopsisReport.Teacher_Connection__c
            : ''}
          onChange={ this.handleSimpleFieldChange}
          options={
            [
              { value: undefined, label: 'Did you connect with 1 or more of your RA student’s teachers this week?' },
              { value: 'Yes', label: 'Yes (met in person or over video call and/or communicated via Basecamp, email or phone)' },
              { value: 'No', label: 'No' },
            ]
          }/>
        <DropDown
          compClass={this.state.metWithCoachOK ? 'title' : 'title required'}
          compName="Coach_Connection__c"
          label="Coach Connection"
          value={this.srSafe('Coach_Connection__c')
            ? this.state.synopsisReport.Coach_Connection__c
            : ''}
          onChange={ this.handleSimpleFieldChange}
          options={
            [
              { value: undefined, label: 'Did you connect with your RA student’s coach this week?' },
              { value: 'Yes', label: 'Yes (attended a game or practice and/or communicated via email or phone)' },
              { value: 'No', label: 'No' },
            ]
          }/>
          </div>
        </fieldset>
      </React.Fragment>
    );

    const identityStatementJSX = (
      <React.Fragment>
        <div className="title">
            <h5>IDENTITY STATEMENT</h5>
        </div>
        <div className="survey-question-container">
          <DropDown
            compClass={this.state.identityStatusOK ? 'title' : 'title required'}
            compName="Identity_Statement_Weekly_Status__c"
            label="Identity Statement Discussion Status"
            value={this.srSafe('Identity_Statement_Weekly_Status__c')
              ? this.state.synopsisReport.Identity_Statement_Weekly_Status__c
              : ''}
            onChange={ this.handleSimpleFieldChange}
            options={
              [
                { value: undefined, label: 'Did you discuss Identity Statement questions this week?' },
                { value: 'Yes', label: 'Yes' },
                { value: 'No', label: 'No' },
              ]
            }/>
        </div>
        { this.state.synopsisReport && !!this.state.synopsisReport.Identity_Statement_Weekly_Status__c 
            && this.state.synopsisReport.Identity_Statement_Weekly_Status__c === 'Yes' 
          ? <div className="survey-question-container">
            <DropDown
              compClass={this.state.identityPromptOK ? 'title' : 'title required'}
              compName="Identity_Statement_Prompts__c"
              label="Identity Statement Discussion Status"
              value={this.srSafe('Identity_Statement_Prompts__c')
                ? this.state.synopsisReport.Identity_Statement_Prompts__c
                : ''}
              onChange={ this.handleSimpleFieldChange}
              options={
                [
                  { value: undefined, label: 'What number did you discuss?' },
                  { value: '0: Not Started', label: '0: Not Started'},
                  { value: '1: Intro', label: '1: Intro' },
                  { value: '2: Spaces/Places', label: '2: Spaces/Places' },
                  { value: '3: Of My Friends', label: '3: Of My Friends' },
                  { value: '4: Ancestors/Culture', label: '4: Ancestors/Culture' },
                  { value: '5: Unique/ Voice', label: '5: Unique/ Voice' },
                  { value: '6: Strength/Insecurities', label: '6: Strength/Insecurities' },
                  { value: '7: Triggers and Anger', label: '7: Triggers and Anger' },
                  { value: '8: De-escalate/ Appreciate', label: '8: De-escalate/ Appreciate' },
                  { value: '9: Happy/ Peace', label: '9: Happy/ Peace' },
                  { value: '10: Love/ Respect', label: '10: Love/ Respect' },
                  { value: '11: Age/Gender/Sexual Preference', label: '11: Age/Gender/Sexual Preference' },
                  { value: '12: Race/ Religion', label: '12: Race/ Religion' },
                  { value: '13: Learning Ability/Physical Ability', label: '13: Learning Ability/Physical Ability' },
                  { value: '14: Racial Identity', label: '14: Racial Identity' },
                  { value: '15: Feelings about Race', label: '15: Feelings about Race' },
                  { value: '16: Prompts Complete', label: '16: Prompts Complete' },
                ]
              }/>
            </div>
          : '' }
        { this.state.synopsisReport && !!this.state.synopsisReport.Identity_Statement_Weekly_Status__c 
            && this.state.synopsisReport.Identity_Statement_Weekly_Status__c === 'No' 
          ? <div className="survey-question-container">
            <TextArea
                compClass="title"
                compName="Identity_Statement_Why_Not__c"
                label="Why not? (optional)"
                value={ this.srSafe('Identity_Statement_Why_Not__c')
                  ? this.state.synopsisReport.Identity_Statement_Why_Not__c
                  : '' }
                onChange={ this.handleTextAreaChange }
              />
            </div>
          : '' }
        <div className="survey-question-container">
            <TextArea
                compClass="title"
                compName="Identity_Statement_Highlights__c"
                label="Identity Statement Highlights (optional)"
                value={ this.srSafe('Identity_Statement_Highlights__c')
                  ? this.state.synopsisReport.Identity_Statement_Highlights__c
                  : '' }
                onChange={ this.handleTextAreaChange }
              />
        </div>
      </React.Fragment>
    );

    const { studentGrade } = this.state;

    const pointSheetStatusJSX = (
      <fieldset>
        <div className="title">
          <h5>POINT SHEET AND SCHOOL UPDATE</h5>
        </div>
        <div className="mentor-met-container">
          <DropDown
            compClass={this.state.pointSheetStatusOK ? 'title' : 'title required'}
            compName="Point_Sheet_Status__c"
            label="Point Sheet Status:"
            value={this.srSafe('Point_Sheet_Status__c')
              ? this.state.synopsisReport.Point_Sheet_Status__c
              : undefined}
            onChange={ this.handleSimpleFieldChange}
            options={
              [
                { value: undefined, label: 'Select Point Sheet Status' },
                { value: 'Turned in', label: 'Turned in' },
                { value: 'Not turned in', label: 'Not turned in (Warning: This could affect eligibility)' },
              ]
            }/>
          {this.state.synopsisReport && !!this.state.synopsisReport.Point_Sheet_Status__c && this.state.synopsisReport.Point_Sheet_Status__c === 'Turned in' && studentGrade > 5
            ? <DropDown
                compClass={this.state.msSelfReflectionOK ? 'title' : 'title required'}
                compName="Point_Sheet_MS_Self_Reflection__c"
                label="Identity Self Reflection"
                value={this.srSafe('Point_Sheet_MS_Self_Reflection__c')
                  ? this.state.synopsisReport.Point_Sheet_MS_Self_Reflection__c
                  : undefined}
                onChange={ this.handleSimpleFieldChange}
                options={
                  [
                    { value: undefined, label: 'Select Point Sheet Completion' },
                    { value: '1-3 periods (Warning this could affect eligibility)', label: '1-3 periods (Warning this could affect eligibility)' },
                    { value: '4-6 periods (Full eligibility, discussion opportunity with self discovery for rest of classes)', label: '4-6 periods (Full eligibility, discussion opportunity with self discovery for rest of classes)' },
                    { value: '7 periods (Full eligibility)', label: '7 periods (Full eligibility)' },
                  ]
                }/> 
            : ''}
          {this.state.synopsisReport && !!this.state.synopsisReport.Point_Sheet_Status__c && this.state.synopsisReport.Point_Sheet_Status__c === 'Turned in' && studentGrade <= 5
            ? <DropDown
                compClass={this.state.esSelfReflectionOK ? 'title' : 'title required'}
                compName="Point_Sheet_ES_Self_Reflection__c"
                label="Identity Self Reflection"
                value={this.srSafe('Point_Sheet_ES_Self_Reflection__c')
                  ? this.state.synopsisReport.Point_Sheet_ES_Self_Reflection__c
                  : undefined}
                onChange={ this.handleSimpleFieldChange}
                options={
                  [
                    { value: undefined, label: 'Select Point Sheet Completion' },
                    { value: '1-2 days (Warning this could affect eligibility)', label: '1-2 days (Warning this could affect eligibility)' },
                    { value: '3-4 days (Full eligibility, discussion opportunity with Self Discovery for rest of classes)', label: '3-4 days (Full eligibility, discussion opportunity with Self Discovery for rest of classes)' },
                    { value: '5 days (Full eligibility)', label: '5 days (Full eligibility)' },
                  ]
                }/> 
            : ''}
          {this.state.synopsisReport && !!this.state.synopsisReport.Point_Sheet_Status__c && this.state.synopsisReport.Point_Sheet_Status__c === 'Turned in' && studentGrade > 5
            ? <DropDown
                compClass={this.state.msTeacherConvoOK ? 'title' : 'title required'}
                compName="Point_Sheet_Teacher_Convo_MS__c"
                label="Teacher Conversations"
                value={this.srSafe('Point_Sheet_Teacher_Convo_MS__c')
                  ? this.state.synopsisReport.Point_Sheet_Teacher_Convo_MS__c
                  : undefined}
                onChange={ this.handleSimpleFieldChange}
                options={
                  [
                    { value: undefined, label: 'Select Point Sheet Completion' },
                    { value: '1-3 periods (Warning this could affect eligibility)', label: '1-3 periods (Warning this could affect eligibility)' },
                    { value: '4-6 periods (Full eligibility, discuss opportunity to connect with rest of teachers)', label: '4-6 periods (Full eligibility, discuss opportunity to connect with rest of teachers)' },
                    { value: '7 periods (Full eligibility)', label: '7 periods (Full eligibility)' },
                  ]
                }/> 
            : ''}
          {this.state.synopsisReport && !!this.state.synopsisReport.Point_Sheet_Status__c && this.state.synopsisReport.Point_Sheet_Status__c === 'Turned in' && studentGrade <= 5
            ? <DropDown
                compClass={this.state.esTeacherConvoOK ? 'title' : 'title required'}
                compName="Point_Sheet_Teacher_Convo_ES__c"
                label="Teacher Conversations"
                value={this.srSafe('Point_Sheet_Teacher_Convo_ES__c')
                  ? this.state.synopsisReport.Point_Sheet_Teacher_Convo_ES__c
                  : undefined}
                onChange={ this.handleSimpleFieldChange}
                options={
                  [
                    { value: undefined, label: 'Select Point Sheet Completion' },
                    { value: '1-2 days (Warning this could affect eligibility)', label: '1-2 days (Warning this could affect eligibility)' },
                    { value: '3-4 days (Full eligibility, discuss opportunity to connect with rest of teachers)', label: '3-4 days (Full eligibility, discuss opportunity to connect with rest of teachers)' },
                    { value: '5 days (Full eligibility)', label: '5 days (Full eligibility)' },
                  ]
                }/> 
            : ''}
          {this.state.synopsisReport && !!this.state.synopsisReport.Point_Sheet_Status__c && this.state.synopsisReport.Point_Sheet_Status__c === 'Not turned in'
            ? <DropDown
                compClass={this.state.pointSheetMissedReasonOK ? 'title' : 'title required'}
                compName="No_Point_Sheet__c"
                label="The RA student did not turn in a point sheet because: (required)"
                value={this.srSafe('No_Point_Sheet__c')
                  ? this.state.synopsisReport.No_Point_Sheet__c
                  : undefined}
                onChange={ this.handleSimpleFieldChange}
                options={
                  [
                    { value: undefined, label: 'Select Reason' },
                    { value: 'The point sheet was completely blank', label: 'The point sheet was completely blank' },
                    { value: 'It was lost', label: 'It was lost (remember, point sheets are available to be printed on each student’s Basecamp teams Docs & Files)' },
                    { value: 'The student was absent from check in', label: 'The student was absent from check in' },
                    { value: 'Other', label: 'Other' },
                  ]
                }/> 
            : ''}
            { this.state.synopsisReport && this.state.synopsisReport.Point_Sheet_Status__c 
              && this.state.synopsisReport.Point_Sheet_Status__c === 'Not turned in' 
              && !!this.state.synopsisReport.No_Point_Sheet__c 
              && this.state.synopsisReport.No_Point_Sheet__c === 'Other'
              ? <div className="survey-question-container">
                  <TextArea
                    compClass={`title ${this.state.pointSheetStatusNotesOK ? '' : 'required'}`}
                    compName="No_Point_Sheet_What_Happened__c"
                    label="What happened?"
                    value={ this.srSafe('No_Point_Sheet_What_Happened__c')
                      ? this.state.synopsisReport.No_Point_Sheet_What_Happened__c
                      : undefined }
                    required={this.state.synopsisReport && this.state.synopsisReport.No_Point_Sheet__c === 'Other'}
                    onChange={ this.handleTextAreaChange }
                    rows={ 3 }
                    cols={ 80 }
                  />
                </div>
              : '' }
            <div className="survey-question-container">
                  <TextArea
                    compClass={`title ${this.state.psAndSchoolUpdateOK ? '' : 'required'}`}
                    compName="Point_Sheet_and_School_Update__c"
                    label="Point Sheet and School Update (Required)"
                    value={ this.srSafe('Point_Sheet_and_School_Update__c')
                      ? this.state.synopsisReport.Point_Sheet_and_School_Update__c
                      : undefined }
                    required={ true }
                    placeholder="Explain the student’s progress in the classroom over the past week."
                    onChange={ this.handleTextAreaChange }
                    rows={ 3 }
                    cols={ 80 }
                  />
                </div>
        </div>
    </fieldset>
    );

    const sportsUpdateJSX = (
      <fieldset>
        <div className="title">
          <h5>SPORTS UPDATE</h5>
        </div>
        <div className="mentor-met-container">
          <DropDown
            compClass={this.state.sportsUpdateOK ? 'title' : 'title required'}
            compName="Weekly_Sports_Update__c"
            label="Did your student go to their sports games and practices this week?"
            value={this.srSafe('Weekly_Sports_Update__c')
              ? this.state.synopsisReport.Weekly_Sports_Update__c
              : undefined}
            onChange={ this.handleSimpleFieldChange}
            options={
              [
                { value: undefined, label: 'Select a response' },
                { value: 'Yes', label: 'Yes' },
                { value: 'Some of them', label: 'Some of them' },
                { value: 'None of them', label: 'None of them' },
                { value: 'We didn’t talk about it', label: 'We didn’t talk about it' },
                { value: 'They are not currently on a team', label: 'They are not currently on a team' },
              ]
            }/>
          <div className="survey-question-container">
            <TextArea
              compClass="title"
              compName="Sports_Update__c"
              label="Sports Update (optional):"
              value={ this.srSafe('Sports_Update__c')
                ? this.state.synopsisReport.Sports_Update__c
                : undefined }
              placeholder="Explain highlights from your conversation and especially the student’s progress in achieving sports related goals discussed last week."
              onChange={ this.handleTextAreaChange }
              rows={ 3 }
              cols={ 80 }
            />
          </div>
        </div>
      </fieldset>
    );

    const additionalCommentsJSX = (
      <fieldset>
        <div className="title">
          <h5>ADDITIONAL COMMENTS</h5>
        </div>
        <div className="mentor-met-container">
          <div className="survey-question-container">
            <TextArea
              compClass="title"
              compName="Additional_Comments__c"
              label="Additional Comments to inform the core community (optional):"
              value={ this.srSafe('Additional_Comments__c')
                ? this.state.synopsisReport.Additional_Comments__c
                : undefined }
              placeholder="Explain highlights from your conversation and especially the student’s progress in achieving non school related goals discussed last week."
              onChange={ this.handleTextAreaChange }
              rows={ 3 }
              cols={ 80 }
            />
          </div>
        </div>
      </fieldset>
    );

    const mentorSupportRequestJSX = (
      <fieldset>
        <div className="mentor-met-container">
          <DropDown
            compClass={this.state.mentorSupportRequestOK ? 'title' : 'title required'}
            compName="Mentor_Support_Request__c"
            label="Do you need additional support?"
            value={this.srSafe('Mentor_Support_Request__c')
              ? this.state.synopsisReport.Mentor_Support_Request__c
              : undefined}
            onChange={ this.handleSimpleFieldChange}
            options={
              [
                { value: undefined, label: 'Pick one...' },
                { value: 'No', label: 'No' },
                { value: 'Student Follow Up', label: 'Student Follow Up' },
                { value: 'Teacher Follow Up', label: 'Teacher Follow Up' },
                { value: 'Technical Support', label: 'Technical Support' },
                { value: 'Other', label: 'Other' },
              ]
            }/>
          { this.state.synopsisReport && !!this.state.synopsisReport.Mentor_Support_Request__c && this.state.synopsisReport.Mentor_Support_Request__c !== 'No'
            ? <div className="survey-question-container">
              <TextArea
                compClass={this.state.mentorSupportRequestNotesOK ? 'title' : 'title required'}
                compName="Mentor_Support_Request_Notes__c"
                label="Please explain:"
                value={ this.srSafe('Mentor_Support_Request_Notes__c')
                  ? this.state.synopsisReport.Mentor_Support_Request_Notes__c
                  : undefined }
                onChange={ this.handleTextAreaChange }
                rows={ 3 }
                cols={ 80 }
              />
            </div>
            : '' }
        </div>
      </fieldset>
    );

    const formButtonOrMessage = () => { 
      if (this.state.waitingOnImages) {
        return (<React.Fragment>
          <h3>Uploading images to Basecamp...</h3>
          <p>This may take a moment depending on image size(s).</p>
        </React.Fragment>);
      } 
      // if (this.state.waitingOnGoogleDrive) {
      //   return (<React.Fragment>
      //     <h3>Saving PDF to Google Drive...</h3>
      //     <p>This is slow. Please be patient.</p>
      //   </React.Fragment>);
      // }
      if (this.state.waitingOnSalesforce) {
        return (<h3>Saving synopsis report to Salesforce...</h3>);
      }
      if (this.props.messageBoardUrl) {
        if (!this.props.error) {
          return (<React.Fragment>
            <h5>Waiting for Basecamp Messaging connection...</h5>
            <p>If the submit button doesn&#39;t appear soon contact an administrator.</p>
          </React.Fragment>);
        }
      } 
      if (!(this.state.waitingOnSalesforce && this.state.savedToSalesforce)) {
        // && this.state.waitingOnGoogleDrive && this.state.savedToGoogleDrive)) {
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
                { headerJSX }
                { mentorMadeScheduledCheckinJSX }
                { oneTeamJSX }
                { identityStatementJSX }
                { pointSheetStatusJSX }
                { sportsUpdateJSX }
                { additionalCommentsJSX }
                <ImagePreviews />
                <div className="modal-footer">
                  <h5>The following items are viewed by RA Staff only:</h5> 
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
        { this.state.savedToSalesforce // savedToGoogleDrive
          ? <SynopsisReportSummary 
            synopsisReport={this.state.synopsisReport} 
            onClose={ this.props.saveClick }/> 
          : synopsisReportFormJSX }
      </div>
    );
  }
}

SynopsisReportForm.propTypes = {
  // synopsisReportLink: PropTypes.string,
  synopsisReport: PropTypes.object,
  // pointTrackers: PropTypes.object,
  handleChange: PropTypes.func,
  saveSynopsisReport: PropTypes.func,
  // createSynopsisReportPdf: PropTypes.func,
  // setSynopsisReportLink: PropTypes.func,
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
