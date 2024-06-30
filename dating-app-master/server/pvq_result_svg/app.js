const { createCanvas } = require("canvas");
const express = require('express')
const app = express()
const port = 80

app.get('/random', (req, res) => {

  const inputs = Array.from({ length: 10 }, () => Math.floor(Math.random() * 91) + 10);

  const svg = generateSvg(inputs);


  res.send(`
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PVQ Retult</title>
</head>
<body>
${svg}
</body>
</html>

<style>
    body, html {
        margin: 0;
        padding: 0;
        background-color: black;
    }
    body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100vw;
    }
</style>
`);

});

app.get('/result/:param1/:param2/:param3/:param4/:param5/:param6/:param7/:param8/:param9/:param10', (req, res) => {

  const inputs = Object.values(req.params);

  let svg

  try {
    svg = generateSvg(inputs);
    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) { 
    console.error(error);
    res.send("something went wrong");
  }

   

  

});

app.get('/', (req, res) => {
    res.send(`
=
<html>
<head>
  <title>PVQ Sample</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }

    h1 {
      text-align: center;
    }

    form {
      max-width: 400px;
      margin: 0 auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    label {
      display: block;
      margin-bottom: 10px;
    }

    input[type="number"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }

    button[type="submit"] {
      background-color: #4CAF50;
      color: #fff;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }

    #random {
      // background-color: #4CAF50;
      float: right;
      color: #fff;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }

    button[type="submit"]:hover {
      background-color: #45a049;
    }

    .rainbow-button {
      display: inline-block;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: bold;
      color: #fff;
      background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff);
      background-size: 1000% 1000%;
      transition: background-position 2s;
      cursor: pointer;
    }

    .rainbow-button:hover {
      background-position: 100% 100%;
    }

  </style>
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      const inputs = document.querySelectorAll('input[type="number"]');
      inputs.forEach(input => {
        const randomValue = Math.floor(Math.random() * 91) + 10; // Generate random value from 10 to 100
        input.value = randomValue;
      });

      const form = document.querySelector('form');
      form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form submission

        // Build the URL with the input values
        const inputs = Array.from(form.elements)
          .filter(element => element.type === 'number')
          .map(element => element.value);
        const url = '/result/' + inputs.join('/');

        // Redirect to the URL
        window.location.href = url;
      });
    });

    function redirectToRandom(event) {
      event.preventDefault(); // Prevent the default behavior of the button
      window.location.href = '/random'; // Redirect to the '/random' URL
    }
  </script>
</head>
<body>
  <h1>PVQ Sample</h1>
  <form>
    <label for="pvq1">PVQ 1:</label>
    <input type="number" name="pvq1" id="pvq1" min="0" max="100" required><br>
    <br>
    <label for="pvq2">PVQ 2:</label>
    <input type="number" name="pvq2" id="pvq2" min="0" max="100" required><br>
    <br>
    <label for="pvq3">PVQ 3:</label>
    <input type="number" name="pvq3" id="pvq3" min="0" max="100" required><br>
    <br>
    <label for="pvq4">PVQ 4:</label>
    <input type="number" name="pvq4" id="pvq4" min="0" max="100" required><br>
    <br>
    <label for="pvq5">PVQ 5:</label>
    <input type="number" name="pvq5" id="pvq5" min="0" max="100" required><br>
    <br>
    <label for="pvq6">PVQ 6:</label>
    <input type="number" name="pvq6" id="pvq6" min="0" max="100" required><br>
    <br>
    <label for="pvq7">PVQ 7:</label>
    <input type="number" name="pvq7" id="pvq7" min="0" max="100" required><br>
    <br>
    <label for="pvq8">PVQ 8:</label>
    <input type="number" name="pvq8" id="pvq8" min="0" max="100" required><br>
    <br>
    <label for="pvq9">PVQ 9:</label>
    <input type="number" name="pvq9" id="pvq9" min="0" max="100" required><br>
    <br>
    <label for="pvq10">PVQ 10:</label>
    <input type="number" name="pvq10" id="pvq10" min="0" max="100" required><br>
    <br>
          <button type="submit">Submit</button>
          <button class="rainbow-button" onclick="redirectToRandom(event)" id="random">RANDOM</button>
        </form>
      </body>
      </html>
    
    `);
  });

