function analyzeReference(reference){
    
    var parts = reference.trim().split(':');
    
    var volume = parts[0];
    var reel = String(parseInt(parts[1]));
    var slide = parts[2];
    
    var side = slide.replace(/[\d]+/,'');
    var slide = slide.replace(side, '');
    var line = parts[3];
    var line2 = parts[4];
    
    return {
      volume: volume,
      reel: reel,
      slide: slide,
      side: side,
      line: line,
      line2: line2
    }
}

var sample = " 3:005:0005b:1:2";

function buildArchivalURL(base, reference){
  var analysis = analyzeReference(reference);
  return [base, analysis.volume, analysis.reel, analysis.slide].join('/') + '.jpg'
}

function scanURL(reference){
  return buildArchivalURL('http://glyph.local/~pat/Archives/Harrington', reference);
}


