import * as actionTypes from "./actionTypes";
export const addPasswordItem = (passwordItem) => ({
  type: actionTypes.ADD_PASSWORD_ITEM,
  passwordItem,
});
export const setLockTimes = (time) => ({
  type: actionTypes.SET_LOCK_TIME,
  time: time,
});
export const setShow = () => ({
  type: actionTypes.SWT_SHOW,
});
