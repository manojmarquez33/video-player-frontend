import Ember from 'ember';
import VideoUtilsMixin from '../../../mixins/video-utils';
import { module, test } from 'qunit';

module('Unit | Mixin | video utils');

// Replace this with your real tests.
test('it works', function(assert) {
  let VideoUtilsObject = Ember.Object.extend(VideoUtilsMixin);
  let subject = VideoUtilsObject.create();
  assert.ok(subject);
});
