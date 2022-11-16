import { io } from 'socket.io-client';

var cards = {
    botCard: [],
    placedCard: [],
    playerCard: []
};
var playerCardIdDiv = document.getElementById('playerCardId');
var placedCardIdDiv = document.getElementById('placedCardId');
var botHeroNameDiv = document.getElementById('botHeroName');
var playerHeroNameDiv = document.getElementById('playerHeroName');
var heroClick = document.getElementById('heroClickId');
var yourRoomId = document.getElementById('yourRoomId');
var friendIdSubmitted = document.getElementById('friendIdSubmitted');
var friendSocketId = document.getElementById('friendSocketId');
var invalidId = document.getElementById('invalidId');
var playAgain = document.getElementById('playAgain');
var roomId = null;
var playerCurrentIndex = 0;
var botCurrentIndex = 0;
var release = true;
var isGameEnd = false;
var isBotCardEmpty = false;
var placedCardBorderLeft = 6;
var loadBotImageBefore = '';
var loadPlayerImageBefore = '';
var currentPlayerSocketId = '';
var isPlayingWithFriend = false;

const socket = io('https://sayedhaider300.github.io:3000/board-server/');
socket.on('connect', () => {
    console.log(socket.id);
    currentPlayerSocketId = socket.id;
    yourRoomId.innerHTML = socket.id;
});

socket.on("receiveMessage", (friendCardIndex, friendCardNextIndex, playerRoomId) => {
    roomId = playerRoomId;
    playerClick(friendCardIndex, friendCardNextIndex)
});

socket.on("startMatchMessage", (startMatch) => {
    if (startMatch)
        document.getElementById('setupRoomIdBox').style.visibility = "hidden";
});

socket.on("rematchMessage", (rematch) => {
    if (rematch) {
        resetGame();
    }
});

pageLoad();

function pageLoad() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    isPlayingWithFriend = params.isFriend;
    var currentCoin = localStorage.getItem('coin');
    if (currentCoin == undefined || currentCoin == null) {
        localStorage.setItem('coin', 100);
    }
    loadPlayerCard();
    if (isPlayingWithFriend == "true") {
        document.getElementById('setupRoomIdBox').style.visibility = "visible";
    }
    else {
        loadBotCard();
    }
}

function loadPlayerCard() {
    const randomIntArrayInRange = (min, max, n = 1) =>
        Array.from(
            { length: n },
            () => Math.floor(Math.random() * (max - min + 1)) + min
        );
    var playerCardsList = randomIntArrayInRange(1, allCard.length, 20);
    console.log(playerCardsList);
    var upcomingPlayerResult = allCard.find(({ sn }) => sn === playerCardsList[0]);
    toDataUrl(upcomingPlayerResult.image, function (myBase64) {
        loadPlayerImageBefore = myBase64;
    });
    cards.playerCard = playerCardsList;
}

function loadBotCard() {
    const randomIntArrayInRange = (min, max, n = 1) =>
        Array.from(
            { length: n },
            () => Math.floor(Math.random() * (max - min + 1)) + min
        );
    var botCardsList = randomIntArrayInRange(1, allCard.length, 20);
    console.log(botCardsList);
    var upcomingBotResult = allCard.find(({ sn }) => sn === botCardsList[0]);
    toDataUrl(upcomingBotResult.image, function (myBase64) {
        loadBotImageBefore = myBase64;
    });
    cards.botCard = botCardsList;
}

playAgain.addEventListener("click", () => {
    if (isPlayingWithFriend == "true") {
        socket.emit("rematch", true, roomId);
        resetGame();
    }
    else {
        window.location.reload();
    }
});

function resetGame() {
    loadPlayerCard();
    placedCardIdDiv.innerHTML = '';
    document.getElementById('setupDialogBox').style.visibility = "hidden";
    release = true;
    isGameEnd = false;
    playerHeroNameDiv.innerHTML = '';
    botHeroNameDiv.innerHTML = '';
}

