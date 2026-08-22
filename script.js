// ГИБРИДНАЯ ЗАГРУЗКА: Мгновенно берем данные из локальной памяти, чтобы экран не был пустым
let gold = parseInt(localStorage.getItem('clicker_gold')) || 0;
let diamonds = parseInt(localStorage.getItem('clicker_diamonds')) || 0;
let clickPower = parseInt(localStorage.getItem('clicker_power')) || 1;
let nextResetTime = parseInt(localStorage.getItem('next_reset_time')) || 0;

const botNames = ["Ivan_Pro", "CryptoKing", "MiniApp_Dev", "Shadow", "Alex777", "Luna", "ClickMaster", "Digger", "CyberUser", "Phoenix"];
let leaderData = [];

// ФУНКЦИЯ ДЛЯ СИНХРОННОГО ВЫВОДА РЕСУРСОВ НА ЭКРАН
function updateUI() {
    const goldEl = document.getElementById('goldBalance');
    const diamondEl = document.getElementById('diamondBalance');
    const powerEl = document.getElementById('click-power-display');

    if (goldEl) goldEl.innerText = gold;
    if (diamondEl) diamondEl.innerText = diamonds;
    if (powerEl) powerEl.innerText = `КЛИК: +${clickPower} G`;
    
    // Дублируем сохранение в локальную память смартфона для мгновенных перезагрузок
    localStorage.setItem('clicker_gold', gold.toString());
    localStorage.setItem('clicker_diamonds', diamonds.toString());
    localStorage.setItem('clicker_power', clickPower.toString());
    localStorage.setItem('next_reset_time', nextResetTime.toString());
}

// ФОНОВАЯ СИНХРОНИЗАЦИЯ С ОБЛАКОМ ТЕЛЕГРАМА
function syncWithTelegramCloud() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
        // Запрашиваем данные из облака
        window.Telegram.WebApp.CloudStorage.getItems(['cloud_gold', 'cloud_diamonds', 'cloud_power', 'cloud_reset_time'], (err, values) => {
            if (!err && values) {
                let cloudGold = parseInt(values.cloud_gold) || 0;
                let cloudDiamonds = parseInt(values.cloud_diamonds) || 0;
                let cloudPower = parseInt(values.cloud_power) || 1;
                let cloudResetTime = parseInt(values.cloud_reset_time) || 0;

                // Если в облаке прогресс больше, чем на телефоне — обновляем локальные переменные
                if (cloudGold > gold) gold = cloudGold;
                if (cloudDiamonds > diamonds) diamonds = cloudDiamonds;
                if (cloudPower > clickPower) clickPower = cloudPower;
                if (cloudResetTime > nextResetTime && cloudResetTime !== 0) nextResetTime = cloudResetTime;

                // Перерисовываем интерфейс с новыми данными из облака
                checkSeasonStatus();
                updateUI();
                generateLeaderboard();
            }
        });
    }
}

// ФУНКЦИЯ ДЛЯ ЖЕЛЕЗНОГО СОХРАНЕНИЯ В ОБЛАКО
function saveDataToCloud() {
    updateUI(); // Сначала обновляем локально

    // Затем отправляем в облако Telegram
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
        window.Telegram.WebApp.CloudStorage.setItem('cloud_gold', gold.toString());
        window.Telegram.WebApp.CloudStorage.setItem('cloud_diamonds', diamonds.toString());
        window.Telegram.WebApp.CloudStorage.setItem('cloud_power', clickPower.toString());
        window.Telegram.WebApp.CloudStorage.setItem('cloud_reset_time', nextResetTime.toString());
    }
}

// Клик по монете
function clickCoin() {
    gold += clickPower;
    updateUI();
    saveDataToCloud(); 
    generateLeaderboard();
}

// Магазин: Обмен 1000 золота на 1 Алмаз
function buyDiamond() {
    if (gold >= 1000) {
        gold -= 1000;
        diamonds += 1;
        saveDataToCloud();
        generateLeaderboard();
        alert("Успешный обмен! Вы получили 1 алмаз 💎");
    } else {
        alert("Недостаточно золота (G) для обмена!");
    }
}

// Магазин: Покупка +1 к клику за 100 Алмазов
function buyClickUpgrade() {
    if (diamonds >= 100) {
        diamonds -= 100;
        clickPower += 1;
        saveDataToCloud();
        alert(`Улучшение куплено! Теперь каждый клик приносит +${clickPower} G 🚀`);
    } else {
        alert("Недостаточно алмазов 💎 для покупки апгрейда!");
    }
}

// Управление модальными окнами
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Проверка и инициализация времени окончания текущего 7-дневного сезона
function checkSeasonStatus() {
    const now = Date.now();
    
    if (nextResetTime === 0) {
        nextResetTime = now + (7 * 24 * 60 * 60 * 1000);
        saveDataToCloud();
    }
    
    if (now >= nextResetTime) {
        generateLeaderboard();
        const myRankIndex = leaderData.findIndex(player => player.isMe);
        const myRankPosition = myRankIndex + 1; 
        
        let rewardDiamonds = 0;
        if (myRankPosition === 1) rewardDiamonds = 100;
        else if (myRankPosition === 2) rewardDiamonds = 50;
        else if (myRankPosition === 3) rewardDiamonds = 10;

        if (rewardDiamonds > 0) {
            diamonds += rewardDiamonds;
            alert(`Сезон окончен! Вы заняли ${myRankPosition} место и выиграли ${rewardDiamonds} 💎!`);
        } else {
            alert(`Сезон окончен! Вы заняли ${myRankPosition} место. Попробуйте на следующей неделе!`);
        }

        gold = 0; 
        nextResetTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
        saveDataToCloud();
    }
}

// Запуск обратного отсчета таймера
function startTimerCountdown() {
    setInterval(() => {
        const timerEl = document.getElementById('seasonTimer');
        if (!timerEl) return;
        
        const now = Date.now();
        const timeLeft = nextResetTime - now;
        
        if (timeLeft <= 0) {
            checkSeasonStatus();
            return;
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        timerEl.innerText = `До обнуления: ${days}д ${hours}ч ${minutes}м ${seconds}с`;
    }, 1000);
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
    
    for (let i = 1; i <= 99; i++) {
        let botIndex = i % botNames.length;
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
            let badge = `${position}. `; 
            
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

// Реклама AdsGram
const AdController = window.Adsgram 
    ? window.Adsgram.createAdController({ blockId: "YOUR_BLOCK_ID", debug: true }) 
    : null;

function showAd() {
    if (!AdController) {
        alert("Режим тестирования: Adsgram не найден. Начислено +500 G");
        gold += 500;
        updateUI();
        saveDataToCloud();
        return;
    }

    AdController.show()
        .then((result) => {
            gold += 500;
            updateUI();
            saveDataToCloud(); 
            alert("Спасибо за просмотр! Вам начислено 500 G");
        })
        .catch((result) => {
            console.error("Ad error:", result);
            alert("Реклама не была досмотрена или возникла ошибка соединения.");
        });
}

// Сохраняем результат
        localStorage.setItem('local_energy', energy.toString());
        localStorage.setItem('local_cooldown', energyCooldown.toString());
        
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
            window.Telegram.WebApp.CloudStorage.setItem('player_energy', energy.toString(), () => {});
        }
    }
}

// Запускаем проверку при открытии игры
applyOfflineProgress();

// Запускаем проверку, если игру просто свернули/развернули
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        applyOfflineProgress();
    }
});
// ==========================================
