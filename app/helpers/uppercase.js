import Ember from "ember";


export function uppercase([text]) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  return text.charAt(0).toUpperCase();
}


export default Ember.Helper.helper(uppercase);
