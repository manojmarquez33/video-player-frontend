import Ember from 'ember';
import VideoInitializer from '../mixins/video-initializer';
import VideoController from '../mixins/video-controller';
import VideoProcess from '../mixins/video-process';
import ZoomDrag from '../mixins/zoom-drag';
import VideoUtils from '../mixins/video-utils';

export default Ember.Controller.extend(
  VideoInitializer,
  VideoController,
  VideoProcess,
  ZoomDrag,
  VideoUtils,
  {
    isPlayList: false,
    selectedSpeed: 1,
    isPlaying: false,
    videoElement: null,


    init() {
      this._super(...arguments);
      Ember.run.scheduleOnce('afterRender', this, this.setupVideoPlayer);
    },
  }
);
