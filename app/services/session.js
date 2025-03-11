import Ember from 'ember';

export default Ember.Service.extend({
  user: null,
  sessionId: null,

  init() {
    this._super(...arguments);

    let storedUser = Ember.$.cookie("username");
    let storedSession = Ember.$.cookie("sessionId");

    console.log("Loaded from cookies - Username:", storedUser, "Session ID:", storedSession);

    this.set('user', storedUser || null);
    this.set('sessionId', storedSession || null);
  },

  setUser(user, sessionId) {
    if (!user || !sessionId) {
      console.error("Invalid user or session ID received:", user, sessionId);
      return;
    }

    this.set('user', user);
    this.set('sessionId', sessionId);

    Ember.$.cookie("username", user, { path: "/" });
    Ember.$.cookie("sessionId", sessionId, { path: "/" });

    console.log("User stored in cookies:", user);
  },

  isAuthenticated() {
    return !!this.get('sessionId');
  },

  logout() {
    this.set('user', null);
    this.set('sessionId', null);

    Ember.$.removeCookie("username", { path: "/" });
    Ember.$.removeCookie("sessionId", { path: "/" });
  }
});
