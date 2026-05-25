const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let money = 100;
let water = 100;
let score = 0;
let temColhedeira = false;
let plantado = false;
let clima = 'Ensolarado';
let dia = 1;
let plants = [];
let harvester = { x: 80, y: 260, width: 180, height: 60, speed: 4 };
let keys = {};
let soilClods = [];

const spanMoney = document.getElementById('money');
const spanWater = document.getElementById('water');
const spanScore = document.getElementById('score');
const spanWeather = document.getElementById('weather');
const plantarBtn = document.getElementById('plantarBtn');
const irrigarBtn = document.getElementById('irrigarBtn');
const colhedeiraBtn = document.getElementById('colhedeiraBtn');

function atualizarInterface() {
    spanMoney.innerText = money;
    spanWater.innerText = Math.max(0, Math.round(water));
    spanScore.innerText = score;
    spanWeather.innerText = clima;
}

function createField() {
    plants = [];
    const rows = 5;
    const cols = 8;
    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
            plants.push({
                growth: 10 + Math.random() * 6,
                harvested: false,
                ready: false,
                row,
                col,
                offsetX: (Math.random() - 0.5) * 12,
                offsetY: (Math.random() - 0.5) * 6
            });
        }
    }
    // gerar solo (torrões) estático para evitar movimento ao redesenhar
    soilClods = [];
    const left = 90;
    const right = canvas.width - 90;
    const horizon = canvas.height * 0.56;
    for (let r = 0; r < 12; r++) {
        const y = horizon + 6 + r * 18;
        const rowLeft = left + r * 3.5;
        const rowRight = right - r * 3.5;
        for (let x = rowLeft; x < rowRight; x += 18) {
            const cx = Math.round(x + (Math.random() - 0.5) * 6);
            const cy = Math.round(y + (Math.random() - 0.5) * 4);
            const w = 3 + Math.round(Math.random() * 6);
            const h = 2 + Math.round(Math.random() * 4);
            const shade = 80 + r * 3 + Math.round(Math.random() * 30);
            soilClods.push({ x: cx, y: cy, w, h, shade });
        }
    }
}

function plantarSementes() {
    if (plantado) {
        alert('Já há uma lavoura em crescimento. Aguarde a colheita.');
        return;
    }
    if (money < 5) {
        alert('Você precisa de pelo menos R$ 5 para comprar sementes.');
        return;
    }
    money -= 5;
    plantado = true;
    createField();
    alert('Sementes plantadas! Dirija a colhedeira e colha quando as plantas estiverem prontas.');
    atualizarInterface();
}

function comprarColhedeira() {
    if (temColhedeira) {
        alert('Você já possui uma colhedeira.');
        return;
    }
    if (money < 50) {
        alert('Dinheiro insuficiente para comprar a colhedeira.');
        return;
    }
    money -= 50;
    temColhedeira = true;
    alert('Colhedeira adquirida! Use as setas para dirigir e E para colher.');
    atualizarInterface();
}

function irrigar() {
    if (money < 10) {
        alert('Não há dinheiro suficiente para irrigar.');
        return;
    }
    money -= 10;
    water = Math.min(100, water + 55);
    alert('Irrigação concluída. O solo está mais úmido.');
    atualizarInterface();
}

function atualizarClima() {
    const chance = Math.random();
    if (chance < 0.1) clima = 'Chuva Forte';
    else if (chance < 0.3) clima = 'Chuva Leve';
    else if (chance < 0.6) clima = 'Nublado';
    else clima = 'Ensolarado';
}

function cicloDiario() {
    atualizarClima();

    if (clima.includes('Chuva')) {
        water = Math.min(100, water + (clima === 'Chuva Forte' ? 20 : 10));
    }

    if (plantado) {
        plants.forEach(plant => {
            if (!plant.harvested) {
                let taxa = 1.2;
                if (temColhedeira) taxa += 0.8;
                if (water < 30) taxa *= 0.45;
                if (clima === 'Nublado') taxa *= 0.9;
                if (clima === 'Ensolarado') taxa *= 1.0;
                plant.growth = Math.min(100, plant.growth + taxa);
                plant.ready = plant.growth >= 100;
            }
        });
    }

    water -= plantado ? 2.8 : 1.0;
    if (water < 0) water = 0;

    if (water === 0 && plantado) {
        plants.forEach(plant => {
            if (!plant.harvested) plant.growth = Math.max(plant.growth - 1.8, 5);
        });
    }

    dia += 1;
    atualizarInterface();
}

