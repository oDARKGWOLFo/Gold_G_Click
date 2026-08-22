// Инициализация баланса из памяти браузера (чтобы прогресс не пропадал)
let gold = parseInt(localStorage.getItem('clicker_gold')) || 0;
let diamonds = parseInt(localStorage.getItem('clicker_diamonds')) || 0;

// Список базовых имён для генерации ТОП-100 ботов
const botNames = ["Ivan_Pro", "CryptoKing", "MiniApp_Dev", "Shadow", "Alex777", "Luna", "ClickMaster", "Digger", "CyberUser", "Phoenix"];
let leaderData = [];

// Функция обновления текста на экране и сохранения данных
function updateUI() {
    document.getElementById('goldBalance').innerText = gold;
    document.getElementById('diamondBalance').innerText = diamonds;
    localStorage.setItem('clicker_gold', gold);
    localStorage.setItem('clicker_diamonds', diamonds);
    generateLeaderboard();
}

// Клик по золотой монете (+1 G)
function clickCoin() {
    gold += 1;
    updateUI();
}

// Обмен в магазине (1000 G -> 1 Алмаз)
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

// Управление отображением модальных окон
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Динамическая генерация списка ТОП-100 игроков вокруг текущего баланса
function generateLeaderboard() {
    leaderData = [];
    
    // Добавляем реального игрока
    leaderData.push({ name: "Вы (Выбранный профиль)", score: gold, isMe: true });
    
    // Генерируем 99 ботов с фиксированным шагом очков
    for (let i = 1; i <= 99; i++) {
        let botIndex = i % botNames.length;
        let botScore = 15000 - (i * 145) + (i % 3 === 0 ? 50 : -30); 
        if (botScore < 0) botScore = 0;
        leaderData.push({ name: `${botNames[botIndex]}_${i}`, score: botScore, isMe: false });
    }

    // Сортируем список: у кого больше золота, тот выше
    leaderData.sort((a, b) => b.score - a.score);

    // Очищаем и заново заполняем контейнер в HTML
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

// Настройка интеграции AdsGram
// ВНИМАНИЕ: Обязательно замените 'YOUR_BLOCK_ID' на ваш новый ID блока из AdsGram!
// Флаг debug: true активирует безопасный тестовый режим рекламы, чтобы вас не забанили
const AdController = window.Adsgram 
    ? window.Adsgram.createAdController({ blockId: "YOUR_BLOCK_ID", debug: true }) 
    : null;

// Логика кнопки просмотра рекламы (+100 G)
function showAd() {
    if (!AdController) {
        // Запасной вариант на случай, если скрипт AdsGram заблокирован AdBlocker-ом
        alert("Режим отладки: Adsgram не инициализирован. Начислено тестовое вознаграждение +100 G");
        gold += 100;
        updateUI();
        return;
    }

    AdController.show()
        .then((result) => {
            // Видео успешно досмотрено до конца
            gold += 100;
            updateUI();
            alert("Реклама просмотрена! Вам начислено +100 G");
        })
        .catch((result) => {
            // Пользователь закрыл рекламу раньше времени или произошла ошибка
            console.error("AdsGram ошибка или пропуск:", result);
            alert("Реклама не была досмотрена до конца. Награда не начислена.");
        });
}

// Первоначальный запуск интерфейса при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    updateUI();
});