app.listen(port, () => {
  console.log(`Running: http://localhost:${port}`)
})

function randomScore() {
  return Math.floor(Math.random() * 91) + 10;
}

function generateSvg(inputs) {

  const size = 500;
  const canvas = createCanvas(size, size, 'svg');
  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const innerRadius = 36;

  slice(0, '#FF6CA2', parseInt(inputs[0]))
  slice(1, '#A1B5C0', parseInt(inputs[1]))
  slice(2, '#F99C73', parseInt(inputs[2]))
  slice(3, '#B877D5', parseInt(inputs[3]))
  slice(4, '#60CBFF', parseInt(inputs[4]))
  slice(5, '#233748', parseInt(inputs[5]))
  slice(6, '#FFD766', parseInt(inputs[6]))
  slice(7, '#49D7BD', parseInt(inputs[7]))
  slice(8, '#F9ABA7', parseInt(inputs[8]))
  slice(9, '#6C9DFC', parseInt(inputs[9]))

  // userLines(0)
  // userLines(1)
  // userLines(2)
  // userLines(3)
  // userLines(4)
  // userLines(5)
  // userLines(6)
  // userLines(7)
  // userLines(8)
  // userLines(9)


  function slice(index, colour, score) {
    let radius = ((score/100) * ((size - (2*innerRadius))/2)) + innerRadius;
    let maxRadius = (size/2 - 10);;
    let counterClockwise = false;
    let startAngle = ((index-1) / 10) * Math.PI * 2;
    let endAngle = (index / 10) * Math.PI * 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, counterClockwise);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, !counterClockwise);
    ctx.closePath();
    ctx.fillStyle = colour;
    ctx.fill()

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, counterClockwise);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, !counterClockwise);
    ctx.closePath();
    ctx.setLineDash([1, 0]);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size/200;
    ctx.stroke();
  }

  function userLines(index) {

    let counterClockwise = false;
    let startAngle = ((index-1) / 10) * Math.PI * 2;
    let endAngle = (index / 10) * Math.PI * 2;

    let randomRadius = (((randomScore()/100) * ((size - (2*innerRadius))/2)) + innerRadius)

    ctx.beginPath();
    ctx.arc(centerX, centerY, randomRadius, startAngle, endAngle, counterClockwise);
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; 
    ctx.lineWidth = 2; 
    ctx.setLineDash([5, 3]);
    ctx.stroke();

    var xOuterStart = centerX + Math.cos(startAngle) * randomRadius;
    var yOuterStart = centerY + Math.sin(startAngle) * randomRadius;
    var xInnerStart = centerX + Math.cos(startAngle) * innerRadius;
    var yInnerStart = centerY + Math.sin(startAngle) * innerRadius;

    var xOuterEnd = centerX + Math.cos(endAngle) * randomRadius;
    var yOuterEnd = centerY + Math.sin(endAngle) * randomRadius;
    var xInnerEnd = centerX + Math.cos(endAngle) * innerRadius;
    var yInnerEnd = centerY + Math.sin(endAngle) * innerRadius;

    
    ctx.beginPath();
    ctx.moveTo(xInnerStart, yInnerStart);
    ctx.lineTo(xOuterStart, yOuterStart);
    ctx.moveTo(xInnerEnd, yInnerEnd);
    ctx.lineTo(xOuterEnd, yOuterEnd);
    ctx.setLineDash([1, 0]);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size/200;
    ctx.stroke();

  }

  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.setLineDash([1, 0]);
  ctx.stroke();


  const svg = canvas.toBuffer("image/svg+xml");
  return svg
}