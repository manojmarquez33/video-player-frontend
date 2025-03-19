import Ember from "ember";

export function substr(params) {
  let [string, start, length] = params;
  if (typeof string !== "string") {
    return "";
  }
  return string.substring(start, start + length);
}

export default Ember.Helper.helper(substr);
