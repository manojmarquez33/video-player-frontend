import Ember from 'ember';
import VideoInitializer from '../mixins/video-initializer';
import VideoController from '../mixins/video-controller';
import VideoProcess from '../mixins/video-process';
import ZoomDrag from '../mixins/zoom-drag';
import VideoUtils from '../mixins/video-utils';
import PlaylistProcess from "../mixins/playlist-process";

export default Ember.Controller.extend(
  VideoInitializer,
  PlaylistProcess,
  VideoController,
  VideoProcess,
  ZoomDrag,
  VideoUtils,
  {
    isPlayList: true,
    videoList: [],
    currentVideoIndex: 0,
    totalDuration: 0,
    videoDurations: [],
    isSeeking: false,

    selectedSpeed: 1,
    isPlaying: false,
    videoElement: null,
    intervalRewind: null,
    intervalForward: null,

    init() {
      this._super(...arguments);
      Ember.run.scheduleOnce('afterRender', this, this.setupVideoPlayer);
    },
  }
);
