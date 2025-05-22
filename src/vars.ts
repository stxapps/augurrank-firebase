const fetchEvents = {
  quryCrsr: { id: null, snapshot: null },
};

const fetchEventChanges = {
  quryCrsr: { id: null, snapshot: null },
};

const listenSync = {
  removeListener: null,
};

const refreshTxs = {
  timeId: null,
  seq: 0,
};

const vars = { fetchEvents, fetchEventChanges, listenSync, refreshTxs };

export default vars;
