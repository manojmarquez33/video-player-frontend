import Ember from "ember";

export default Ember.Controller.extend({
  errorMessage: null,

  actions: {
    registerUser() {
      let username = this.get("username");
      let email = this.get("email");
      let password = this.get("password");
      let confirmPassword = this.get("confirmPassword");

      if (!username || !email || !password || !confirmPassword) {
        this.set("errorMessage", "All fields are required.");
        return;
      }

      if (password !== confirmPassword) {
        this.set("errorMessage", "Passwords do not match.");
        return;
      }

      Ember.$.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/signup",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ username, email, password }),
        success: () => {
          alert("Registration successful! Please log in.");
          this.transitionToRoute("login");
        },
        error: (xhr) => {
          this.set("errorMessage", xhr.responseText || "Registration failed.");
        },
      });
    },
  },
});
