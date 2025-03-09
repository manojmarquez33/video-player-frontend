import Ember from 'ember';

export default Ember.Component.extend({

  didInsertElement() {
    this._super(...arguments);

    let videoElement = this.element.querySelector("video");

    if (!videoElement) {
      return;
    }

    videoElement.setAttribute("crossorigin", "anonymous");
    videoElement.load();

    videoElement.addEventListener("loadedmetadata", () => {
      Ember.run.next(this, function () {
        let videoDuration = this.element ? this.element.querySelector(".duration-overlay") : null;
        if (videoDuration) {
          videoDuration.textContent = formatDuration(videoElement.duration);
        }
      });
    });

    if (videoElement.readyState >= 1) {
      videoElement.dispatchEvent(new Event("loadedmetadata"));
    }
  },

  daysAgo: Ember.computed('video.lastModified', function () {
    let lastModified = this.get('video.lastModified');

    if (!lastModified) {
      return 'Unknown';
    }

    let modifiedDate = new Date(lastModified);
    let now = new Date();
    let timeDiff = now - modifiedDate;
    let daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    return daysDiff > 1 ? `${daysDiff} days` : `${daysDiff} day`;
  })
});

function formatDuration(seconds) {
  if (isNaN(seconds)) {
    return "00:00";
  }
  let minutes = Math.floor(seconds / 60);
  let secondsLeft = Math.floor(seconds % 60);
  return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
}
