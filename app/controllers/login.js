import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service(),

  actions: {
    login() {
      let username = this.get('username');
      let password = this.get('password');

      if (!username || !password) {
        alert('Please enter username and password.');
        return;
      }

      Ember.$.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/login",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ username, password }),
        xhrFields: { withCredentials: true },
      }).then(response => {
        console.log("Login Response:", response);

        if (response.success) {

          //this.get('session').setUser(response.user, response.sessionId);
          console.log("Username stored in session:", response.user);

          this.transitionToRoute('index');
        } else {
          alert('Invalid username or password.');
        }
      }).fail(() => {
        alert('Login failed. Check your server.');
      });
    }
  }
});

