import Ember from 'ember';

export default Ember.Service.extend({
  user: null,

  init() {
    this._super();
    this.fetchUsernameFromSession();
  },

  fetchUsernameFromSession() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/check-session",
        method: "GET",
        xhrFields: { withCredentials: true },
      }).done(function (data) {
        if (data.success && data.username) {
          console.log("Session start for user:", data.username);
          this.set("user", data.username);
          resolve(data.username);
        } else {
          console.log("No session or no username.");
          this.set("user", null);
          reject("No valid session");
        }
      }.bind(this))
        .fail(function () {
          console.error("Error checking session.");
          this.set("user", null);
          reject("Session check failed");
        }.bind(this));
    });
  },

  getUsername() {
    return this.get('user');
  },

  logout() {
    this.set("user", null);
  }
});




// import Ember from 'ember';
  //
  // export default Ember.Service.extend({
  //   user: null,
  //   sessionId: null,
  //
  //   init() {
  //     this._super(...arguments);
  //
  //     let storedUser = this.getCookie("username");
  //     let storedSession = this.getCookie("sessionId");
  //
  //     console.log("Loaded from cookies - Username:", storedUser, "Session ID:", storedSession);
  //
  //     this.set('user', storedUser || null);
  //     this.set('sessionId', storedSession || null);
  //   },
  //
  //   setUser(user, sessionId) {
  //     if (!user || !sessionId) {
  //       console.error("Invalid user or session ID received:", user, sessionId);
  //       return;
  //     }
  //
  //     this.set('user', user);
  //     this.set('sessionId', sessionId);
  //   },
  //
  //   isAuthenticated() {
  //     return !!this.get('sessionId');
  //   },
  //
  //   logout() {
  //     this.set('user', null);
  //     this.set('sessionId', null);
  //
  //
  //     document.cookie = "username=; path=/; Max-Age=0;";
  //     document.cookie = "sessionId=; path=/; Max-Age=0;";
  //   },
  //
  //
  //   getCookie(name) {
  //     let cookieName = name + "=";
  //     let cookiesArray = document.cookie.split(";");
  //
  //     for (let cookie of cookiesArray) {
  //       cookie = cookie.trim();
  //       if (cookie.startsWith(cookieName)) {
  //         return cookie.substring(cookieName.length);
  //       }
  //     }
  //     return null;
  //   }
  // });


  // import Ember from 'ember';
  //
  // export default Ember.Service.extend({
  //   user: null,
  //   sessionId: null,
  //
  //   init() {
  //     this._super(...arguments);
  //
  //     let storedUser = this.getCookie("username");
  //     let storedSession = this.getCookie("sessionId");
  //
  //     console.log("Loaded from cookies - Username:", storedUser, "Session ID:", storedSession);
  //
  //         this.set('user', storedUser || null);
  //         this.set('sessionId', storedSession || null);
  //       },
  //
  //   setUser(user, sessionId) {
  //     if (!user || !sessionId) {
  //       console.error("Invalid user or session ID received:", user, sessionId);
  //       return;
  //     }
  //
  //     this.set('user', user);
  //     this.set('sessionId', sessionId);
  //
  //     let days = 1;
  //     let expires = new Date();
  //     expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  //
  //     document.cookie = "username=" + user + "; path=/; expires=" + expires.toUTCString();
  //     document.cookie = "sessionId=" + sessionId + "; path=/; expires=" + expires.toUTCString();
  //
  //     console.log("User stored in cookies:", user);
  //   },
  //
  //   // setCookie(name, value, days) {
  //   //   let expires = "";
  //   //
  //   //   if (days) {
  //   //     let currentDate = new Date();
  //   //     let expiration = days * 24 * 60 * 60 * 1000;
  //   //     currentDate.setTime(currentDate.getTime() + expiration);
  //   //     expires = "; expires=" + currentDate.toUTCString();
  //   //   }
  //   //   document.cookie = name + "=" + value + "; path=/" + expires;
  //   // },
  //
  //
  //   isAuthenticated() {
  //     return !!this.get('sessionId');
  //   },
  //
  //
  //   logout() {
  //     this.set('user', null);
  //     this.set('sessionId', null);
  //
  //     this.deleteCookie("username");
  //     this.deleteCookie("sessionId");
  //   },
  //
  //
  //   getCookie(name) {
  //     let cookieName = name + "=";
  //     let cookiesArray = document.cookie.split(";");
  //
  //     for (let cookie of cookiesArray) {
  //       cookie = cookie.trim();
  //       if (cookie.startsWith(cookieName)) {
  //         return cookie.substring(cookieName.length);
  //       }
  //     }
  //     return null;
  //   },
  //
  //
  //   deleteCookie(name) {
  //     document.cookie = name + "=; Max-Age=-99999999;";
  //   }
  // });
