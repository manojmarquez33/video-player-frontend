import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    console.log("✅ Video name received:", params.video_name);

    return Ember.$.getJSON(`http://localhost:8080/VideoPlayer_war_exploded/VideoServlet?video=${encodeURIComponent(params.video_name)}`)
      .then(response => {
        console.log("✅ Video details fetched:", response);
        return response;
      })
      .catch(error => {
        console.error("❌ Error fetching video details:", error);
        return {};
      });
  }
});
