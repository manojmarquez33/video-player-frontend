import Ember from "ember";

export default Ember.Controller.extend({
  errorMessage: null,
  showInterestModal: false,
  selectedInterestIds: [],
  allInterests: [],
  filteredInterests: [],

  actions: {

    openInterestModal() {
      this.set("showInterestModal", true);

      this.set("allInterests", []);
      this.set("filteredInterests", []);

      Ember.$.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/interests",
        type: "GET",
        success: (data) => {
          let uniqueInterests = [];
          let seen = new Set();

          data.forEach((interest) => {
            if (!seen.has(interest.interest_name)) {
              seen.add(interest.interest_name);
              uniqueInterests.push(interest);
            }
          });

          this.set("allInterests", uniqueInterests);
          this.set("filteredInterests", uniqueInterests);
        },
        error: () => {
          alert("Failed to fetch interests.");
        },
      });
    },

    closeInterestModal() {
      this.set("showInterestModal", false);
    },

    filterInterests(query) {
      let filtered = this.get("allInterests").filter((interest) =>
        interest.interest_name.toLowerCase().includes(query.toLowerCase())
      );
      this.set("filteredInterests", filtered);
    },

    toggleInterest(interestId) {
      let selectedInterestIds = this.get("selectedInterestIds");
      if (selectedInterestIds.includes(interestId)) {
        this.set("selectedInterestIds", selectedInterestIds.filter((id) => id !== interestId));
      } else {
        this.set("selectedInterestIds", [...selectedInterestIds, interestId]);
      }
    },

    registerUser() {
      let username = this.get("username");
      let fullname = this.get("fullname");
      let email = this.get("email");
      let password = this.get("password");
      let confirmPassword = this.get("confirmPassword");
      let interestIds = this.get("selectedInterestIds");

      if (!username ||!fullname || !email || !password || !confirmPassword) {
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
        data: JSON.stringify({ username,fullname,email, password, interestIds }),
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
