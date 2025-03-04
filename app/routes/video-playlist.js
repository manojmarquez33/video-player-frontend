import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    console.log("Playlist name:", params.playlist_name);

    return Ember.$.getJSON(`http://localhost:8080/VideoPlayer_war_exploded/PlaylistServlet?playlist=${encodeURIComponent(params.playlist_name)}`)
      .then(videoFiles => {
        console.log("Filtered videos inside playlist:", videoFiles);

        let videoList = videoFiles.map(file => ({
          fileName: file.fileName,
          url: file.url
        }));

        return { videoList };
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        console.error("Error fetching playlist:", textStatus, errorThrown);
        return { videoList: [] };
      });
  }
});
