import Ember from 'ember';
import ZoomDragMixin from '../../../mixins/zoom-drag';
import { module, test } from 'qunit';

module('Unit | Mixin | zoom drag');

// Replace this with your real tests.
test('it works', function(assert) {
  let ZoomDragObject = Ember.Object.extend(ZoomDragMixin);
  let subject = ZoomDragObject.create();
  assert.ok(subject);
});
