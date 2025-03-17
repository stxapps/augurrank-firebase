import { combineReducers } from 'redux';

import windowReducer from './windowReducer';
import displayReducer from './displayReducer';
import ltrjnEditorReducer from './ltrjnEditorReducer';
import meReducer from './meReducer';
import profileReducer from './profileReducer';
import profileEditorReducer from './profileEditorReducer';
import eventsReducer from './eventsReducer';
import txnsReducer from './txnsReducer';

const reducers = combineReducers({
  window: windowReducer,
  display: displayReducer,
  ltrjnEditor: ltrjnEditorReducer,
  me: meReducer,
  profile: profileReducer,
  profileEditor: profileEditorReducer,
  events: eventsReducer,
  txns: txnsReducer,
});

export default reducers;
