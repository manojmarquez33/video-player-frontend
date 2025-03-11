import Ember from 'ember';
import AppConfig from "../config/app-config";

export default Ember.Route.extend({
  model(params) {
    console.log("Fetching videos for playlist:", params.playlist_name);

    return Ember.$.getJSON(`${AppConfig.VideoServlet_API_URL}?playlist=${encodeURIComponent(params.playlist_name)}`)
      .then(response => {
        console.log(" response from server:", response);

        let id = response.playlist_id;

        let videoList = response.videos.map(file => ({
          fileName: file.fileName,
          url: file.url,
          createdAgo: file.createdAgo,
          size: file.size,
          lastModified: file.lastModified
        }));

        console.log("Playlist ID:", id);
        console.log("Processed video list:", videoList);

        return {
          id,
          playlistName: params.playlist_name,
          videoList
        };
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        console.error("Error fetching playlist:", textStatus, errorThrown);
        console.error("Server Response:", jqXHR.responseText);
        return {
          playlistId: null,
          playlistName: params.playlist_name,
          videoList: []
        };
      });
  }
});
