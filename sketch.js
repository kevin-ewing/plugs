const RECT_RADIUS = 2;
const NOISE_DIFF = 5;
const GRAIN_DIFF = 15;
const COLOR = [222, 134, 80];
const WIRES_COUNT = 15; // Number of wires you want to add

let rects = [];
let plugs = [];
let attemptLimit = 20000; // Number of attempts to place a rectangle before giving up
let totalRects = 2000; // Total number of rectangles
let spacing = 1; // Spacing between boxes

function setup() {
  createCanvas(1040, 640); // Increased size for 20 px padding
  fill(COLOR);
  noLoop();

  let initialRects = [];
  // Generate rectangles with widths and heights in increments of 10
  for (let i = 0; i < totalRects; i++) {
    initialRects.push({
      x: 0,
      y: 0,
      w: round(random(1, 2)) * 10, // Widths in increments of 10, up to 20
      h: round(random(1, 8)) * 10, // Heights in increments of 10, up to 80
    });
  }
  // Sort rectangles by area, largest to smallest
  initialRects.sort((a, b) => b.w * b.h - a.w * a.h);

  // Try to place each rectangle
  for (let newRect of initialRects) {
    placeRect(newRect);
  }
}

function draw() {
  noStroke();
  pixelDensity(1);
  background(0);
  // Draw all rectangles with spacing
  rects.forEach((r) => {
    rect(
      r.x + spacing,
      r.y + spacing,
      r.w - spacing * 2,
      r.h - spacing * 2,
      RECT_RADIUS
    );
    // Check if the rectangle's width is 20px and height is divisible by 10 but not 20
    if (r.w === 20 && r.h % 20 === 0) {
      fill(0); // Set fill color for the plugs

      // Calculate how many plugs we need based on the height
      let numPlugs = r.h / 20;
      // Define extra space for the first and last gap
      let extraSpace = 4; // Extra space compared to the default spacing
      let totalExtraSpace = 2 * extraSpace; // Total extra space combining top and bottom
      let spaceBetweenPlugs =
        (r.h - numPlugs * 20 - totalExtraSpace) / (numPlugs - 1);

      // Draw each plug, starting with an extra gap at the top
      if (numPlugs === 1) {
        plugs.push({ x: r.x, y: r.y, w: r.w, h: 20 });
        drawPlug(r.x, r.y, r.w, 20);
      }
      for (let i = 0; i < numPlugs; i++) {
        // Calculate the y position of each plug, adding the extra space at the top
        let yPos = r.y + extraSpace + i * (20 + spaceBetweenPlugs);
        plugs.push({ x: r.x, y: yPos, w: r.w, h: 20 });
        drawPlug(r.x, yPos, r.w, 20); // Assuming drawPlug handles the full width and height for each plug
      }

      fill(COLOR); // Reset fill color for subsequent rectangles
    } else if (r.w === 10 && r.h > 20) {
      stroke(0); // Set stroke color for the line
      strokeWeight(2); // Set stroke weight for the line
      // Draw a vertical line in the center of the box
      let lineX = r.x + r.w / 2; // Center X position
      line(lineX, r.y + 5 + spacing, lineX, r.y + r.h - 5 - spacing); // Line from 10px from top to 10px from bottom

      // Draw small circles at the ends of the lines
      noStroke(); // No stroke for the circles
      fill(0); // Set fill color for the circles
      let circleDiameter = 4; // Diameter of the circles
      circle(lineX, r.y + 5 + spacing, circleDiameter); // Top circle
      circle(lineX, r.y + r.h - 5 - spacing, circleDiameter); // Bottom circle
      noStroke();
      fill(COLOR);
    } else if (r.w > 10 && r.h == 10) {
      stroke(0); // Set stroke color for the line
      strokeWeight(2); // Set stroke weight for the line
      // Draw a horizontal line in the center of the box
      let lineY = r.y + r.h / 2; // Center Y position
      line(r.x + 5 + spacing, lineY, r.x + r.w - 5 - spacing, lineY); // Line from 10px from left to 10px from right

      // Draw small circles at the ends of the lines
      noStroke(); // No stroke for the circles
      fill(0); // Set fill color for the circles
      let circleDiameter = 4; // Diameter of the circles
      circle(r.x + 5 + spacing, lineY, circleDiameter); // Left circle
      circle(r.x + r.w - 5 - spacing, lineY, circleDiameter); // Right circle
    }
  });

  drawArcsBetweenPlugs();

  addNoise();
  addGrain();
}

