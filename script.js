// Configurações Iniciais
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let money = 100;
let water = 100;
let score = 0;
let temTrator = false;
let sojaCrescimento = 0; // Vai de 0 a 100

// Elementos da Interface (certifique-se de que os IDs existam no HTML)
const spanMoney = document.getElementById('money');
const spanWater = document.getElementById('water');
const spanScore = document.getElementById('score');

// Função para atualizar os números na tela
function atualizarInterface() {
    spanMoney.innerText = money;
    spanWater.innerText = Math.floor(water) + "%";
    spanScore.innerText = score;
}

// Lógica de Compra e Ações
function comprarTrator() {
    if (money >= 50 && !temTrator) {
        money -= 50;
        temTrator = true;
        atualizarInterface();
        alert("🚜 Tecnologia adquirida! Seu plantio ficou mais eficiente.");
    } else if (temTrator) {
        alert("Você já possui um trator!");
    } else {
        alert("Dinheiro insuficiente!");
    }
}

function irrigar() {
    if (money >= 10) {
        money -= 10;
        water = 100;
        atualizarInterface();
    } else {
        alert("Dinheiro insuficiente para irrigar!");
    }
}

// Loop Principal do Jogo (Lógica de Tempo)
setInterval(() => {
    if (water > 0) {
        // Se tiver trator, cresce 5 por segundo, senão cresce 2
        let taxaCrescimento = temTrator ? 5 : 2;
        sojaCrescimento += taxaCrescimento;
        
        // Gasta água proporcionalmente ao crescimento
        water -= 1.5; 
    }

    // Lógica de Colheita
    if (sojaCrescimento >= 100) {
        score += 10; // Sacas produzidas
        money += 40; // Lucro da venda
        sojaCrescimento = 0; // Reseta para o próximo plantio
    }

    if (water < 0) water = 0;
    
    atualizarInterface();
}, 1000);

// Função de Desenho (Gráficos)
function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Solo (Muda de cor conforme a umidade)
    ctx.fillStyle = water > 30 ? "#5d4037" : "#8d6e63"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Plantação de Soja
    if (sojaCrescimento > 0) {
        ctx.fillStyle = "#4caf50";
        // A planta cresce de baixo para cima
        let alturaPlanta = (sojaCrescimento / 100) * 150;
        ctx.fillRect(canvas.width / 2 - 25, 300 - alturaPlanta, 50, alturaPlanta);
        
        // Flor da soja (quando está quase pronta)
        if (sojaCrescimento > 80) {
            ctx.fillStyle = "#fff176";
            ctx.beginPath();
            ctx.arc(canvas.width / 2, 300 - alturaPlanta, 15, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 3. Ícone do Trator (Representação visual da tecnologia)
    if (temTrator) {
        ctx.fillStyle = "#d32f2f";
        ctx.fillRect(20, 20, 60, 40);
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText("TRATOR", 25, 45);
    }

    requestAnimationFrame(desenhar);
}

// Inicia o visual
desenhar();
