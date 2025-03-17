const getItem = async (key) => {
  const item = getItemSync(key); // if no key, item will be null.
  return item;
};

const setItem = async (key, item) => {
  setItemSync(key, item);
};

const removeItem = async (key) => {
  removeItemSync(key);
};

const listKeys = async () => {
  return listKeysSync();
};

const getItemSync = (key) => {
  const item = localStorage.getItem(key);
  return item;
};

const setItemSync = (key, item) => {
  localStorage.setItem(key, item);
};

const removeItemSync = (key) => {
  localStorage.removeItem(key);
};

const listKeysSync = () => {
  const keys = Object.keys(localStorage);
  return keys;
};

const localSg = {
  getItem, setItem, removeItem, listKeys, getItemSync, setItemSync, removeItemSync,
  listKeysSync,
};

export default localSg;
