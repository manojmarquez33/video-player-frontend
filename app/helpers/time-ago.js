import Ember from "ember";

export function timeAgo(timestamp) {
  let time = new Date(timestamp);
  let now = new Date();
  let seconds = Math.floor((now - time) / 1000);

  if (seconds < 60) {
    return `Uploaded ${seconds} seconds ago`;
  }
  let minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `Uploaded ${minutes} minutes ago`;
  }
  let hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Uploaded ${hours} hours ago`;
  }
  let days = Math.floor(hours / 24);
  return `Uploaded ${days} days ago`;
}

export default Ember.Helper.helper(timeAgo);
