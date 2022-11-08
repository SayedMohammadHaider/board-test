pageLoad();

function pageLoad() {
    var currentCoin = localStorage.getItem('coin');
    if (currentCoin == undefined || currentCoin == null) {
        localStorage.setItem('coin', 100);
        currentCoin = 100;
    }
    var coinCountIdDiv = document.getElementById('coinCountId');
    coinCountIdDiv.innerHTML = currentCoin;
}

function playWithBotIdClick() {
    window.location.href = "board.html";
}