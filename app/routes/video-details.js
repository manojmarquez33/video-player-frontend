import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    console.log("✅ Video name received:", params.video_name);

    return Ember.$.getJSON(`http://localhost:8080/VideoPlayer_war_exploded/VideoServlet?video=${encodeURIComponent(params.video_name)}&metadata=true`)

      .then(response => {
        console.log("✅ Video details fetched:", response);
        return response;
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        console.error("❌ Error fetching video details:");
        console.error("Status:", textStatus);
        console.error("Error Thrown:", errorThrown);
        console.error("Response Text:", jqXHR.responseText);
        return {};
      });

  }
});
