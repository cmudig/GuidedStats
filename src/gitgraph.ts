// -- Route --------------------------------------------------------

function Route( commit, data, options ) {
  var self = this;

  self._data = data;
  self.commit = commit;
  self.options = options;
  self.from = data[0];
  self.to = data[1];
  self.branch = data[2];
}

Route.prototype.drawRoute = function ( ctx ) {
  var self = this;

  if (self.options.orientation === "horizontal") {
	var from_x_hori = self.options.width * self.options.scaleFactor - (self.commit.idx + 0.5) * self.options.x_step * self.options.scaleFactor;
	var from_y_hori = (self.from + 1) * self.options.y_step * self.options.scaleFactor;

	var to_x_hori = self.options.width * self.options.scaleFactor - (self.commit.idx + 0.5 + 1) * self.options.x_step * self.options.scaleFactor;
	var to_y_hori = (self.to + 1) * self.options.y_step * self.options.scaleFactor;

	ctx.strokeStyle = self.commit.graph.get_color(self.branch);
	ctx.beginPath();
	ctx.moveTo(from_x_hori, from_y_hori);
	if (from_y_hori === to_y_hori) {
	  ctx.lineTo(to_x_hori, to_y_hori);
	} else if (from_y_hori > to_y_hori) {
	  ctx.bezierCurveTo(from_x_hori - self.options.x_step * self.options.scaleFactor / 3 * 2,
						from_y_hori + self.options.y_step * self.options.scaleFactor / 4,
						to_x_hori + self.options.x_step * self.options.scaleFactor / 3 * 2,
						to_y_hori - self.options.y_step * self.options.scaleFactor / 4,
						to_x_hori, to_y_hori);
	} else if (from_y_hori < to_y_hori) {
	  ctx.bezierCurveTo(from_x_hori - self.options.x_step * self.options.scaleFactor / 3 * 2,
						from_y_hori - self.options.y_step * self.options.scaleFactor / 4,
						to_x_hori + self.options.x_step * self.options.scaleFactor / 3 * 2,
						to_y_hori + self.options.y_step * self.options.scaleFactor / 4,
						to_x_hori, to_y_hori);
	}
	
  } else {
	var from_x = self.options.width * self.options.scaleFactor - (self.from + 1) * self.options.x_step * self.options.scaleFactor;
	var from_y = (self.commit.idx + 0.5) * self.options.y_step * self.options.scaleFactor;

	var to_x = self.options.width * self.options.scaleFactor - (self.to + 1) * self.options.x_step * self.options.scaleFactor;
	var to_y = (self.commit.idx + 0.5 + 1) * self.options.y_step * self.options.scaleFactor;

	ctx.strokeStyle = self.commit.graph.get_color(self.branch);
	ctx.beginPath();
	ctx.moveTo(from_x, from_y);
	if (from_x === to_x) {
	  ctx.lineTo(to_x, to_y);
	} else {
	  ctx.bezierCurveTo(from_x - self.options.x_step * self.options.scaleFactor / 4,
                        from_y + self.options.y_step * self.options.scaleFactor / 3 * 2,
                        to_x + self.options.x_step * self.options.scaleFactor / 4,
                        to_y - self.options.y_step * self.options.scaleFactor / 3 * 2,
                        to_x, to_y);
	}
  }

  ctx.stroke();
};

// -- Commit Node --------------------------------------------------------

function Commit(graph, idx, data, options ) {
  var self = this;

  self._data = data;
  self.graph = graph;
  self.idx = idx;
  self.options = options;
  self.sha = data[0];
  self.dot = data[1];
  self.dot_offset = self.dot[0];
  self.dot_branch = self.dot[1];
  self.routes = data[2].map((d: any) => new Route(self, d, options));
}

Commit.prototype.drawDot = function ( ctx ) {
  var self = this;
  var radius = self.options.dotRadius;	// dot radius
  
  if (self.options.orientation === "horizontal") {
	var x_hori = self.options.width * self.options.scaleFactor - (self.idx + 0.5) * self.options.x_step * self.options.scaleFactor;
	var y_hori = (self.dot_offset + 1) * self.options.y_step * self.options.scaleFactor;
    ctx.fillStyle = self.graph.get_color(self.dot_branch);
    ctx.beginPath();
    ctx.arc(x_hori, y_hori, radius * self.options.scaleFactor, 0, 2 * Math.PI, true);

  } else {
	var x = self.options.width * self.options.scaleFactor - (self.dot_offset + 1) * self.options.x_step * self.options.scaleFactor;
	var y = (self.idx + 0.5) * self.options.y_step * self.options.scaleFactor;
    ctx.fillStyle = self.graph.get_color(self.dot_branch);
    ctx.beginPath();
    ctx.arc(x, y, radius * self.options.scaleFactor, 0, 2 * Math.PI, true);
  }
  // ctx.stroke();
  ctx.fill();
};

