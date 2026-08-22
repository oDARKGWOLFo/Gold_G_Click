// Инициализация игровых данных из памяти браузера
let gold = parseInt(localStorage.getItem('clicker_gold')) || 0;
let diamonds = parseInt(localStorage.getItem('clicker_diamonds')) || 0;
let clickPower = parseInt(localStorage.getItem('clicker_power')) || 1;

// Переменные для таймера и еженедельного сброса
let nextResetTime = parseInt(localStorage.getItem('next_reset_time')) || 0;

const botNames = ["Ivan_Pro", "CryptoKing", "MiniApp_Dev", "Shadow", "Alex777", "Luna", "ClickMaster", "Digger", "CyberUser", "Phoenix"];
let leaderData = [];

// Проверка и инициализация времени окончания текущего 7-дневного сезона
function checkSeasonStatus() {
    const now = Date.now();
    
    // Если таймер не установлен, создаем новый на 7 дней от текущего момента
    if (nextResetTime === 0) {
        nextResetTime = now + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem('next_reset_time', nextResetTime.toString());
    }
    
    // Если время вышло — завершаем сезон и распределяем награды
    if (now >= nextResetTime) {
        endCurrentSeason();
    }
}

// Завершение сезона, выдача призов и обнуление рейтинга
function endCurrentSeason() {
    // Формируем финальный список перед сбросом, чтобы узнать, на каком месте игрок
    generateLeaderboard();
    
    // Ищем, на каком месте оказался реальный игрок
    const myRankIndex = leaderData.findIndex(player => player.isMe);
    const myRankPosition = myRankIndex + 1; // Позиция (1, 2, 3 и т.д.)
    
    let rewardDiamonds = 0;
    let rewardMessage = "Сезон окончен! Рейтинг обновлен.";

    if (myRankPosition === 1) {
        rewardDiamonds = 100;
        rewardMessage = "🏆 Поздравляем! Вы заняли 1 место в сезоне и выиграли 100 Алмазов 💎!";
    } else if (myRankPosition === 2) {
        rewardDiamonds = 50;
        rewardMessage = "🥈 Отлично! Вы заняли 2 место в сезоне и выиграли 50 Алмазов 💎!";
    } else if (myRankPosition === 3) {
        rewardDiamonds = 10;
        rewardMessage = "🥉 Супер! Вы заняли 3 место в сезоне и выиграли 10 Алмазов 💎!";
    }

    // Начисляем награду за ТОП
    if (rewardDiamonds > 0) {
        diamonds += rewardDiamonds;
        alert(rewardMessage);
    } else {
        alert(`Сезон окончен! Вы заняли ${myRankPosition} место. Попробуйте на следующей неделе пробиться в ТОП-3!`);
    }

    // Обнуляем золото игрока за сезон (прокачка клика и алмазы остаются!)
    gold = 0;
    
    // Ставим новый таймер на следующие 7 дней
    nextResetTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('next_reset_time', nextResetTime.toString());
    
    updateUI();
}

// Запуск обратного отсчета (работает каждую секунду при открытом рейтинге)
function startTimerCountdown() {
    setInterval(() => {
        const timerEl = document.getElementById('seasonTimer');
        if (!timerEl) return;
        
        const now = Date.now();
        const timeLeft = nextResetTime - now;
        
        if (timeLeft <= 0) {
            endCurrentSeason();
            return;
        }
        
        // Переводим миллисекунды в Дни, Часы, Минуты и Секунды
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        timerEl.innerText = `До обнуления: ${days}д ${hours}ч ${minutes}м ${seconds}с`;
    }, 1000);
}

// Обновление интерфейса
function updateUI() {
    document.getElementById('goldBalance').innerText = gold;
    document.getElementById('diamondBalance').innerText = diamonds;
    document.getElementById('click-power-display').innerText = `КЛИК: +${clickPower} G`;
    
    localStorage.setItem('clicker_gold', gold);
    localStorage.setItem('clicker_diamonds', diamonds);
    localStorage.setItem('clicker_power', clickPower.toString());
    
    generateLeaderboard();
}

function clickCoin() {
    gold += clickPower;
    updateUI();
}

function buyDiamond() {
    if (gold >= 1000) {
        gold -= 1000;
        diamonds += 1;
        updateUI();
        alert("Успешный обмен! Вы получили 1 алмаз 💎");
    } else {
        alert("Недостаточно золота (G) для обмена!");
    }
}

function buyClickUpgrade() {
    if (diamonds >= 100) {
        diamonds -= 100;
        clickPower += 1;
        updateUI();
        alert(`Улучшение куплено! Теперь каждый клик приносит +${clickPower} G 🚀`);
    } else {
        alert("Недостаточно алмазов 💎 для покупки апгрейда!");
    }
}

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Генерация списка с медалями для ТОП-3
function generateLeaderboard() {
    leaderData = [];
    
    let telegramName = "Вы (Выбранный профиль)";
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        telegramName = user.first_name + (user.last_name ? " " + user.last_name : "");
    }
    
    leaderData.push({ name: telegramName, score: gold, isMe: true });
    
    // Генерируем фиксированные показатели ботов
    for (let i = 1; i <= 99; i++) {
        let botIndex = i % botNames.length;
        // Базовый счет ботов настроен так, чтобы активный игрок мог конкурировать с ними за ТОП-3
        let botScore = 8000 - (i * 80) + (i % 3 === 0 ? 30 : -20); 
        if (botScore < 0) botScore = 0;
        leaderData.push({ name: `${botNames[botIndex]}_${i}`, score: botScore, isMe: false });
    }

    leaderData.sort((a, b) => b.score - a.score);

    const listEl = document.getElementById('leaderboardList');
    if (listEl) {
        listEl.innerHTML = '';
        leaderData.forEach((player, index) => {
            const position = index + 1;
            let badge = `${position}. `; // По умолчанию просто цифра
            
            // Заменяем первые 3 цифры на медали, как вы просили
            if (position === 1) badge = "🏆 ";
            if (position === 2) badge = "🥈 ";
            if (position === 3) badge = "🥉 ";

            const item = document.createElement('div');
            item.className = 'leaderboard-item' + (player.isMe ? ' my-row' : '');
            item.innerHTML = `<span>${badge}${player.name}</span><span>${player.score} G</span>`;
            listEl.appendChild(item);
        });
    }
}

const AdController = window.Adsgram 
    ? window.Adsgram.createAdController({ blockId: "YOUR_BLOCK_ID", debug: true }) 
    : null;

function showAd() {
    if (!AdController) {
        alert("Режим тестирования: Adsgram не найден. Начислено +100 G");
        gold += 100;
        updateUI();
        return;
    }

    AdController.show()
        .then((result) => {
            gold += 100;
            updateUI();
            alert("Спасибо за просмотр! Вам начислено 100 G");
        })
        .catch((result) => {
            console.error("Ad error:", result);
            alert("Реклама не была досмотрена или возникла ошибка соединения.");
        });
}

// Запуск при старте
document.addEventListener("DOMContentLoaded", () => {
    checkSeasonStatus(); // Проверяем, не пора ли обнулить сезон
    updateUI();
    startTimerCountdown(); // Запускаем тиканье таймера
    
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }
});
