import Ember from "ember";

export default Ember.Controller.extend({
  session: Ember.inject.service(),
  showInterestModal: false,
  allInterests: [],
  filteredInterests: [],
  selectedInterestIds: [],
  likedVideos: [],
  dislikedVideos: [],
  loadingLikedVideos: true,
  loadingDislikedVideos: true,


  init() {
    this._super(...arguments);
    this.fetchUserDetails();
    this.fetchLikedAndDislikedVideos();
  },

  actions: {
    openInterestModal() {
      this.set("showInterestModal", true);
      Ember.$.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/interests",
        type: "GET",
        success: (data) => {
          this.set("allInterests", data);
          this.set("filteredInterests", data);
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

    updateUserInterests() {
      let selectedInterests = this.get("selectedInterestIds");

      Ember.$.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/update-interests",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          interests: selectedInterests
        }),
        xhrFields: {
          withCredentials: true
        },
        success: () => {
          alert("Interests updated successfully!");
          this.set("showInterestModal", false);
        },
        error: (xhr) => {
          if (xhr.status === 401) {
            alert("Unauthorized: Please log in again.");
            this.transitionToRoute("login");
          } else {
            alert("Failed to update interests.");
          }
        }
      });
    }
  },


  fetchUserDetails() {
    Ember.$.ajax({
      url: "http://localhost:8080/VideoPlayer_war_exploded/user-profile",
      type: "GET",
      xhrFields: { withCredentials: true },
      success: (data) => {
        console.log("Fetched user details:", data);
        this.set("model", data);
      },
      error: (xhr) => {
        console.error("Error fetching user details:", xhr);
        alert("Failed to fetch user details.");
      }
    });
  },

  fetchLikedAndDislikedVideos() {
    Ember.$.ajax({
      url: "http://localhost:8080/VideoPlayer_war_exploded/liked-videos",
      type: "GET",
      xhrFields: { withCredentials: true },
      success: (data) => {
        console.log("Fetched liked videos:", data);
        this.set("likedVideos", data.liked_videos || []);
        this.set("dislikedVideos", data.disliked_videos || []);
        this.set("loadingLikedVideos", false);
        this.set("loadingDislikedVideos", false);
      },
      error: (xhr) => {
        console.error("Error fetching liked videos:", xhr);
        alert("Failed to fetch liked/disliked videos.");
      }
    });
  }
});
