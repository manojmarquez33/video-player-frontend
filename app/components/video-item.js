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
      Ember.run.scheduleOnce("afterRender", this, function () {
        //console.log("duration:", videoElement.duration);

        Ember.run.next(this, function () {
          let videoDuration = this.element ? this.element.querySelector(".duration-overlay") : null;
          if (videoDuration) {
            videoDuration.textContent = formatDuration(videoElement.duration);
          }
        });
      });
    });
  }
});

function formatDuration(seconds) {
  if (isNaN(seconds)) {
    return "00:00";
  }
  let minutes = Math.floor(seconds / 60);
  let secondsLeft = Math.floor(seconds % 60);
  return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
}
