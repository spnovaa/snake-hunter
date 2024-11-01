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
    speed: 1,
    score: 0,
    time: 60,
    foods: [],
    snakes: [],
    canvas: document.getElementById("playground"),
    start: function () {
        const urlParams = new URLSearchParams(window.location.search);
        this.speed = urlParams.get('l');
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
        updateBestRecords();
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    update: function () {
        if (checkFinish())
            window.close();
        updateFoods();
        updateSnakes();
        updateScore();
    }
}

function updateBestRecords() {
    let level = playground.speed
    let isEasy = Number(level) === 1;
    let prev = JSON.parse(localStorage.getItem('snake-hunter-record'));
    if (prev) {
        if (playground.score > prev[level])
            prev[level] = playground.score;
        localStorage.removeItem('snake-hunter-record');
    } else
        prev = {'1': isEasy ? level : '0', '2': isEasy ? '0' : level}

    localStorage.setItem('snake-hunter-record', JSON.stringify(prev));
}

function checkFinish() {
    let finished = playground.time === 0 || playground.foods.length === 0;
    if (finished) {
        playground.stop();
        if (playground.time === 0)
            alert('Time Over!');
        else
            alert('Snakes Won!')
        return true;
    }
    return false;
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
    this.angle = 0;
    this.trembler = 5;

    this.ctx.save();
    this.ctx.fillRect(this.x, this.y, this.width - 5, this.height);
    this.ctx.beginPath();
    this.ctx.arc(this.x + 2.5, this.y + 20, 4, 0, 2 * Math.PI);
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
        const dx = Math.cos(this.angle * (Math.PI / 180)) * playground.speed;
        const dy = Math.sin(this.angle * (Math.PI / 180)) * playground.speed;
        if (!playground.onPause) {
            this.x += dx;
            this.y += dy;
        }
        this.ctx.beginPath();
        this.ctx.translate(this.x, this.y)
        this.ctx.rotate(this.angle * Math.PI / 180);
        this.trembler += rand(-10, 10) / 6;
        if (Math.abs(this.trembler) > 15)
            this.trembler = 0;

        let head = {x: this.height, y: 0};
        let cp1 = {x: this.height / 2, y: this.trembler};
        let cp2 = {x: this.height / 2, y: -this.trembler};
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.strokeStyle = 'green';
        this.ctx.lineWidth = 2;
        this.ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, head.x, head.y);
        this.ctx.stroke();
        this.ctx.beginPath();

        this.ctx.translate(0, 0);
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
        this.ctx.restore();
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
    if (!playground.onPause)
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
    if (playground.onPause)
        document.getElementById('pause_btn').innerHTML = "&#9658;"
    else
        document.getElementById('pause_btn').innerHTML = "&#9616;&#9616;"
}