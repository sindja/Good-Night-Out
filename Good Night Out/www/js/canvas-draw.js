/*<html>
 <body onload="draw();">
   <canvas id="canvas" width="150" height="200"></canvas>
 </body>
</html>*/



function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext){
    var ctx = canvas.getContext('2d');

     // ctx.fillStyle = "#0000ff";
        ctx.strokeStyle = "#030060";
    ctx.lineWidth = 10;
        ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
     var x = 25+50; // x coordinate
        var y = 25+50; // y coordinate
        var radius = 32; // Arc radius
        var startAngle = 0; // Starting point on circle
        var endAngle = 2*Math.PI //-(Math.PI)/8; // End point on circle
        var anticlockwise = true; // clockwise or anticlockwise
   

        ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
          ctx.stroke();
     ctx.beginPath();
    
    ctx.lineWidth = 10;
        var x = 25+50; // x coordinate
        var y = 25+50; // y coordinate
        var radius = 20; // Arc radius
        var startAngle = 0; // Starting point on circle
        var endAngle = 2.11*Math.PI //-(Math.PI)/8; // End point on circle
        var anticlockwise = true; // clockwise or anticlockwise

        ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
          ctx.stroke();
     ctx.beginPath();

      ctx.moveTo(55,75);
      ctx.lineTo(99.65,75);
    
     ctx.moveTo(75,93);
      ctx.lineTo(75,120);
    
     ctx.moveTo(75,57);
      ctx.lineTo(75,30);
      ctx.stroke();
      
  }

}
