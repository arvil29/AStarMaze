//for this A* algorithm everything follows the
//Manhattan style grid system with a distance of 1 between each spot

var cols = 100;
var rows = 100;
var grid = new Array(cols);

var openSet = [];
var closedSet = [];
var start;
var end;
var w; //width
var h; //height
var path = [];


//using p5.js so requres setup() function
function setup() {
  createCanvas(400, 400);
  console.log("A*");

//to know how much of block to fill
  w = width / cols;
  h = height / rows;

//make 2d array
  for(var i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }

  for(var i = 0; i < cols; i++) {
    for(var j = 0; j < rows; j++) {
      grid[i][j] = new Spot(i, j);
    }
  }

  //add neighbors
  for(var i = 0; i < cols; i++) {
    for(var j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }

  start = grid[0][0];
  end = grid[cols - 1][rows - 1];
  start.wall = false;
  end.wall = false;

  //start with openSet so start gets pushed
  openSet.push(start);


}

//p5 requires draw() for animation loop; also works as while loop
function draw() {
  //if openSet is not empty
  if(openSet.length > 0) {
      var lowestIndex = 0; //for openSet with lowest index
      for(var i = 0; i < openSet.length; i++) { //loop through openSet
        if(openSet[i].f < openSet[lowestIndex].f) { //to find if f at openSet is smaller at i than the one at lowestIndex
          lowestIndex = i; //if so then set lowestIndex to i bc we want smallest f value for shortest distance
        }
      }
      var current = openSet[lowestIndex];

      //if openSet at lowestIndex is equal to end --> we're done!
      if(current === end) {
        noLoop();
        console.log("DONE");
      }

      removeFromArray(openSet, current); //remove current from openSet
      closedSet.push(current); //item has been viewed, so put in closedSet

      var neighbors = current.neighbors; //get all neighbors for current spot
      for(var i = 0; i < neighbors.length; i++) { //keep getting each neighbor and evaluate accordingly
        var neighbor = neighbors[i];
        var newPath = false;

        if(!closedSet.includes(neighbor) && !neighbor.wall) { //if neighbor is not in closedSet && neighbor is not wall
          var tempG = current.g + 1; //add 1 to current spot's cost and store in tempG

          if(openSet.includes(neighbor)) { //if openSet has the neighbor
            if(tempG < neighbor.g) { //and if tempG has less cost than neighbor's cost
              neighbor.g = tempG; //neighbor's cost is set to the shorter cost in tempG
              newPath = true; //newPath is set to true bc better g has been found
            }
          }
          else { //if neighbor is not in openSet
            neighbor.g = tempG; //set neighbor's cost to tempG cost bc neighbor didn't have g
            newPath = true; //has to have newPath
            openSet.push(neighbor); //push openSet to neighbor
          }

          if(newPath) { //if new amount of time it took to get here is better aka true
            neighbor.h = heuristic(neighbor, end); //find distance between this neighbor and end aka find heuristic
            neighbor.f = neighbor.g + neighbor.h; //add cost and heuristic to find total distance
            neighbor.previous = current; //update previous if g has improved
          }

        }
      }
  }

  else {
    console.log("No solution!");
    noLoop();
    return;
  }

  background(0);

//trying to get each spot to show itself
  for(var i = 0; i < cols; i++) {
    for(var j = 0; j < rows; j++) {
      grid[i][j].show(color(255));
    }
  }

  //make closedSet visible with color
  for(var i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color(255, 0, 0));
  }

  //make openSet visible with color
  for(var i = 0; i < openSet.length; i++) {
    openSet[i].show(color(0, 255, 0));
  }

  //find path
  path = []; //start with empty list
  var temp = current;
  path.push(temp); //put end spot in list
  while(temp.previous) { //while there is sth before end spot
    path.push(temp.previous); //keep adding to array
    temp = temp.previous;
  }


  //make path visible with color
  for(var i = 0; i < path.length; i++) {
    //path[i].show(color(0, 0, 255));
  }

  noFill();
  stroke(255, 0, 100);
  strokeWeight(w / 2);
  beginShape();
  for(var i = 0; i < path.length; i++) {
    vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
  }
  endShape();
}

//creates Spot objects
function Spot(i, j) {
  this.i = i; //to pinpoint x location on graph
  this.j = j; //to pinpoint y location on graph
  this.f = 0; //total distance function: f(x) = g(X) + h(x)
  this.g = 0; //cost
  this.h = 0; //heuristic
  this.neighbors = []; //each spot will keep track of its neighbors
  this.previous = undefined; //previous spot of current spot
  this.wall = false; //set every spot to at default not be a wall

  //set walls
  if (random(1) < 0.4) {
    this.wall = true;
  }

  //function for each spot to show itself
  this.show = function(color) {
    //fill(color);
    if(this.wall) { //if spot is wall
      fill(255); //then its black
      noStroke();
      ellipse(i * w + w / 2, j * h + h / 2, w / 2, h / 2)
    }

    //rect(w * i, h * j, w - 1, h - 1);
  }

  //function to keep track of neighbors around spot
  this.addNeighbors = function(grid) {
    var i = this.i;
    var j = this.j;

    if(i < cols - 1) {
      this.neighbors.push(grid[i + 1][j]);
    }
    if(i > 0) {
      this.neighbors.push(grid[i - 1][j]);
    }
    if(j < rows - 1) {
      this.neighbors.push(grid[i][j + 1]);
    }
    if(j > 0) {
      this.neighbors.push(grid[i][j - 1]);
    }
    if( i > 0 && j > 0) { //for top left diagonal of spot
      this.neighbors.push(grid[i - 1][j - 1]);
    }
    if(i < cols - 1 && j > 0) { //for top right diagonal of spot
      this.neighbors.push(grid[i + 1][j - 1]);
    }
    if(i > 0 && j < rows - 1) { //for bottom left diagonal of spot
      this.neighbors.push(grid[i - 1][j + 1]);
    }
    if(i < cols - 1 && j < rows - 1) { // for bottom right diagonal of spot
      this.neighbors.push(grid[i + 1][j + 1]);
    }
  }
}

function removeFromArray(array, element) {
  for(var i = array.length - 1; i >= 0; i--) {
    if(array[i] == element) {
      array.splice(i, 1);
    }
  }
}

function heuristic(a, b) { //manhattan distance calculation for heuristic
  var d = abs(a.i-b.i) + abs(a.j-b.j);
  return d;
}
