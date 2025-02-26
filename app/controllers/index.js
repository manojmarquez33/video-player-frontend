import Ember from 'ember';

export default Ember.Controller.extend({
  searchQuery: '',

  filteredVideos: Ember.computed('model', 'searchQuery', function() {
    let query = this.get('searchQuery').toLowerCase();
    return this.get('model').filter(video => video.fileName.toLowerCase().includes(query));
  }),

  actions: {
    searchVideos() {
      //console.log("curent search:", this.get('searchQuery'));
      this.notifyPropertyChange('filteredVideos');
    }
  }
});