// -- Graph Canvas --------------------------------------------------------

function backingScale() {
    if ('devicePixelRatio' in window) {
        if (window.devicePixelRatio > 1) {
            return window.devicePixelRatio;
        }
    }
    return 1;
}

function GraphCanvas(canvas: HTMLCanvasElement, data, options ) {
  var self = this;

  self.data = data;
  self.options = options;
  self.canvas = canvas;
  self.canvas.style.height = options.height + "px";
  self.canvas.style.width = options.width + "px";
  self.canvas.height = options.height;
  self.canvas.width = options.width;

  var scaleFactor = backingScale();
  if (self.options.orientation === "horizontal") {
	if (scaleFactor < 1) {
	  self.canvas.width = self.canvas.width * scaleFactor;
	  self.canvas.height = self.canvas.height * scaleFactor;
	}
  } else {
	if (scaleFactor > 1) {
	  self.canvas.width = self.canvas.width * scaleFactor;
	  self.canvas.height = self.canvas.height * scaleFactor;
	}
  }
	  
  self.options.scaleFactor = scaleFactor;

  // or use context.scale(2,2) // not tested

  self.colors = [
    "#e11d21",
    //"#eb6420",
    "#fbca04",
    "#009800",
    "#006b75",
    "#207de5",
    "#0052cc",
    "#5319e7",
    "#f7c6c7",
    "#fad8c7",
    "#fef2c0",
    "#bfe5bf",
    "#c7def8",
    "#bfdadc",
    "#bfd4f2",
    "#d4c5f9",
    "#cccccc",
    "#84b6eb",
    "#e6e6e6",
    "#ffffff",
    "#cc317c"
  ];
  // self.branch_color = {};
}

GraphCanvas.prototype.toHTML = function () {
  var self = this;

  self.draw();

  return self.canvas;
};

GraphCanvas.prototype.get_color = function (branch) {
  var self = this;

  var n = self.colors.length;
  return self.colors[branch % n];
};

/*

[
  sha,
  [offset, branch], //dot
  [
    [from, to, branch],  // route1
    [from, to, branch],  // route2
    [from, to, branch],
  ]  // routes
],

*/
// draw
GraphCanvas.prototype.draw = function () {
  var self = this,
      ctx = self.canvas.getContext("2d");
  
  console.log(ctx);

  ctx.lineWidth = self.options.lineWidth;

  var n_commits = self.data.length;
  for (var i=0; i<n_commits; i++) {
    var commit = new Commit(self, i, self.data[i], self.options);
  
    commit.drawDot(ctx);
    for (var j=0; j<commit.routes.length; j++) {
      var route = commit.routes[j];
      route.drawRoute(ctx);
    }
  }
  console.log(ctx)
};

// -- Function for finding the total number of branches -----------------------
const branchCount = function(data) {
  var maxBranch = -1;
  for (var i = 0; i < data.length; i++) {
	for (var j = 0; j < data[i][2].length; j++) {
	  if (maxBranch < data[i][2][j][0] || maxBranch < data[i][2][j][1]) {
		maxBranch = Math.max.apply(Math, [data[i][2][j][0], data[i][2][j][1]]);
	  }
	}
  }
  return maxBranch + 1;
};

// -- Graph Plugin ------------------------------------------------------------

export function Graph(canvas, data, options ) {
	var self = this,
			defaults = {
        height: 800,
        width: 200,
        // y_step: 30,
        y_step: 20,
        x_step: 20,
        orientation: "vertical",
        dotRadius: 3,
        lineWidth: 2,
			};
  
  self.canvas = canvas;
	self.data = data;
	var x_step = {...defaults, ...options}.x_step;
  var y_step = {...defaults, ...options}.y_step;

	if (options.orientation === "horizontal") {
	  defaults.width = ( self.data.length + 2 ) * x_step;
	  defaults.height = ( branchCount(self.data) + 0.5 ) * y_step;
	} else {
	  defaults.width = ( branchCount(self.data) + 0.5 ) * x_step;
	  defaults.height = ( self.data.length + 2 ) * y_step;
	}

	self.options = {...defaults, ...options};

	self._defaults = defaults;

	// self.applyTemplate();
  self.graphCanvas = new GraphCanvas(self.canvas, self.data, self.options );
};
