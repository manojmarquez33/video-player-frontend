import Ember from 'ember';

export default Ember.Mixin.create({

  formatTime(seconds) {
    seconds = isNaN(seconds) ? 0 : seconds;

    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    secs = secs < 10 ? '0' + secs : secs;

    return `${minutes}:${secs}`;
  },


  formatTimetoRelative(seconds) {
    if (isNaN(seconds) || seconds < 0) {
      return "0 seconds";
    }

    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let secs = Math.floor(seconds % 60);

    let result = [];
    if (hours > 0) {
      result.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    }
    if (minutes > 0) {
      result.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    }
    if (secs > 0 || result.length === 0) {
      result.push(`${secs} second${secs > 1 ? "s" : ""}`);
    }

    return result.join(" ");
  }

});
