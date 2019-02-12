export default (state = null, { type, payload }) => {
  switch (type) {
    case 'SYNOPSIS_REPORTS_SET':
      return payload;
    default:
      return state;
  }
};