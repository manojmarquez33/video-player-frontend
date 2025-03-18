import Ember from "ember";

export function indexOf(params) {
  let [array, value] = params;
  if (!Array.isArray(array)) {
    return -1;
  }
  return array.indexOf(value);
}

export default Ember.Helper.helper(indexOf);
