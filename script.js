// Инициализация игровых данных из памяти браузера (чтобы прогресс не пропадал)
let gold = parseInt(localStorage.getItem('clicker_gold')) || 0;
let diamonds = parseInt(localStorage.getItem('clicker_diamonds')) || 0;
let clickPower = parseInt(localStorage.getItem('clicker_power')) || 1; // Сила клика (по умолчанию 1)

// Список базовых имён для генерации ТОП-100 ботов
const botNames = ["Ivan_Pro", "CryptoKing", "MiniApp_Dev", "Shadow", "Alex777", "Luna", "ClickMaster", "Digger", "CyberUser", "Phoenix"];
let leaderData = [];

// Функция обновления всего интерфейса игры
function updateUI() {
    document.getElementById('goldBalance').innerText = gold;
    document.getElementById('diamondBalance').innerText = diamonds;
    document.getElementById('click-power-display').innerText = `КЛИК: +${clickPower} G`;
    
    localStorage.setItem('clicker_gold', gold);
    localStorage.setItem('clicker_diamonds', diamonds);
    localStorage.setItem('clicker_power', clickPower.toString());
    
    generateLeaderboard();
}

// Клик по монете
function clickCoin() {
    gold += clickPower; // Добавляем столько золота, сколько прокачан клик
    updateUI();
}

// Магазин: Обмен 1000 золота на 1 Алмаз
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

// Магазин: Покупка +1 к клику за 100 Алмазов
function buyClickUpgrade() {
    if (diamonds >= 100) {
        diamonds -= 100;
        clickPower += 1; // Увеличиваем силу клика навсегда
        updateUI();
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

// Генерация Топ-100 с интеграцией реального имени из Telegram
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
        let botScore = 15000 - (i * 145) + (i % 3 === 0 ? 50 : -30); 
        if (botScore < 0) botScore = 0;
        leaderData.push({ name: `${botNames[botIndex]}_${i}`, score: botScore, isMe: false });
    }

    leaderData.sort((a, b) => b.score - a.score);

    const listEl = document.getElementById('leaderboardList');
    if (listEl) {
        listEl.innerHTML = '';
        leaderData.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item' + (player.isMe ? ' my-row' : '');
            item.innerHTML = `<span>${index + 1}. ${player.name}</span><span>${player.score} G</span>`;
            listEl.appendChild(item);
        });
    }
}

// Настройка AdsGram (debug: true защищает вас от банов во время собственных тестов)
// Обязательно замените 'YOUR_BLOCK_ID' на ваш настоящий ID блока, когда выйдете в продакшн
const AdController = window.Adsgram 
    ? window.Adsgram.createAdController({ blockId: "YOUR_BLOCK_ID", debug: true }) 
    : null;

function showAd() {
    if (!AdController) {
        alert("Режим тестирования: Adsgram не найден. Начислено +500 G");
        gold += 500;
        updateUI();
        return;
    }

    AdController.show()
        .then((result) => {
            gold += 500;
            updateUI();
            alert("Спасибо за просмотр! Вам начислено 500 G");
        })
        .catch((result) => {
            console.error("Ad error:", result);
            alert("Реклама не была досмотрена или возникла ошибка соединения.");
        });
}

// Запуск при старте страницы
document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand(); // Разворачивает Mini App на всю высоту экрана телефона
    }
});
