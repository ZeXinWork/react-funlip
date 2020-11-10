import * as actionTypes from "./actionTypes";
const defaultState = {
  show: false,
  userData: [],
};
export default (state = defaultState, action) => {
  if (action.type === actionTypes.ADD_PASSWORD_ITEM) {
    const newState = JSON.parse(JSON.stringify(state));
    newState.passwordLibrary.push(action.passwordItem);
    return newState;
  }
  if (action.type === actionTypes.SET_LOCK_TIME) {
    const newState = JSON.parse(JSON.stringify(state));
    newState.time = action.time;

    return newState;
  }
  if (action.type === actionTypes.SWT_SHOW) {
    const newState = JSON.parse(JSON.stringify(state));
    newState.show = !newState.show;
    return newState;
  }

  return state;
};