// This method is to show spinner
function showSpinner() {
    document.getElementById("spinner").style.display = "block";
}

function showWaitMessage(message) {
    document.getElementById("waitMessage").style.display = "block";
    document.getElementById("waitMessage").innerHTML = message;
}

function hideWaitMessage() {
    document.getElementById("waitMessage").style.display = "none";
}

// Method to hide spinner
function hideSpinner() {
    document.getElementById("spinner").style.display = "none";
}

friendIdSubmitted.addEventListener("click", () => {
    if (friendSocketId.value == null || friendSocketId.value == "") {
        invalidId.innerHTML = "Please enter friend room id or ask your friend to enter your room id";
    }
    else {
        document.getElementById('setupRoomIdBox').style.visibility = "hidden";
        roomId = friendSocketId.value;
        socket.emit("startMatch", true, friendSocketId.value);
    }
});

heroClick.addEventListener("click", () => {
    if (!isGameEnd) {
        if (release) {
            playerFlipCardSound();
            var cardLength = cards.playerCard.length;
            var cardValue = cards.playerCard[playerCurrentIndex];
            console.log(cardValue);
            var result = allCard.find(({ sn }) => sn === cardValue);
            var matchResult = checkMatch(result.heroMatchId, false);
            cards.placedCard.push(result);
            var heroName = heroNameList.find(x => x.id === result.heroMatchId).name;
            playerHeroNameDiv.innerHTML = '<h4>' + heroName + '</h4>';
            var upcomingCardValue = cards.playerCard[playerCurrentIndex + 1];
            var upcomingPlayerResult = allCard.find(({ sn }) => sn === upcomingCardValue);
            if (loadPlayerImageBefore == '') {
                placedCardIdDiv.innerHTML = '<img class="cardPlacedImg" style="border-left-width: ' + placedCardBorderLeft + 'px;" src="' + result.image + '" />';
            }
            else {
                placedCardIdDiv.innerHTML = '<img class="cardPlacedImg" style="border-left-width: ' + placedCardBorderLeft + 'px;" src="' + loadPlayerImageBefore + '" />';
            }

            toDataUrl(upcomingPlayerResult.image, function (myBase64) {
                loadPlayerImageBefore = myBase64;
            });

            if (isPlayingWithFriend == "true") {
                socket.emit("sendMessage", cardValue, upcomingCardValue, currentPlayerSocketId, roomId);
            }
            else {
                botAutoClick();
            }
            release = false;
            placedCardBorderLeft++;
            if (matchResult && matchResult.botWins == false) {
                isGameEnd = true;
                wonMessage(true);
                return;
            }
            playerCurrentIndex = playerCurrentIndex + 1;
            if (cardLength <= playerCurrentIndex) {
                playerCardIdDiv.innerHTML = '';
                return;
            }
            if (isBotCardEmpty) {
                isGameEnd = true;
            }
        }
    }
});

function checkMatch(matchId, isBot = true) {
    if (cards.placedCard.length > 0) {
        if (cards.placedCard[cards.placedCard.length - 1].heroMatchId === matchId) {
            if (isBot) {
                return { botWins: true };
            }
            else {
                return { botWins: false };
            }
        }
    }
}

var playerCardSound = new Audio(playerCardSoundBase64);
var botCardSound = new Audio(botCardSoundBase64);

function playerFlipCardSound() {
    playerCardSound.play();
}

function botFlipCardSound() {
    botCardSound.play();
}

function wonMessage(isPlayerWon = false) {
    var currentCoin = parseInt(localStorage.getItem("coin"));
    document.getElementById('setupDialogBox').style.visibility = "visible";
    if (isPlayerWon) {
        document.getElementById('wonCoinMessage').innerHTML = 'You won 10 coins';
        currentCoin = currentCoin + 10;
        localStorage.setItem('coin', currentCoin);
    }
    else {
        document.getElementById('wonCoinMessage').innerHTML = 'You lose 10 coins';
        currentCoin = currentCoin - 10;
        localStorage.setItem('coin', currentCoin);
    }
}

function toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

function playerClick(friendCardIndex, friendCardNextIndex) {
    if (friendCardNextIndex != null) {
        botFlipCardSound();
        var cardLength = cards.botCard.length;
        // var cardValue = cards.botCard[friendCardIndex];
        var result = allCard.find(({ sn }) => sn === friendCardIndex);
        var matchResult = checkMatch(result.heroMatchId);
        cards.placedCard.push(result);
        var heroName = heroNameList.find(x => x.id === result.heroMatchId).name;
        botHeroNameDiv.innerHTML = '<h4>' + heroName + '</h4>';
        // var upcomingCardValue = cards.botCard[friendCardNextIndex + 1];
        var upcomingBotResult = allCard.find(({ sn }) => sn === friendCardNextIndex);
        if (loadBotImageBefore == '') {
            placedCardIdDiv.innerHTML = '<img class="cardPlacedImg" style="border-left-width: ' + placedCardBorderLeft + 'px;" src="' + result.image + '" />'
        }
        else {
            placedCardIdDiv.innerHTML = '<img class="cardPlacedImg" style="border-left-width: ' + placedCardBorderLeft + 'px;" src="' + loadBotImageBefore + '" />'
        }

        toDataUrl(upcomingBotResult.image, function (myBase64) {
            loadBotImageBefore = myBase64;
        });

        if (matchResult && matchResult.botWins == true) {
            isGameEnd = true;
            wonMessage(false);
            return;
        }
        release = true;
        // if (cardLength <= botCurrentIndex + 1) {
        //     var botCardIdDiv = document.getElementById('botCardId');
        //     botCardIdDiv.innerHTML = '';
        //     isBotCardEmpty = true;
        //     return;
        // }
        // botCurrentIndex = botCurrentIndex + 1;
    }
}

function botAutoClick() {
    if (!isGameEnd && !isBotCardEmpty) {
        release = false;
        var botWillPlayInSecs = Math.floor(Math.random() * 1000) + 1000;
        setTimeout(() => {
            botFlipCardSound();
            release = true;
            var cardLength = cards.botCard.length;
            var cardValue = cards.botCard[botCurrentIndex];
            var result = allCard.find(({ sn }) => sn === cardValue);
            var matchResult = checkMatch(result.heroMatchId);
            cards.placedCard.push(result);
            var heroName = heroNameList.find(x => x.id === result.heroMatchId).name;
            botHeroNameDiv.innerHTML = '<h4>' + heroName + '</h4>';
            var upcomingCardValue = cards.botCard[botCurrentIndex + 1];
            var upcomingBotResult = allCard.find(({ sn }) => sn === upcomingCardValue);
            if (loadBotImageBefore == '') {
                placedCardIdDiv.innerHTML = '<img class="cardPlacedImg" style="border-left-width: ' + placedCardBorderLeft + 'px;" src="' + result.image + '" />'
            }
            else {
                placedCardIdDiv.innerHTML = '<img class="cardPlacedImg" style="border-left-width: ' + placedCardBorderLeft + 'px;" src="' + loadBotImageBefore + '" />'
            }

            toDataUrl(upcomingBotResult.image, function (myBase64) {
                loadBotImageBefore = myBase64;
            });

            if (matchResult && matchResult.botWins == true) {
                isGameEnd = true;
                wonMessage(false);
                return;
            }
            if (cardLength <= botCurrentIndex + 1) {
                var botCardIdDiv = document.getElementById('botCardId');
                botCardIdDiv.innerHTML = '';
                isBotCardEmpty = true;
                return;
            }
            botCurrentIndex = botCurrentIndex + 1;
        }, botWillPlayInSecs);
    }
}