function plantPosition(row, col) {
    const startX = 90;
    const baseY = 280;
    const x = startX + col * 58 + row * 14;
    const y = baseY + row * 32 - row * 10;
    return { x, y };
}

function harvestPlants(auto = false) {
    if (!temColhedeira) return;
    let collected = 0;
    const harvRect = {
        x: harvester.x - 28,
        y: harvester.y - 22,
        width: harvester.width + 56,
        height: harvester.height + 24
    };

    plants.forEach(plant => {
        if (!plant.harvested && plant.ready) {
            const { x, y } = plantPosition(plant.row, plant.col);
            const plantRect = { x: x - 14, y: y - 56, width: 28, height: 56 };
            if (rectIntersect(plantRect, harvRect)) {
                plant.harvested = true;
                collected += 1;
                score += 1;
                money += 6;
            }
        }
    });

    if (collected > 0) {
        if (!auto) alert(`Colhidas ${collected} plantas prontas!`);
        if (plants.every(p => p.harvested)) {
            plantado = false;
            alert('Lavoura colhida. Plante novamente para continuar.');
        }
        atualizarInterface();
    }
}

function rectIntersect(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function atualizarPosicao() {
    if (!temColhedeira) return;
    if (keys.ArrowLeft) harvester.x = Math.max(40, harvester.x - harvester.speed);
    if (keys.ArrowRight) harvester.x = Math.min(canvas.width - harvester.width - 20, harvester.x + harvester.speed);
    if (keys.ArrowUp) harvester.y = Math.max(canvas.height * 0.55 + 10, harvester.y - harvester.speed);
    if (keys.ArrowDown) harvester.y = Math.min(canvas.height - harvester.height - 10, harvester.y + harvester.speed);
    harvestPlants(true);
}

function desenharCampo() {
    const width = canvas.width;
    const height = canvas.height;
    const horizon = height * 0.56;

    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#7ed0ff');
    sky.addColorStop(1, '#c6e8ff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, horizon);

    const fieldGradient = ctx.createLinearGradient(0, horizon, 0, height);
    fieldGradient.addColorStop(0, '#a67a53');
    fieldGradient.addColorStop(0.35, '#8c5d41');
    fieldGradient.addColorStop(1, '#3e2a1f');
    ctx.fillStyle = fieldGradient;
    ctx.beginPath();
    ctx.moveTo(40, height);
    ctx.lineTo(width - 40, height);
    ctx.lineTo(width - 120, horizon);
    ctx.lineTo(120, horizon);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.moveTo(120, horizon + 10);
    ctx.lineTo(width - 120, horizon + 10);
    ctx.lineTo(width - 110, horizon + 36);
    ctx.lineTo(130, horizon + 36);
    ctx.closePath();
    ctx.fill();

    drawSun();
    drawClouds();
    drawFieldRows();
    drawGrassTexture();
    drawPlants();
    drawColhedeira();
    drawFieldHorizonShadow();
}

function drawSun() {
    ctx.beginPath();
    ctx.arc(620, 60, 38, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe066';
    ctx.fill();
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,210,100,0.6)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(620, 60, 52, 0, Math.PI * 2);
    ctx.stroke();
}

function drawClouds() {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    const clouds = [
        { x: 100, y: 80, s: 40 },
        { x: 230, y: 55, s: 30 },
        { x: 370, y: 90, s: 35 }
    ];
    clouds.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.s, 0, Math.PI * 2);
        ctx.arc(c.x + c.s * 0.8, c.y - 12, c.s * 0.9, 0, Math.PI * 2);
        ctx.arc(c.x + c.s * 1.6, c.y, c.s, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawFieldRows() {
    ctx.strokeStyle = 'rgba(88,45,25,0.9)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i += 1) {
        const y = canvas.height * 0.58 + i * 18;
        const left = 70 + i * 6;
        const right = canvas.width - 70 - i * 6;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.bezierCurveTo(canvas.width * 0.36, y - 6, canvas.width * 0.64, y + 8, right, y - 2);
        ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(110,76,44,0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 14; i += 1) {
        const y = canvas.height * 0.60 + i * 16;
        const left = 82 + i * 3.5;
        const right = canvas.width - 82 - i * 3.5;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y - 4);
        ctx.stroke();
    }
}

function drawPlants() {
    plants.forEach(plant => {
        const { x, y } = plantPosition(plant.row, plant.col);
        if (plant.harvested) return;

        // aplicar escala de perspectiva conforme a linha (row)
        const perspective = Math.max(0.5, 1 - plant.row * 0.12);
        const stemHeight = (30 + (plant.growth / 100) * 42) * perspective;
        const baseX = x + plant.offsetX;
        const baseY = y + plant.offsetY + (1 - perspective) * 18;

        ctx.fillStyle = '#325e20';
        ctx.fillRect(baseX - 3, baseY - stemHeight, 6, stemHeight);

        const leafColor = plant.ready ? '#d4e157' : '#84c341';
        const leafShadow = plant.ready ? '#9aaa1b' : '#5b9d25';

        const leafShapes = [
            { dx: -18, dy: -stemHeight + 20, w: 12 * perspective, h: 22 * perspective, ang: -0.4 },
            { dx: 18, dy: -stemHeight + 32, w: 15 * perspective, h: 24 * perspective, ang: 0.3 },
            { dx: -14, dy: -stemHeight + 52, w: 11 * perspective, h: 18 * perspective, ang: -0.15 },
            { dx: 16, dy: -stemHeight + 68, w: 12 * perspective, h: 20 * perspective, ang: 0.2 }
        ];

        leafShapes.forEach(({ dx, dy, w, h, ang }) => {
            ctx.beginPath();
            ctx.ellipse(baseX + dx, baseY + dy, w + 2, h + 2, ang, 0, Math.PI * 2);
            ctx.fillStyle = leafShadow;
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(baseX + dx, baseY + dy, w, h, ang, 0, Math.PI * 2);
            ctx.fillStyle = leafColor;
            ctx.fill();
        });

        if (plant.ready) {
            const podColor = '#fff176';
            ctx.fillStyle = podColor;
            ctx.beginPath();
            ctx.ellipse(baseX - 10, baseY - stemHeight + 10, 5, 6, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(baseX + 8, baseY - stemHeight + 18, 6, 7, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(baseX + 2, baseY - stemHeight + 36, 6, 8, -0.1, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#a68b14';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(baseX - 14, baseY - stemHeight + 8);
            ctx.lineTo(baseX - 6, baseY - stemHeight + 14);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(baseX + 2, baseY - stemHeight + 24);
            ctx.lineTo(baseX + 12, baseY - stemHeight + 20);
            ctx.stroke();
        }
    });
}

function drawColhedeira() {
    if (!temColhedeira) return;
    const tx = harvester.x;
    const ty = harvester.y;

    // sombra da colhedeira para fixar no solo (soft ellipse)
    ctx.save();
    const shadowGrad = ctx.createRadialGradient(tx + harvester.width / 2, ty + harvester.height + 6, 10, tx + harvester.width / 2, ty + harvester.height + 16, 60);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.35)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(tx + harvester.width / 2, ty + harvester.height + 10, harvester.width * 0.6, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;

    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.moveTo(tx, ty - 30);
    ctx.lineTo(tx + harvester.width, ty - 30);
    ctx.lineTo(tx + harvester.width + 18, ty - 18);
    ctx.lineTo(tx + 18, ty - 18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#d32f2f';
    ctx.beginPath();
    ctx.moveTo(tx + 18, ty - 18);
    ctx.lineTo(tx + harvester.width + 18, ty - 18);
    ctx.lineTo(tx + harvester.width + 18, ty + 14);
    ctx.lineTo(tx + 18, ty + 14);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffca28';
    ctx.beginPath();
    ctx.moveTo(tx - 52, ty - 6);
    ctx.lineTo(tx + 8, ty - 6);
    ctx.lineTo(tx + 18, ty + 8);
    ctx.lineTo(tx - 42, ty + 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffca28';
    ctx.beginPath();
    ctx.moveTo(tx - 52, ty + 10);
    ctx.lineTo(tx + 8, ty + 10);
    ctx.lineTo(tx + 18, ty + 18);
    ctx.lineTo(tx - 42, ty + 18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#4e342e';
    ctx.fillRect(tx + 10, ty - 20, 70, 18);
    ctx.fillRect(tx + 72, ty - 52, 52, 26);
    ctx.fillRect(tx + 18, ty + 4, 48, 10);

    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(tx + 30, ty + 34, 24, 0, Math.PI * 2);
    ctx.arc(tx + 122, ty + 34, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd600';
    ctx.beginPath();
    ctx.arc(tx + 30, ty + 34, 10, 0, Math.PI * 2);
    ctx.arc(tx + 122, ty + 34, 13, 0, Math.PI * 2);
    ctx.fill();

    const glass = ctx.createLinearGradient(tx + 104, ty - 54, tx + 104, ty - 18);
    glass.addColorStop(0, 'rgba(255,255,255,0.95)');
    glass.addColorStop(1, 'rgba(33,33,33,0.3)');
    ctx.fillStyle = glass;
    ctx.fillRect(tx + 100, ty - 54, 46, 36);

    ctx.fillStyle = '#ff8f00';
    ctx.fillRect(tx + 22, ty - 12, 28, 10);
    ctx.fillRect(tx + 76, ty - 12, 28, 10);

    ctx.fillStyle = '#222';
    ctx.fillRect(tx + 160, ty - 36, 6, 26);

    ctx.fillStyle = '#f9a825';
    ctx.beginPath();
    ctx.arc(tx + 42, ty - 40, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tx + 90, ty - 40, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.strokeStyle = '#b71c1c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx - 52, ty + 2);
    ctx.lineTo(tx - 30, ty + 2);
    ctx.lineTo(tx - 16, ty - 10);
    ctx.lineTo(tx + 20, ty - 10);
    ctx.lineTo(tx + 28, ty - 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tx - 52, ty + 18);
    ctx.lineTo(tx - 30, ty + 18);
    ctx.lineTo(tx - 16, ty + 4);
    ctx.lineTo(tx + 20, ty + 4);
    ctx.lineTo(tx + 28, ty + 10);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx + 102, ty - 48);
    ctx.lineTo(tx + 140, ty - 32);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx + 108, ty - 36);
    ctx.lineTo(tx + 146, ty - 22);
    ctx.stroke();
}

function drawGrassTexture() {
    const width = canvas.width;
    const height = canvas.height;
    const horizon = height * 0.56;
    const left = 90;
    const right = width - 90;

    // desenhar sulcos com tons mais escuros para profundidade (estáticos)
    ctx.strokeStyle = 'rgba(60,32,18,0.9)';
    ctx.lineWidth = 1.6;
    for (let r = 0; r < 10; r++) {
        const y = horizon + 8 + r * 18;
        ctx.beginPath();
        ctx.moveTo(left + r * 4, y);
        ctx.quadraticCurveTo(width * 0.5, y + 6 + r * 0.2, right - r * 4, y - 4);
        ctx.stroke();
    }

    // desenhar torrões estáticos gerados em createField
    soilClods.forEach(clod => {
        ctx.beginPath();
        ctx.ellipse(clod.x, clod.y, clod.w, clod.h, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${clod.shade}, ${clod.shade - 20}, ${clod.shade - 40}, 1)`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${Math.max(30, clod.shade - 50)}, ${Math.max(20, clod.shade - 70)}, ${Math.max(15, clod.shade - 80)}, 0.6)`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
    });

    // brilho suave para sugerir relevo sob luz
    const grad = ctx.createLinearGradient(0, horizon + 10, 0, height);
    grad.addColorStop(0, 'rgba(255,255,255,0.03)');
    grad.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(left, height);
    ctx.lineTo(right, height);
    ctx.lineTo(right - 20, horizon + 30);
    ctx.lineTo(left + 20, horizon + 30);
    ctx.closePath();
    ctx.fill();
}

function drawFieldHorizonShadow() {
    const width = canvas.width;
    const height = canvas.height;
    const horizon = height * 0.56;
    const grad = ctx.createLinearGradient(0, horizon, 0, horizon + 48);
    grad.addColorStop(0, 'rgba(0,0,0,0.12)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(120, horizon);
    ctx.lineTo(width - 120, horizon);
    ctx.lineTo(width - 100, horizon + 48);
    ctx.lineTo(100, horizon + 48);
    ctx.closePath();
    ctx.fill();
}

function animar() {
    atualizarPosicao();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharCampo();
    requestAnimationFrame(animar);
}

function handleKeyDown(event) {
    keys[event.key] = true;
    if (event.key.toLowerCase() === 'e') {
        harvestPlants();
    }
}

function handleKeyUp(event) {
    keys[event.key] = false;
}

function startGame() {
    plantarBtn.addEventListener('click', plantarSementes);
    irrigarBtn.addEventListener('click', irrigar);
    colhedeiraBtn.addEventListener('click', comprarColhedeira);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    atualizarInterface();
    animar();
    setInterval(cicloDiario, 1200);
}

startGame();
