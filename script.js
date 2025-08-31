const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let timeLeft = 60;
let gameOver = false;

// Load background
const bg = new Image();
bg.src = "images/background.jpg";

// Load target images
const targetSources = ["images/target1.png","images/target2.png","images/target3.png"];
const targetsImages = [];
let loadedCount = 0;

// Load sound
const hitSound = new Audio("sounds/hit.mp3");

// Preload targets
for(let src of targetSources){
    const img = new Image();
    img.src = src;
    img.onload = () => {
        loadedCount++;
        if(loadedCount === targetSources.length){
            startGame();
        }
    };
    targetsImages.push(img);
}

// Multiple targets
let targets = [];
const initialTargetCount = 2;
let targetSize = 100;

// Random position
function randomTarget(img){
    return {
        x: Math.random()*(canvas.width-targetSize),
        y: Math.random()*(canvas.height-targetSize),
        size: targetSize,
        img: img,
        animating:false,
        scale:1
    };
}

// Reset all targets
function resetTargets(){
    targets = [];
    for(let i=0; i<initialTargetCount; i++){
        let img = targetsImages[Math.floor(Math.random()*targetsImages.length)];
        targets.push(randomTarget(img));
    }
}

// Draw loop
function draw(){
    if(gameOver) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(bg.complete) ctx.drawImage(bg,0,0,canvas.width,canvas.height);

    for(let t of targets){
        ctx.save();
        if(t.animating){
            ctx.translate(t.x + t.size/2, t.y + t.size/2);
            ctx.scale(t.scale, t.scale);
            ctx.drawImage(t.img, -t.size/2, -t.size/2, t.size, t.size);
        } else {
            ctx.drawImage(t.img, t.x, t.y, t.size, t.size);
        }
        ctx.restore();
    }

    requestAnimationFrame(draw);
}

// Animate tap
function animateTarget(t){
    t.animating = true;
    let step = 0;
    const animInterval = setInterval(()=>{
        step++;
        t.scale = 1 - 0.05*step;
        if(step >= 5){
            clearInterval(animInterval);
            t.scale = 1;
            t.animating = false;
        }
    },30);
}

// Touch detection
canvas.addEventListener("touchstart", e=>{
    if(gameOver) return;
    let touch = e.touches[0];
    if(!touch) return;
    let x = touch.clientX;
    let y = touch.clientY;

    for(let t of targets){
        if(x>t.x && x<t.x+t.size && y>t.y && y<t.y+t.size){
            score++;
            document.getElementById("score").innerText=`Score: ${score}`;
            hitSound.currentTime = 0;
            hitSound.play();
            animateTarget(t);
            // reset this target position
            t.x = Math.random()*(canvas.width-t.size);
            t.y = Math.random()*(canvas.height-t.size);
        }
    }
});

// Timer + difficulty
function startTimer(){
    const interval = setInterval(()=>{
        if(gameOver){ clearInterval(interval); return; }
        timeLeft--;
        document.getElementById("timer").innerText=`Time: ${timeLeft}s`;

        // Difficulty increase every 15s
        if(timeLeft === 45 || timeLeft === 30 || timeLeft === 15){
            if(targetSize > 50) targetSize -= 15; // target shrink
            // increase number of targets
            if(targets.length < 3) targets.push(randomTarget(targetsImages[Math.floor(Math.random()*targetsImages.length)]));
        }

        if(timeLeft<=0){
            gameOver = true;
            alert(`Game Over! Your Score: ${score}`);
        }
    },1000);
}

// Start game
function startGame(){
    resetTargets();
    draw();
    startTimer();
}