import Ember from 'ember';
import AppConfig from "../config/app-config";

export default Ember.Route.extend({
  model(params) {
    console.log("Fetching videos for playlist:", params.playlist_name);

    return Ember.$.getJSON(`${AppConfig.VideoServlet_API_URL}?playlist=${encodeURIComponent(params.playlist_name)}`)
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
