import Ember from 'ember';

export function detectTime(params) {
  let commentText = params[0];
  if (!commentText) {
    return "";
  }

  let regex = /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g;

  let processedText = commentText.replace(regex, (match) => {
    return `<span class="timestamp" data-time="${match}">${match}</span>`;
  });

  return new Ember.Handlebars.SafeString(processedText);
}

export default Ember.Helper.helper(detectTime);

