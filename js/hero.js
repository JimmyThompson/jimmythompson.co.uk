function Circle(position, radius, colour) {
    var _this = this;

    _this.position = position || null;
    _this.radius = radius || null;
    _this.colour = colour || null;

    this.draw = function (context) {
        context.beginPath();
        context.arc(_this.position.x, _this.position.y, _this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = _this.colour;
        context.fill();
    };
}

var getRandomNumber = function (min, max) {
    return Math.random() * (max - min) + min;
};

var addFuzziness = function (original) {
    return original * getRandomNumber(0.75, 1.25);
};

var getDistance = function (a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

var distanceFromOrigin = function(origin) {
    return function (a, b) {
        return getDistance(origin, a) - getDistance(origin, b);
    }
};

var drawLineBetweenPoints = function (context, first, second, colour) {
    context.beginPath();
    context.moveTo(first.x, first.y);
    context.lineTo(second.x, second.y);
    context.strokeStyle = colour;
    context.stroke();
};

var getShade = function (shade) {
    return "rgba(156, 217, 249, " + shade + ")";
};

var now = function () {
    return (new Date()).getTime();
};

var getPoints = function () {
    var points = [];

    for (var x = 0; x < hero.width; x += (hero.width / 20)) {
        for (var y = 0; y < hero.height; y += (hero.height / 10)) {
            points.push({
                "x": addFuzziness(x),
                "y": addFuzziness(y),
                "neighbours": []
            });

        }
    }

    var MAX_NEIGHBOURS = 3;

    for (var i = 0; i < points.length; ++i) {
        var point = points[i];

        for (var j = 0; j < points.length; ++j) {
            if (i === j) continue;

            point.neighbours.push(points[j]);
            point.neighbours.sort(distanceFromOrigin(point));
            point.neighbours = point.neighbours.slice(0, MAX_NEIGHBOURS);
        }
    }

    return points;
};

(function () {
    var hero = document.getElementById("hero");
    var context = hero.getContext("2d");



    var animate = function (start, points) {
        var duration = now() - start;
        var shade = 0.6 * Math.sin(duration / 500);

        context.clearRect(0, 0, hero.width, hero.height);

        if (shade < 0.01) {
            points = getPoints();
        }


        for (var i = 0; i < points.length; ++i) {
            (function (index, point) {
                var circle = new Circle(point, 3, getShade(shade));

                circle.draw(context);

                point.neighbours.forEach(function (neighbour) {
                    drawLineBetweenPoints(context, point, neighbour, getShade(shade));
                });
            })(i, points[i]);
        }

        requestAnimationFrame(function() {
            animate(start, points);
        });
    };

    animate(now(), getPoints());

})();

