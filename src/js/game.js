const SNAKE_HEIGHT = 20;
const SNAKE_WIDTH = 10;
const GROUND_HEIGHT = 570;
const GROUND_WIDTH = 400;
const FOOD_HEIGHT = 10;
const FOOD_WIDTH = 10;
const OFFSET_TOP = 30;
const BONUS = 1;

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


var playground = {
    onPause: false,
    score: 0,
    time: 60,
    foods: [],
    snakes: [],
    canvas: document.getElementById("playground"),
    start: function () {
        this.canvas.width = GROUND_WIDTH;
        this.canvas.height = GROUND_HEIGHT;
        this.gameInterval = setInterval(updateGameArea, 20);
        this.clockInterval = setInterval(decrementTime, 1000);
        this.context = this.canvas.getContext("2d");
        this.snakeGeneratorInterval = setInterval(generateSnake, rand(1, 3) * 1000);
        for (let i = 0; i < 10; i++) {
            generateFood()
        }
        this.canvas.addEventListener('click', hunt)
    },
    stop: function () {
        clearInterval(this.gameInterval);
        clearInterval(this.snakeGeneratorInterval);
        clearInterval(this.clockInterval);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    update: function () {
        if (playground.time === 0 || playground.foods.length === 0)
            return;
        updateFoods();
        updateSnakes();
        updateScore();
    }
}

function updateFoods() {
    for (let i = 0; i < playground.foods.length; i++) {
        playground.foods[i].update();
    }
}

function updateSnakes() {
    for (let i = 0; i < playground.snakes.length; i++) {
        playground.snakes[i].update()
    }
}

function updateScore() {
    document.getElementById('gameplay_score').innerHTML = playground.score;
}

function decrementTime() {
    if (playground.time !== 0 && playground.foods.length !== 0 && !playground.onPause)
        playground.time -= 1;
    else
        playground.stop();

    document.getElementById('timer').innerHTML = playground.time;
}

function hunt(e) {
    let x = e.clientX;
    let y = e.clientY - 30;
    let snake = getSnakeIndex(x, y);
    if (snake !== null) {
        playground.snakes.splice(snake, 1);
        playground.score += BONUS;
    }
}

function getSnakeIndex(x, y) {
    let j = null;
    let d = 99999999999;
    for (let i = 0; i < playground.snakes.length; i++) {
        let s = playground.snakes[i];
        let t = Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2));
        if (t < d) {
            d = t;
            j = i;
        }
    }
    return d < 30 ? j : null;
}

function startGame() {
    playground.start();
}

function Snake() {
    this.width = SNAKE_WIDTH;
    this.height = SNAKE_HEIGHT;
    this.x = rand(0, 400);
    this.y = 0;
    this.ctx = playground.context;
    this.angle = 90;

    this.ctx.save();
    this.ctx.fillStyle = 'green';
    this.ctx.fillRect(this.x, this.y, this.width - 5, this.height);
    this.ctx.beginPath();
    this.ctx.arc(this.x + 2.5, this.y + 20, 4, 0, 2 * Math.PI);
    this.ctx.fillStyle = "green";
    this.ctx.fill();
    this.ctx.restore();

    this.update = function () {
        this.move();
    }

    this.move = function () {
        let index = null;
        let distance = 9999999999999;
        let x = null;
        let y = null;
        for (let i = 0; i < playground.foods.length; i++) {
            let food = playground.foods[i];
            let d = Math.sqrt(Math.pow(this.x - food.x, 2) + Math.pow(this.y - food.y, 2));
            if (d < distance) {
                distance = d;
                x = food.x;
                y = food.y;
                index = i;
            }
        }

        if (distance < SNAKE_HEIGHT) {
            playground.foods.splice(index, 1);
            return;
        }

        this.ctx.save();
        this.angle = getDirectionAngle(this.x, this.y, x, y)
        const dx = Math.cos(this.angle * (Math.PI / 180));
        const dy = Math.sin(this.angle * (Math.PI / 180));
        if (!playground.onPause) {
            this.x += dx;
            this.y += dy;
        }
        this.ctx.beginPath();
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(this.x, this.y, this.width - 5, this.height);
        // this.ctx.beginPath();
        //
        // this.ctx.arc(this.x + 2.5, this.y + 20, 4, 0, 2 * Math.PI);
        // this.ctx.fillStyle = "green";
        // this.ctx.fill();
        this.ctx.restore();
    }
}

function Food(x, y) {
    this.x = x;
    this.y = y;
    this.ctx = playground.context;
    this.update = function () {
        this.ctx.save();
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillRect(this.x, this.y, FOOD_WIDTH, FOOD_HEIGHT);
        this.ctx.fillStyle = "green";
        this.ctx.fill();
        this.ctx.stroke();
    }
}

function getDirectionAngle(xs, hs, xf, yf) {
    const deltaX = xf - xs;
    const deltaY = yf - hs;
    let angle = Math.atan2(deltaY, deltaX);
    angle = angle * (180 / Math.PI);
    angle %= 360;
    return angle;
}

function generateSnake() {
    playground.snakes.push(new Snake());
}

function generateFood() {
    playground.foods.push(new Food(rand(FOOD_WIDTH, GROUND_WIDTH - FOOD_WIDTH), rand(FOOD_HEIGHT, GROUND_HEIGHT - FOOD_HEIGHT)));
}

function updateGameArea() {
    playground.clear();
    playground.update();
}

function pauseAndPlay() {
    playground.onPause = !playground.onPause;
}