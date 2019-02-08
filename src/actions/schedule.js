import superagent from 'superagent';
import * as routes from '../lib/routes';

export const setClassSchedule = scheduleData => ({
  type: 'CLASS_SCHEDULE_SET',
  payload: scheduleData,
});

// export const setWaitingOnSave = () => ({
//   type: 'STUDENT_DATA_WAITING_ON_SAVE',
// });

// export const setBulkStudentData = studentDataArray => ({
//   type: 'STUDENT_DATA_BULK_SET',
//   payload: studentDataArray,
// });

// export const createStudentData = studentData => (store) => {
//   const { token } = store.getState();

//   return superagent.post(`${API_URL}${routes.STUDENT_DATA_ROUTE}`)
//     .set('Authorization', `Bearer ${token}`)
//     .set('Content-Type', 'application/json')
//     .send(studentData)
//     .then((res) => {
//       return store.dispatch(setStudentData(res.body));
//     })
//     .catch((err) => {
//       console.error('createStudentData error:', err);
//     });
// };

export const fetchClassScheduleData = (studentId) => (store) => { // eslint-disable-line
  const { token } = store.getState();

  return superagent.get(`${API_URL}${routes.CLASS_SCHEDULE_ROUTE}/${studentId}`)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .then((res) => {
      return store.dispatch(setClassSchedule(res.body));
    })
    .catch((err) => {
      console.error('fetchClassScheduleData error:', err);
    });
};

// export const fetchStudentData = studentId => (store) => { // eslint-disable-line
//   const { token } = store.getState();

//   return superagent.get(`${API_URL}${routes.STUDENT_DATA_ROUTE}`)
//     .set('Authorization', `Bearer ${token}`)
//     .set('Content-Type', 'application/json')
//     .query({ _id: studentId })
//     .then((res) => {
//       const studentData = res.body[0];
//       return store.dispatch(setStudentData(studentData));
//     })
//     .catch((err) => {
//       console.error('fetchBulkStudentData error:', err);
//     });
// };

// export const updateStudentData = studentData => (store) => {
//   const { token } = store.getState();
//   const ptId = studentData.lastPointTracker 
//     ? studentData.lastPointTracker._id : undefined;

//   return superagent.put(`${API_URL}${routes.STUDENT_DATA_ROUTE}`)
//     .set('Authorization', `Bearer ${token}`)
//     .set('Content-Type', 'application/json')
//     .send({ ...studentData, lastPointTracker: ptId })
//     .then((res) => {
//       return store.dispatch(setStudentData(res.body));
//     })
//     .catch((err) => {
//       console.error('updateStudentData error:', err);
//     });
// };
