import * as pl from './pick-list-tests';

// collection of functions and constants related to playing time calculation and validation

// use pt object to set percentages for earned playing time
const PT = {
  none: { label: 'None of Game' },
  oneQ: { label: 'One Quarter', pct: 0.4375 },
  twoQ: { label: 'Two Quarters', pct: 0.5625 },
  threeQ: { label: 'Three Quarters', pct: 0.6875 },
  allButStart: { label: 'All but Start', pct: 0.8125 },
  entireGame: { label: 'Entire Game', pct: 0.875 },
};

const TUTORIAL_MAX_STAMPS = 8;
const TUTORIAL_MAX_TOKENS = 4;
const TUTORIAL_POSSIBLE_STAMPS_PER_DAY = 2;
const SUBJECT_MAX_STAMPS = 20;
const SUBJECT_POSSIBLE_TOKENS_PER_PERIOD = 2;
const SUBJECT_POSSIBLE_STAMPS_PER_DAY = 4;

const TWO_TOKEN_GRADE = 80; // grade at or above earns 2 tokens
const ONE_TOKEN_GRADE = 70; // grade at or above earns 1 token

const calcPlayingTime = (sr) => {
  if (!sr) return null;

  const subjects = sr.PointTrackers__r.records;
  const student = sr.Student__r;

  const isElementarySchool = student.Student_Grade__c < 6;

  const numberOfPeriods = subjects.length;
  const totalClassTokens = numberOfPeriods * SUBJECT_POSSIBLE_TOKENS_PER_PERIOD;
  const totalTutorialTokens = isElementarySchool ? 0 : TUTORIAL_MAX_TOKENS;
  const totalGradeTokens = isElementarySchool ? 0 : numberOfPeriods * SUBJECT_POSSIBLE_TOKENS_PER_PERIOD;
  const totalTokensPossible = totalClassTokens + totalGradeTokens + totalTutorialTokens;

  const totalEarnedTokens = subjects.map((subject) => {
    const grade = subject.Grade__c;
    const subjectName = subject.Class__r.Name;
    // halfStamps are "X"s from the scoring sheet
    const excusedDays = subject.Excused_Days__c;
    const stamps = subject.Stamps__c;
    const halfStamps = subject.Half_Stamps__c;

    let pointsPossible = (SUBJECT_MAX_STAMPS * 2) - (excusedDays * (SUBJECT_POSSIBLE_STAMPS_PER_DAY * 2));
    if (subjectName.toLowerCase() === 'tutorial') pointsPossible = TUTORIAL_MAX_STAMPS - (excusedDays * TUTORIAL_POSSIBLE_STAMPS_PER_DAY);
    if (isElementarySchool && subjectName.toLowerCase() === 'tutorial') pointsPossible = 0;

    const totalClassPointsEarned = (2 * stamps) + halfStamps;
    const classPointPercentage = totalClassPointsEarned / pointsPossible;

    let classTokensEarned = 0;
    if (classPointPercentage >= 0.50) classTokensEarned = 1;
    if (classPointPercentage >= 0.75) classTokensEarned = 2;

    let gradeTokensEarned = 0;
    if (!isElementarySchool && parseInt(grade, 10) >= ONE_TOKEN_GRADE) gradeTokensEarned = 1;
    if (!isElementarySchool && (parseInt(grade, 10) >= TWO_TOKEN_GRADE || grade === 'N/A')) gradeTokensEarned = 2;

    const subjectTokensEarned = classTokensEarned + gradeTokensEarned;

    return subjectTokensEarned;
  });

  const totalTokensEarned = totalEarnedTokens.reduce((acc, cur) => acc + cur, 0);
  const tokenPercentage = totalTokensEarned / totalTokensPossible;
  let earnedPlayingTime = PT.none.label;
  if (tokenPercentage >= PT.oneQ.pct) earnedPlayingTime = PT.oneQ.label;
  if (tokenPercentage >= PT.twoQ.pct) earnedPlayingTime = PT.twoQ.label;
  if (tokenPercentage >= PT.threeQ.pct) earnedPlayingTime = PT.threeQ.label;
  if (tokenPercentage >= PT.allButStart.pct) earnedPlayingTime = PT.allButStart.label;
  if (tokenPercentage >= PT.entireGame.pct) earnedPlayingTime = PT.entireGame.label;

  return earnedPlayingTime;
};

const rightType = subject => (
  typeof subject.Stamps__c === 'number' && typeof subject.Half_Stamps__c === 'number' && typeof subject.Excused_Days__c === 'number'
);

const numeric = subject => (
  rightType(subject) && subject.Stamps__c >= 0 && subject.Half_Stamps__c >= 0 && subject.Excused_Days__c >= 0
);

const maxStampsPossible = subject => (
  subject.Class__r.Name.toLowerCase() === 'tutorial'
    ? TUTORIAL_MAX_STAMPS - (subject.Excused_Days__c * TUTORIAL_POSSIBLE_STAMPS_PER_DAY)
    : SUBJECT_MAX_STAMPS - (subject.Excused_Days__c * SUBJECT_POSSIBLE_STAMPS_PER_DAY)
);

const validScores = (subject) => {
  if (!subject) return false;
  const inRange = subject.Stamps__c + subject.Half_Stamps__c <= maxStampsPossible(subject);
  return numeric(subject) && inRange;
};

const validateGrade = grade => grade === 'N/A' || (Number.isInteger(parseInt(grade, 10)) && parseInt(grade, 10) >= 0 && parseInt(grade, 10) <= 999);

const validGrade = subject => validateGrade(subject.Grade__c);

const validPointTrackerScores = (sr) => {
  if (!pl.turnedIn(sr.Point_Sheet_Status__c)) return true;

  const goodSubjectStamps = sr.PointTrackers__r.records.every(subject => (
    validScores(subject)
  ));

  const isElementaryStudent = sr.Student__r && sr.Student__r.Student_Grade__c < 6;
  const goodSubjectGrades = isElementaryStudent
    || sr.PointTrackers__r.records.every(subject => validGrade(subject));

  return goodSubjectStamps && goodSubjectGrades;
};

export {
  calcPlayingTime,
  maxStampsPossible,
  validScores,
  validateGrade,
  validGrade,
  validPointTrackerScores,
};
