import Ember from 'ember';

export default Ember.Mixin.create({
  formatTime(seconds) {
    seconds = isNaN(seconds) ? 0 : seconds;

    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    secs = secs < 10 ? '0' + secs : secs;

    return `${minutes}:${secs}`;
  },
});
