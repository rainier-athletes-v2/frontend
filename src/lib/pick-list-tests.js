// Contact/Relationship status values
export const current = status => status === 'Current';
export const former = status => status === 'Former';

// Synopsis_Report__c.Point_Sheet_Status__cc values
export const PsStatus = {
  TurnedIn: 'Turned In',
  Lost: 'Lost',
  Incomplete: 'Incomplete',
  Absent: 'Absent',
  Other: 'Other',
};
export const turnedIn = status => status === PsStatus.TurnedIn;
export const lost = status => status === PsStatus.Lost;
export const incomplete = status => status === PsStatus.Incomplete;
export const absent = status => status === PsStatus.Absent;
export const other = status => status === PsStatus.Other;

// Synopsis_Report__c.Synopsis_Report_Status__c values
export const SrStatus = {
  New: 'New',
  Completed: 'Completed',
  PlayingTimeOnly: 'Playing time only',
};
export const playingTimeOnly = status => status === SrStatus.PlayingTimeOnly;
export const completed = status => status === SrStatus.Completed;

// Synopsis_Report__c.Weekly_Check_In_Status__c values
export const WciStatus = {
  Met: 'Met',
  StudentMissed: 'Student missed check in',
  MentorMissed: 'Mentor missed check in',
};
export const met = status => status === WciStatus.Met;
export const mentorMissed = status => status === WciStatus.MentorMissed;
export const studentMissed = status => status === WciStatus.StudentMissed;