import * as pl from './pick-list-tests';

// collection of functions and constants related to playing time calculation and validation

// use pt object to set percentages for earned playing time
const PT = {
  none: { label: 'None of Game' },
  oneQ: { label: 'One Quarter', pct: 0.33 },
  twoQ: { label: 'Two Quarters', pct: 0.44 },
  threeQ: { label: 'Three Quarters', pct: 0.55 },
  allButStart: { label: 'All but Start', pct: 0.66 },
  entireGame: { label: 'Entire Game', pct: 0.77 },
};

// Stamps refer to entries on student's point sheet. Points are stamps translated such that
// a full stamp = 2 tokens, a half stamp (X) = 1 token.
// Tutorial stamps are all worth 1 token and 1 point.
// Tokens are points adjusted based on percentage break points and are used to calculate playing time earned.
// Tutorial meets four times/week with 1 stamp possible per day, max 2 points per day or 8 points per week.
// Other subjects meet 5 times/week with 4 stamps possible per day, 8 points per day, 40 points per week

// Grades were removed from playing time calculations but code has been commented out rather 
// than removed in case this changes in the future.

const TUTORIAL_MAX_STAMPS_PER_DAY = 1;
const TUTORIAL_MAX_POINTS_PER_DAY = 1;
const TUTORIAL_MAX_STAMPS_PER_WEEK = 4;
const TUTORIAL_MAX_POINTS_PER_WEEK = 4;
const TUTORIAL_MAX_TOKENS_PER_WEEK = 4;
const SUBJECT_MAX_STAMPS_PER_DAY = 4;
const SUBJECT_MAX_POINTS_PER_DAY = 8;
const SUBJECT_MAX_STAMPS_PER_WEEK = 20; // 5 * SUBJECT_MAX_STAMPS_PER_DAY; // 5 * 4 = 20
const SUBJECT_MAX_POINTS_PER_WEEK = 40; // 2 * SUBJECT_MAX_STAMPS_PER_WEEK; // 2 * 20 = 40
// no SUBJECT_MAX_TOKENS_PER_WEEK here because it depends on # of subjects
const CLASS_TOKENS_PER_SUBJECT = 2;
// GRADE const GRADE_TOKENS_PER_SUBJECT = 2;

// GRADE breakpoints for translating numeric grades into grade tokens
// GRADE const TWO_TOKEN_GRADE = 80; // grade at or above earns 2 tokens
// GRADE const ONE_TOKEN_GRADE = 70; // grade at or above earns 1 token

