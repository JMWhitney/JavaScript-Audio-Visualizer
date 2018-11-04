
var guassianDistribution = function(x, a, b, c){
    //This function returns a normal distribution with a peak height of a, center position of b, and Gaussian RMS width of c.
    //More information here https://en.wikipedia.org/wiki/Gaussian_function
    return a * Math.pow(Math.E, -1.0*((x-b)*(x-b))/(2*(c*c)));
}


window.onload = function() {
  
    var file = document.getElementById("thefile");
    var audio = document.getElementById("audio");
    
    file.onchange = function() {

      //Create audio source and connect it to the input file
      //You could potentially use microphone input.
      var files = this.files;
      audio.src = URL.createObjectURL(files[0]);
      audio.load();
      audio.play();
      var context = new AudioContext();
      var src = context.createMediaElementSource(audio);
      var analyser = context.createAnalyser();
  
      //Create and initialize drawing space
      var canvas = document.getElementById("canvas");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      var ctx = canvas.getContext("2d");


      //Connect audio node analyser and adjust settings
      src.connect(analyser);
      analyser.connect(context.destination);
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.9;
      //analyser.minDecibels = -90;
      //analyser.maxDecibels = -10;
      
      //Variable information used for drawing the bands of the visualizer
      //Default audio context includes frequencies well above the audible range.
      //To adjust this we truncate frequencyBinCount to include only audible frequencies.
      //This results in a more pleasing aesthetic.
      var bufferLength = Math.floor(analyser.frequencyBinCount/ 1.50); 
      var dataArray = new Uint8Array(bufferLength);
      var WIDTH = canvas.width;
      var HEIGHT = canvas.height;
      var barWidth = (WIDTH / bufferLength);
      var barHeight;
      var x = 0;

      //Print information for debugging.
      console.log("Buffer Length: ", bufferLength);
      console.log("HEIGHT: ", HEIGHT);
      console.log("WIDTH: ", WIDTH);
      console.log("barWidth: ", barWidth);
      console.log("maxDB: ", analyser.maxDecibels);
      console.log("minDB: ", analyser.minDecibels);
      console.log("sampleRate: ", context.sampleRate);
      console.log("Smoothing Time Constant: ", analyser.smoothingTimeConstant);
  
      function renderFrame() {
        requestAnimationFrame(renderFrame);
        analyser.getByteFrequencyData(dataArray);

        //console.log(dataArray, ' , ');
        
        //Color background black
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        //Draw each frequency band with the appropriate color, size, and location.
        for (var i = 0; i < bufferLength; i++) {
          barHeight = 4*dataArray[i];
          x = i*barWidth;
          
          //RGB color value depends on the location of the bar in the length of the buffer
          var r = guassianDistribution(i, 255, 0, bufferLength/4);                 //Color bass frequencies red
          var g = guassianDistribution(i, 255, bufferLength/2, bufferLength/4);    //Color midrange frequencies green
          var b = guassianDistribution(i, 255, bufferLength, bufferLength/4);    //Color highend frequencies blue

          ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
          ctx.fillRect(x, HEIGHT-barHeight, barWidth, barHeight);
  
        }
      }
  
      renderFrame();
    };
  };