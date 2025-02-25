import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    console.log("✅ Fetching playlist:", params.playlist_id);

    return Ember.$.getJSON(`http://localhost:8080/VideoPlayer_war_exploded/VideoServlet?playlist=${encodeURIComponent(params.playlist_id)}`)
      .then(videoFiles => {
        console.log("✅ Playlist videos fetched:", videoFiles);

        // Convert filenames into video objects
        let videoList = videoFiles.map(file => ({
          fileName: file.fileName,
          url: file.url
        }));

        return { videoList };
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        console.error("❌ Error fetching playlist:", textStatus, errorThrown);
        return { videoList: [] };
      });
  }
});