function drawArcsBetweenPlugs() {
  for (let i = 0; i < WIRES_COUNT && plugs.length >= 2; i++) {
    // Select two random points from the plugs array and remove them to avoid duplication
    let index1 = floor(random(plugs.length));
    let startPoint = plugs.splice(index1, 1)[0]; // Remove and retrieve the first point

    let index2 = floor(random(plugs.length));
    let endPoint = plugs.splice(index2, 1)[0]; // Remove and retrieve the second point

    // Offset the start and end points
    let offsetStartPoint = { x: startPoint.x + 10, y: startPoint.y + 10 };
    let offsetEndPoint = { x: endPoint.x + 10, y: endPoint.y + 10 };

    // Calculate the midpoint and increase the droop for the arc
    let midX = (offsetStartPoint.x + offsetEndPoint.x) / 2;
    let midY = (offsetStartPoint.y + offsetEndPoint.y) / 2;
    let droop = abs(offsetStartPoint.x - offsetEndPoint.x); // Adjust droop as necessary

    // Draw small yellow circles at the offset end of each line
    fill(0); // Set fill color to yellow
    noStroke();
    let circleDiameter = 12; // Diameter of the circles
    circle(offsetStartPoint.x, offsetStartPoint.y, circleDiameter); // Circle at the offset start point
    circle(offsetEndPoint.x, offsetEndPoint.y, circleDiameter); // Circle at the offset end point
    fill(COLOR); // Set fill color to yellow
    noStroke();
    let innerDiameter = 8; // Diameter of the circles
    circle(offsetStartPoint.x, offsetStartPoint.y, innerDiameter); // Circle at the offset start point
    circle(offsetEndPoint.x, offsetEndPoint.y, innerDiameter); // Circle at the offset end point

    let droopMultiplier = random(0.1, 1.2);
    // Draw the arc using a quadratic vertex
    noFill();
    stroke(0); // Change as needed
    strokeWeight(6); // Change as needed
    beginShape();
    vertex(offsetStartPoint.x, offsetStartPoint.y);
    quadraticVertex(
      midX,
      midY + droop * droopMultiplier,
      offsetEndPoint.x,
      offsetEndPoint.y
    ); // Increased droop
    endShape();
    noFill();
    stroke(COLOR); // Assuming COLOR is defined elsewhere
    strokeWeight(2); // Change as needed
    beginShape();
    vertex(offsetStartPoint.x, offsetStartPoint.y);
    quadraticVertex(
      midX,
      midY + droop * droopMultiplier,
      offsetEndPoint.x,
      offsetEndPoint.y
    ); // Increased droop
    endShape();
  }
}

function drawPlug(x, y, w, h) {
  let circleDiameter = 12; // Diameter of the circle
  fill(0); // Set fill color to white for the circle
  circle(
    x + w / 2, // Center x position
    y + h / 2, // Center y position
    circleDiameter // Diameter
  );
  fill(COLOR);
  rect(x + w - 15, y + h - 18, 10, 4);
  rect(x + w - 15, y + h - 6, 10, 4);
  rect(x + w - 9, y + h - 12, 2, 4, 1);
  rect(x + w - 13, y + h - 12, 2, 4, 1);
  fill(COLOR); // Reset fill color to black for subsequent rectangles
}

// Try to place a new rectangle without overlapping existing ones
function placeRect(newRect) {
  let placed = false;
  let attempts = 0;

  while (!placed && attempts < attemptLimit) {
    // Adjusted for 20 px margin and position in increments of 10
    newRect.x = 20 + floor(random((width - newRect.w - 40) / 10)) * 10 + 5;
    newRect.y = 20 + floor(random((height - newRect.h - 40) / 10)) * 10 + 5;

    let overlapping = rects.some((other) => intersect(newRect, other));

    if (!overlapping) {
      placed = true;
      rects.push({ ...newRect }); // Add the non-overlapping rectangle to the array
    }
    attempts++;
  }
}

// Check if two rectangles overlap
function intersect(r1, r2) {
  return !(
    r2.x >= r1.x + r1.w ||
    r2.x + r2.w <= r1.x ||
    r2.y >= r1.y + r1.h ||
    r2.y + r2.h <= r1.y
  );
}

function addNoise() {
  // Add noise to the image
  loadPixels();
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let index = (i + j * width) * 4;
      pixels[index] = constrain(
        pixels[index] + random(-NOISE_DIFF, NOISE_DIFF),
        0,
        255
      );
      pixels[index + 1] = constrain(
        pixels[index + 1] + random(-NOISE_DIFF, NOISE_DIFF),
        0,
        255
      );
      pixels[index + 2] = constrain(
        pixels[index + 2] + random(-NOISE_DIFF, NOISE_DIFF),
        0,
        255
      );
      let grain = random(-GRAIN_DIFF, GRAIN_DIFF);
      pixels[index] = constrain(pixels[index] + grain, 0, 255); // Red channel
      pixels[index + 1] = constrain(pixels[index + 1] + grain, 0, 255); // Green channel
      pixels[index + 2] = constrain(pixels[index + 2] + grain, 0, 255); // Blue channel
    }
  }
  updatePixels();
}

function addGrain() {
  loadPixels();
  for (let i = 0; i < width * 4; i++) {
    for (let j = 0; j < height * 4; j++) {
      // Alpha channel (pixels[index + 3]) remains unchanged
    }
  }
  updatePixels();
}
