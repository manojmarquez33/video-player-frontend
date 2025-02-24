import Ember from 'ember';

export default Ember.Mixin.create({
  scale: 1,
  translateX: 0,
  translateY: 0,
  isDragging: false,
  startX: 0,
  startY: 0,

  actions: {
    zoomIn() {
      this.set('scale', this.get('scale') + 0.1);
      this.updateTransform();
    },

    zoomOut() {
      this.set('scale', Math.max(1, this.get('scale') - 0.1));
      this.updateTransform();
    },
  },

  updateTransform() {
    this.updateDragMove();

    let video = this.get('videoElement');
    if (!video) {
      return;
    }

    video.style.transform = `translate(${this.get('translateX')}px, ${this.get('translateY')}px) scale(${this.get('scale')})`;
    video.style.transformOrigin = 'center center';
  },

  updateDragMove() {
    let video = this.get('videoElement');
    let wrapper = video.parentElement;

    let wrapperWidth = wrapper.clientWidth;
    let wrapperHeight = wrapper.clientHeight;

    let videoWidth = wrapperWidth * this.get('scale');
    let videoHeight = wrapperHeight * this.get('scale');

    let maxTranslateX = (videoWidth - wrapperWidth) / 2;
    let maxTranslateY = (videoHeight - wrapperHeight) / 2;


    if (videoWidth > wrapperWidth) {
      let translateX = this.get('translateX');
      translateX = Math.max(-maxTranslateX, Math.min(translateX, maxTranslateX));
      this.set('translateX', translateX);
    } else {
      this.set('translateX', 0);
    }

    if (videoHeight > wrapperHeight) {
      let translateY = this.get('translateY');
      translateY = Math.max(-maxTranslateY, Math.min(translateY, maxTranslateY));
      this.set('translateY', translateY);
    } else {
      this.set('translateY', 0);
    }
  },

  onMouseDown(event) {
    if (this.get('scale') > 1) {
      this.set('isDragging', true);
      this.set('startX', event.clientX - this.get('translateX'));
      this.set('startY', event.clientY - this.get('translateY'));
      this.get('videoElement').style.cursor = 'grabbing';
      event.preventDefault();
    }
  },

  onMouseMove(event) {
    if (this.get('isDragging')) {
      let translateX = event.clientX - this.get('startX');
      let translateY = event.clientY - this.get('startY');
      this.set('translateX', translateX);
      this.set('translateY', translateY);
      this.updateTransform();
    }
  },

  onMouseUp() {
    if (this.get('isDragging')) {
      this.set('isDragging', false);
      this.get('videoElement').style.cursor = 'grab';
    }
  },
});
