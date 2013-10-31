app.Transcription = Backbone.Model.extend({

  defaults : { 
    volume: '3',
    reel: '005',
    slide: '0001',
  },

  urlRoot: '../Archives/Harrington/',

  url: function(){
     return "../Archives/Harrington/" + [this.volume, this.reel, this.slide, '.jpg'].join('/')
  },

  initialize: function(options){

  }

})

