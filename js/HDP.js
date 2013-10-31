window.app = {} ;


app.hdp2unicode = function(text, rules){
  var rules = [
    { before: '∂', after: 'ə' },
    { before: '£', after: 'ł' },
    { before: '´', after: '\u0301'},
    { before: '˘', after: '\u030C'},
    { before: '√', after: '\u030C'}

  ];

  rules.forEach(function(rule){
    var before = rule.before,
        after  = rule.after;

    if(!text){
      return
    } else { 
      text = text.replace(before, after, 'g');
    }

  })  
  return text;
}



app.Frame = Backbone.Model.extend({

  defaults: {
    current: false
  },

  initialize: function(){
    var self = this;
    this.parseReference();
    this.set('src', this.imagePath());
    this.set({'text': app.hdp2unicode(self.get('text'))}) ;
    this.set({'word': app.hdp2unicode(self.get('word')) }) ;
  },

  parseReference: function(){
    if(this.get('reference')){
      var parts = this.get('reference').split(':'); // Vol:reel:frame:para:sentence
      this.set({ 
        'volume': parts[0],
        'reel': parts[1],
        'frame': parts[2].slice(0,4)
      })
    }
    this.set('id', this.get('reference'));
  },

  imagePath: function(){
    return '../Archives/HDP_Chumash_Obispeno/' + this.get('volume') + '/' + this.get('reel') + '/' + this.get('frame') + '.jpg'
  }

})

app.Frames = Backbone.Collection.extend({
  model: app.Frame,

  initialize: function(options){
    _.bindAll(this, 'getCurrent', 'setCurrent', 'next', 'previous', 'firstContaining', 'random');

    var self = this;
    this.collection = options.collection; 
    this.url = options.url;

    this.deferred = this.fetch({ dataType: 'text' });

    this.deferred.done(function(){ 
      self.current = self.at(0);
      self.current.set({current: true});
    })


  },

  getCurrent: function(){
    return this.current;
  },

  random: function(){
    var self = this;
    var randomId = this.at(_.random(this.length)).get('id');
    this.setCurrent(randomId);
  },

  setCurrent: function(id){
    this.current.set({ current: false }); 

    var newCurrent = this.get(id);
    newCurrent.set({ current: true }); 
    this.current = newCurrent;
  },

  firstContaining: function(query){
    var matches =  this.select(function(f){ 
      return f.get('text').indexOf(query) > -1
    });
    if(matches[0]){
      console.log(JSON.stringify(matches[0].toJSON(), null, 2));
      this.setCurrent(matches[0].get('id'));
    }
  },

  next: function(){
    var offset = Math.min(this.indexOf(this.current) + 1, this.length);
    var nextId = this.at(offset).get('id');
    this.setCurrent(this.get(nextId));
  },

  previous: function(){
    var offset = Math.max(this.indexOf(this.current) - 1, 0);
    var prevId = this.at(offset).get('id');
    this.setCurrent(this.get(prevId));
  },

  // parse one of these tab-delimited lines from the UC DAVIS HDP data file: 
  // 3:005:0003b:1:1  mis˘nas˘aks˘a ’  yatpapa, quienro tatemar las papas.    mis√nas√aks√a ’  yatpapa    quienro tatemar las papas        
  parse: function(response){
    var lines = response.split(/\n/),
        //headers = lines[0].split(/\t/), /* use simpler labels below */
        data = [];

    response = response.trim();

    var headers = [ 
      'reference',   // Vol:reel:frame:para:sentence
      'text',     // Text
      'abbreviation',   // Consultant's abbrev
      'word',     // Indian word
      'en_HAR',   // English(Har)
      'es_HAR',   // Spanish(Har)
      'domain',   // Semantic domain
      'genre',     // Genre
      'level1',   // Level 1 notes
      'en_HDP',   // English gloss of H's Spanish
      'sci_HAR',   // Sciname(Har)
      'sci_HDP',   // Sciname(HDP)
      'consultant',   // Consultant's name"
    ];

    this.headers = headers;

    lines = lines.slice(1,lines.length);

    lines.forEach(function(line){
      var fields = line.split(/\t/);
      if(fields.length  == 13){ 
        var model = _.object(_.zip(headers, fields)); 
        data.push(model);
      }
    })

    return data;
  }

})

app.FrameView = Backbone.View.extend({ 
  el: 'main',

  initialize: function(options){ 
    _.bindAll(this, 'render');

    var self = this;
    this.collection = options.collection;

    this.template = _.template($('#frameTemplate').html());

    this.collection.deferred.done(function(){
      self.render();
    });

    this.listenTo(this.collection, 'change:current', this.render); 
  },

  render: function(){

    this.el.querySelector('img').src = this.collection.current.get('src');
    this.$el.find('img').wheelzoom();
    var html = this.template(this.collection.current.toJSON());
    this.$('.transcription').html(html);
  }

})

app.NavView = Backbone.View.extend({ 
  el: 'nav',

  initialize : function(options){
    this.collection = options.collection;
    _.bindAll(this, 'render', 'previous','next', 'jumpTo', 'random');
    this.listenTo(this.collection, 'change:current', this.render);
  },

  events : { 
    'click button#random': 'random',
    'click button#jumpTo': 'jumpTo',
    'click button#prev': 'previous',
    'click button#next': 'next'
  },

  next: function(){
    this.collection.next()
  },

  previous: function(){
    this.collection.previous()
  },

  random: function(){
    this.collection.random()
  },

  render: function(){
    this.$('#frameId').val(this.collection.getCurrent());
  },

  jumpTo: function(){
    var jumpToId = this.$('#frameId').val().trim();
    this.collection.setCurrent(jumpToId);
  }
  
})


$(function(){ 

  app.frames = new app.Frames({ 
    url: '../Archives/HDP_Chumash_Obispeno/JPH-vol3-reel5-obispeno.txt'
  })
  
  app.frameView = new app.FrameView({
    collection: app.frames 
  })

  app.navView = new app.NavView({
    collection: app.frames
  })

  //$('#frame img').wheelzoom();
  
  
})
