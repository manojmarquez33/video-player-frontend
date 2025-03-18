import Ember from "ember";

export function includes(params) {
  let [array, value] = params;
  return array.includes(value);
}

export default Ember.Helper.helper(includes);
