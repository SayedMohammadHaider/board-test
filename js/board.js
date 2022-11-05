var cards = {
    botCard: [],
    placedCard: [],
    playerCard: []
};
var playerCardIdDiv = document.getElementById('playerCardId');
var placedCardIdDiv = document.getElementById('placedCardId');
var botHeroNameDiv = document.getElementById('botHeroName');
var playerHeroNameDiv = document.getElementById('playerHeroName');
var playerCurrentIndex = 0;
var botCurrentIndex = 0;
var release = true;
var isGameEnd = false;
var isBotCardEmpty = false;
var placedCardBorderLeft = 6;
var loadBotImageBefore = '';
var loadPlayerImageBefore = '';

pageLoad();

function pageLoad() {
    const randomIntArrayInRange = (min, max, n = 1) =>
        Array.from(
            { length: n },
            () => Math.floor(Math.random() * (max - min + 1)) + min
        );
    var botCardsList = randomIntArrayInRange(1, allCard.length, 20);
    var playerCardsList = randomIntArrayInRange(1, allCard.length, 20);

    for (var i = 0; i < botCardsList.length - 1; i++) {
        console.log(playerCardsList[i]);
        if (allCard.find(({ sn }) => sn === botCardsList[i]).heroMatchId == allCard.find(({ sn }) => sn === playerCardsList[i + 1]).heroMatchId) {
            console.log("player wins");
        }
        if (allCard.find(({ sn }) => sn === botCardsList[i]).heroMatchId == allCard.find(({ sn }) => sn === playerCardsList[i]).heroMatchId) {
            console.log("Bot wins");
        }
    }

    cards.botCard = botCardsList;
    cards.playerCard = playerCardsList;
}

function heroClick() {
    if (!isGameEnd) {
        if (release) {
            playerFlipCardSound();
            var cardLength = cards.playerCard.length;
            var cardValue = cards.playerCard[playerCurrentIndex];
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
            botAutoClick();
        }
    }
}

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
    document.getElementById('setupDialogBox').style.visibility = "visible";
    var message = "You Lose";
    if (isPlayerWon) {
        message = "You Won";
    }
    document.getElementById('winMessage').innerHTML = message;
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