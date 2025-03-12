
import Ember from 'ember';

export default Ember.Route.extend({
  session: Ember.inject.service(),

  beforeModel() {
    return this.get('session').fetchUsernameFromSession().then(function (username) {
      if (!username) {
        alert("You are not logged in.");
        this.transitionTo("login");
      }
    }.bind(this))
      .catch(function () {
        alert("You are not logged in.");
        this.transitionTo("login");
      }.bind(this));
  },

  model: function () {
    return Ember.$.getJSON("http://localhost:8080/VideoPlayer_war_exploded/VideoServlet");
  }
});




// import Ember from 'ember';
//
// export default Ember.Route.extend({
//   session: Ember.inject.service(),
//
//   beforeModel() {
//     let self = this;
//
//     return this.get('session').fetchUsernameFromSession().then((username) => {
//       if (!username) {
//         alert("You are not logged in.");
//         self.transitionTo("login");
//       }
//     }).catch(() => {
//       alert("You are not logged in.");
//       self.transitionTo("login");
//     });
//   },
//
//   // beforeModel: function () {
//   //   var self = this;
//   //
//   //   return Ember.$.ajax({
//   //     url: "http://localhost:8080/VideoPlayer_war_exploded/check-session",
//   //     method: "GET",
//   //     xhrFields: {
//   //       withCredentials: true
//   //     }
//   //   }).done(function (data) {
//   //     if (!data.success) {
//   //       alert("You are not logged in.");
//   //       self.set("user", data.username);
//   //       self.transitionTo("login");
//   //     } else {
//   //       console.log("User authenticated:", data.username);
//   //     }
//   //   }).fail(function () {
//   //     alert("Error verifying session.");
//   //     self.transitionTo("login");
//   //   });
//   // },
//
//   model: function () {
//     return Ember.$.getJSON("http://localhost:8080/VideoPlayer_war_exploded/VideoServlet");
//   }
// });





// import Ember from 'ember';
  //
  // export default Ember.Route.extend({
  //   session: Ember.inject.service(),
  //
  //   beforeModel() {
  //     let sessionId = this.get('session').getCookie("sessionId");
  //     //let username = this.get('session').getCookie("username");
  //
  //     if (!sessionId) {
  //         alert('You are not logged in.');
  //       this.transitionTo('login');
  //     }
  //   },
  //
  //   model() {
  //     return Ember.$.getJSON('http://localhost:8080/VideoPlayer_war_exploded/VideoServlet');
  //   }
  // });
