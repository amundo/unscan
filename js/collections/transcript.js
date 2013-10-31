app.Transcript = Backbone.Collection.extend({

  model: app.Transcription,

  parse: function(data){
    console.log(data);
    return data;
  }

})
