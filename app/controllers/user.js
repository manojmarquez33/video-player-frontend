import Ember from "ember";


export default Ember.Controller.extend({
  session: Ember.inject.service(),
  showInterestModal: false,
  allInterests: [],
  filteredInterests: [],
  selectedInterestIds: [],
  likedVideos: [],
  dislikedVideos: [],
  userVideos: [],
  loadingLikedVideos: true,
  loadingDislikedVideos: true,
  loadingUserVideos: true,
  activeTab: "yourVideos",
  showProfileModal: false,
  editUsername: null,
  editEmail: null,
  editProfilePicture: null,
  editFullname: null,

  init() {
    this._super(...arguments);
    this.fetchUserDetails();
    this.fetchUserVideos();
    this.fetchLikedAndDislikedVideos();
  },

  actions: {
    setActiveTab(tabName) {
      this.set("activeTab", tabName);
    },


    // fetchThumbnails(video) {
    //   console.log("Fetching thumbnail for:", video);
    //
    //   if (video.url) {
    //     video.thumbnail = video.url;
    //   } else {
    //     console.error("Video URL missing for thumbnail generation.");
    //   }
    // },

    uploadVideo() {
      let fileInput = document.getElementById("videoFile");
      let hashtagsInput = document.getElementById("hashtags");

      if (!fileInput.files.length) {
        alert("Please select a vidoe file.");
        return;
      }

      let file = fileInput.files[0];
      let hashtags = hashtagsInput.value.trim();
      let formData = new FormData();
      formData.append("video", file);
      formData.append("hashtags", hashtags);

      Ember.$.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/VideoUploadServlet",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        xhrFields: { withCredentials: true },
        success: () => {
          alert("Video uploaded successfully!");
          this.fetchUserVideos();
        },
        error: (xhr) => {
          alert("Failed to upload video.");
          console.error(xhr);
        },
      });
    },

    openInterestModal() {
      console.log("Opening interest modal...");
      this.set("showInterestModal", true);

      if (this.get("allInterests").length === 0) {
        this.fetchInterests();
      }
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
      Ember.$.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/update-interests",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ interests: this.get("selectedInterestIds") }),
        xhrFields: { withCredentials: true },
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
        },
      });
    },

    openProfileModal() {
      this.set("editUsername", this.get("model.profile.username"));
      this.set("editEmail", this.get("model.profile.email"));
      this.set("editProfilePicture", this.get("model.profile.profilePicture"));

      let fullname = this.get("model.profile.fullname") || "Unknown User";
      this.set("editFullname", fullname);

      this.set("showProfileModal", true);
    },


    closeProfileModal() {
      this.set("showProfileModal", false);
    },

    updateField(field, value) {
      if (!field) {
        console.error("updateField received an undefined field.");
        return;
      }
      console.log(`Updating field: ${field} with value: ${value}`);
      this.set(field, value);
    },


    uploadProfilePicture(event) {
      let file = event.target.files[0];
      if (file) {
        let reader = new FileReader();
        reader.onload = (e) => {
          this.set("editProfilePicture", e.target.result);
        };
        reader.readAsDataURL(file);
      }
    },

    saveProfileChanges() {
        let formData = new FormData();

      let username = this.get("editUsername");
      username = username ? username.trim() : "";

      let email = this.get("editEmail");
      email = email ? email.trim() : "";

      let fullname = this.get("editFullname");
      fullname = fullname ? fullname.trim() : "Unknown User";


      if (!username) {
        alert("Error: Username cannot be empty.");
        return;
      }

      formData.append("username", username);
      formData.append("email", email);
      formData.append("fullname", fullname);

      let fileInput = document.getElementById("profilePictureInput");
      if (fileInput.files.length > 0) {
        formData.append("profilePicture", fileInput.files[0]);
      }

      console.log("Sending profile update:", {
        username: username,
        email: email,
        fullname: fullname,
      });

      Ember.$.ajax({
        url: "http://localhost:8080/VideoPlayer_war_exploded/user-profile",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        xhrFields: { withCredentials: true },
        success: () => {
          alert("Profile updated successfully!");
          this.fetchUserDetails();
          this.set("showProfileModal", false);
        },
        error: (xhr) => {
          console.error("Failed to update profile:", xhr);
          alert("Profile update failed.");
        },
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
      },
    });
  },

  fetchUserVideos() {
    this.set("loadingUserVideos", true);
    Ember.$.ajax({
      url: "http://localhost:8080/VideoPlayer_war_exploded//user-profile",
      type: "GET",
      xhrFields: { withCredentials: true },
      success: (data) => {
        console.log("Fetched user videos:", data);
        this.set("userVideos", data);
        this.set("loadingUserVideos", false);
       // this.send("fetchThumbnails", data);
      },
      error: (xhr) => {
        console.error("Error fetching user videos:", xhr);
        alert("Failed to fetch uploaded videos.");
        this.set("loadingUserVideos", false);
      },
    });
  },

  fetchLikedAndDislikedVideos() {
    this.set("loadingLikedVideos", true);
    this.set("loadingDislikedVideos", true);

    Ember.$.ajax({
      url: "http://localhost:8080/VideoPlayer_war_exploded/liked-videos",
      type: "GET",
      xhrFields: { withCredentials: true },
      success: (data) => {
        console.log("Fetched liked/disliked videos:", data);
        this.set("likedVideos", data.liked_videos || []);
        this.set("dislikedVideos", data.disliked_videos || []);
        this.set("loadingLikedVideos", false);
        this.set("loadingDislikedVideos", false);
       // this.send("fetchThumbnails", data);
      },
      error: (xhr) => {
        console.error("Error fetching liked/disliked videos:", xhr);
        alert("Failed to fetch liked/disliked videos.");
        this.set("loadingLikedVideos", false);
        this.set("loadingDislikedVideos", false);
      },
    });
  },


  fetchInterests() {
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
});
