export default (state = null, { type, payload }) => {
  switch (type) {
    case 'CLASS_SCHEDULE_SET':
      return payload;
    default:
      return state;
  }
};