const calcPlayingTime = (sr) => {
  if (!sr) return null;
  if (!sr.PointTrackers__r) return null;
  
  const subjects = sr.PointTrackers__r.records;
  const student = sr.Student__r;

  const isElementarySchool = student.Student_Grade__c < 6;

  const numberOfSubjects = subjects.length;
  const totalClassTokens = numberOfSubjects * CLASS_TOKENS_PER_SUBJECT - (isElementarySchool ? 0 : CLASS_TOKENS_PER_SUBJECT);
  const totalTutorialTokens = isElementarySchool ? 0 : TUTORIAL_MAX_TOKENS_PER_WEEK;
  // GRADE const totalNAGradeTokens = subjects.reduce((a, c) => a + (c.Grade__c === 'N/A' ? 2 : 0), 0) - 2; // - 1 for the actual tutorial
  // GRADE const totalGradeTokens = isElementarySchool ? 0 : numberOfSubjects * GRADE_TOKENS_PER_SUBJECT - (isElementarySchool ? 0 : CLASS_TOKENS_PER_SUBJECT);
  // GRADE removed + totalGradeTokens - totalNAGradeTokens from the following formula. Grades not included in calculations
  const totalTokensPossible = totalClassTokens + totalTutorialTokens;

  const totalEarnedTokens = subjects.map((subject) => {
    // GRADE const grade = subject.Grade__c;
    const subjectName = subject.Class__r.Name;
    // halfStamps are "X"s from the scoring sheet
    const excusedDays = subject.Excused_Days__c;
    const stamps = subject.Stamps__c;
    const halfStamps = subject.Half_Stamps__c;

    let pointsPossible = 0;
    let totalClassPointsEarned = 0;
    let classTokensEarned = 0;
    // GRADE let gradeTokensEarned = 0;
    let tutorialTokensEarned = 0;
    if (subjectName.toLowerCase() === 'tutorial') {
      tutorialTokensEarned = stamps;
    } else {
      pointsPossible = (SUBJECT_MAX_POINTS_PER_WEEK) - (excusedDays * SUBJECT_MAX_POINTS_PER_DAY);
      totalClassPointsEarned = (2 * stamps) + halfStamps;
      const classPointPercentage = totalClassPointsEarned / pointsPossible;
      if (classPointPercentage >= 0.50) classTokensEarned = 1;
      if (classPointPercentage >= 0.75) classTokensEarned = 2;
      // GRADE if (!isElementarySchool && parseInt(grade, 10) >= ONE_TOKEN_GRADE) gradeTokensEarned = 1;
      // GRADE if (!isElementarySchool && (parseInt(grade, 10) >= TWO_TOKEN_GRADE)) gradeTokensEarned = 2;
    }
    // GRADE removed + gradeTokensEarned from following equations. Grades not included in calculations
    const subjectTokensEarned = classTokensEarned + tutorialTokensEarned;
    
    return subjectTokensEarned;
  });
  console.log('totalEarnedTokens array', totalEarnedTokens || 'undefined');
  const totalTokensEarned = totalEarnedTokens.reduce((acc, cur) => acc + cur, 0);
  const tokenPercentage = totalTokensEarned / totalTokensPossible;
  // console.log(`earned/possible: ${totalTokensEarned}/${totalTokensPossible}, %:${tokenPercentage}`);
  let earnedPlayingTime = PT.none.label;
  if (tokenPercentage >= PT.oneQ.pct) earnedPlayingTime = PT.oneQ.label;
  if (tokenPercentage >= PT.twoQ.pct) earnedPlayingTime = PT.twoQ.label;
  if (tokenPercentage >= PT.threeQ.pct) earnedPlayingTime = PT.threeQ.label;
  if (tokenPercentage >= PT.allButStart.pct) earnedPlayingTime = PT.allButStart.label;
  if (tokenPercentage >= PT.entireGame.pct) earnedPlayingTime = PT.entireGame.label;
  console.log('num subj', numberOfSubjects, 'tokens possible', totalTokensPossible, 'tokens earned', totalTokensEarned, '%', tokenPercentage, 'result', earnedPlayingTime);
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
    ? TUTORIAL_MAX_STAMPS_PER_WEEK - (subject.Excused_Days__c * TUTORIAL_MAX_STAMPS_PER_DAY)
    : SUBJECT_MAX_STAMPS_PER_WEEK - (subject.Excused_Days__c * SUBJECT_MAX_STAMPS_PER_DAY)
);

const maxPointsPossible = subject => (
  subject.Class__r.Name.toLowerCase() === 'tutorial'
    ? TUTORIAL_MAX_POINTS_PER_WEEK - (subject.Excused_Days__c * TUTORIAL_MAX_POINTS_PER_DAY)
    : SUBJECT_MAX_POINTS_PER_WEEK - (subject.Excused_Days__c * SUBJECT_MAX_POINTS_PER_DAY)
);

const validScores = (subject) => {
  if (!subject) return false;
  const inRange = subject.Stamps__c + subject.Half_Stamps__c <= maxStampsPossible(subject);
  return numeric(subject) && inRange;
};

// const validateGrade = grade => grade === 'N/A' || (Number.isInteger(parseInt(grade, 10)) && parseInt(grade, 10) >= 0 && parseInt(grade, 10) <= 999);
const validateGrade = grade => grade === 'N/A' || ['A', 'B', 'C', 'D', 'F'].includes(grade);

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
  maxPointsPossible,
  validScores,
  validateGrade,
  validGrade,
  validPointTrackerScores,
};
