import { combineReducers } from 'redux';

import windowReducer from './windowReducer';
import displayReducer from './displayReducer';
import eventsReducer from './eventsReducer';
import eventChangesReducer from './eventChangesReducer';
import ltrjnEditorReducer from './ltrjnEditorReducer';
import meReducer from './meReducer';
import profileReducer from './profileReducer';
import profileEditorReducer from './profileEditorReducer';
import tradeEditorReducer from './tradeEditorReducer';

const reducers = combineReducers({
  window: windowReducer,
  display: displayReducer,
  events: eventsReducer,
  eventChanges: eventChangesReducer,
  ltrjnEditor: ltrjnEditorReducer,
  me: meReducer,
  profile: profileReducer,
  profileEditor: profileEditorReducer,
  tradeEditor: tradeEditorReducer,
});

export default reducers;
