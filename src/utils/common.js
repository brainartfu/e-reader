export const setLoginInfo = (data) => {
  localStorage.setItem('login', JSON.stringify(data));
}
export const getLoginInfo = () => {
  return JSON.parse(localStorage.getItem('login'));
}

export const setLocalBookmark = (id, bookmark) => {
  let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || {};
  bookmarks[id] = bookmark;
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}
export const getLocalBookmark = id => {
  let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || {};
  return id ? bookmarks[id] : bookmarks;
}
export const removeLocalBookmark = id => {
  localStorage.removeItem('bookmarks');
}

export const setLocalReading = (id, reading) => {
  let readings = JSON.parse(localStorage.getItem('readings')) || {};
  readings[id] = reading;
  localStorage.setItem('readings', JSON.stringify(readings));
}
export const getLocalReading = id => {
  let readings = JSON.parse(localStorage.getItem('readings')) || {};
  return id ? readings[id] : readings;
}
export const removeLocalReading = id => {
  localStorage.removeItem('readings');
}