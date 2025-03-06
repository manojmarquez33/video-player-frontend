import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    console.log("Fetching videos for playlist:", params.playlist_name);

    return Ember.$.getJSON(`http://localhost:8080/VideoPlayer_war_exploded/VideoServlet?playlist=${encodeURIComponent(params.playlist_name)}`)
      .then(videoFiles => {
        console.log("Filtered videos inside playlist:", videoFiles);

        let videoList = videoFiles.map(file => ({
          fileName: file.fileName,
          url: file.url,
          createdAgo: file.createdAgo,
          size: file.size,
          lastModified: file.lastModified
        }));

        return {
          playlistName: params.playlist_name,  // ✅ Store the playlist name in the model
          videoList
        };
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        console.error("Error fetching playlist:", textStatus, errorThrown);
        return {
          playlistName: params.playlist_name,  // ✅ Store the playlist name even if the request fails
          videoList: []
        };
      });
  }
});
