const cardContainer = document.querySelector("#card-container");

const GameState = Object.freeze({
    BETTING_PHASE: 'BETTING_PHASE',
    PLAYER_PHASE: 'PLAYER_PHASE',
    DEALER_PHASE: 'DEALER_PHASE',
  });
  
const gameState = {
    currentState: GameState.BETTING_PHASE,
    chipsAvailable: true,
    READY_available: true,
    HIT_available: false,
    STAND_available: false,
    DOUBLE_available: false
};

class Player {
    constructor(startMoney) {
        this.name = "player";
        this.currentScore = 0;          
        this.aceAvailable = true;       
        this.aceInHand = false;
        this.moneyInBank = startMoney;        
        this.bet = 0;
        this.assocDealer = undefined;
        this.firstCardName = undefined;
        this.gotFirstCard = true;
    }

    aceLogic() {
        if(!this.aceInHand) {
            this.currentScore += 10;
            this.aceInHand = true; // No more adding 10s
        }
    }

    updateScore(card) {
        this.currentScore += card.value;

        if(card.value == 1) {
            this.aceLogic();
        }

        if (this.currentScore > 21 && this.aceAvailable && this.aceInHand) {
            this.currentScore -= 10;
            this.aceAvailable = false;  // No more Aces can be used as 11
        }
        if(this.currentScore > 21) {
            resolve(this, this.assocDealer); // end game
        }

    }

    removeBet(amount) {
        const value = Math.abs(amount);
        if (value <= this.bet) {
            this.bet -= value;
            this.moneyInBank += value;
            console.log(`Player has removed $${amount} from bet.`);
        } else {
            console.log("Cannot remove more than you have bet.");
        }
        console.log("player bet: " + this.bet);
    }

    placeBet(amount) {
        if (amount > 0 && amount <= this.moneyInBank) { // have enough
            this.bet += amount;
            this.moneyInBank -= amount;
            console.log(`Player has placed a bet of $${amount}`);
            console.log("player bet: " + this.bet);
            return;
        } else if (amount < 0 && Math.abs(amount) <= this.bet) {
            // negative amount -> removing bet
            this.removeBet(amount);
            console.log("player bet: " + this.bet);
            return;
        }
        console.log("Insufficient funds to place bet.");
    }

    processWin() {
        this.moneyInBank += this.bet * 2;
        this.bet = 0;
        console.log(`Player wins! Current balance: $${this.moneyInBank}`);
    }

    processLoss() {
        this.bet = 0;
        console.log(`Player loses. Current balance: $${this.moneyInBank}`);
    }

    processTie() {
        this.moneyInBank += this.bet;
        this.bet = 0;
        console.log(`It's a tie. Player's balance: $${this.moneyInBank}`);
    }
}

//just so we can keep track of dealer's hand
class Dealer {
    constructor() {
        this.name = "dealer";
        this.currentScore = 0;          
        this.aceAvailable = true;
        this.aceInHand = false;
        this.assocPlayer = undefined;
        this.firstCardName = undefined;
        this.gotFirstCard = false;
    }
       
    aceLogic() {
        if(!this.aceInHand) {
            this.currentScore += 10;
            this.aceInHand = true; // No more adding 10s
        }
    }

    updateScore(card) {
        this.currentScore += card.value;
        if(card.value == 1) {
            this.aceLogic();
        }

        if (this.currentScore > 21 && this.aceAvailable && this.aceInHand) {
            this.currentScore -= 10;
            this.aceAvailable = false;  // remove 10 once
        }

        /*
        if(this.currentScore >= 17) {
            resolve(this.assocPlayer, this);
        }
        */
        console.log("dealer score: " + this.currentScore);
    }
}

class Card {
    constructor(rank, suit) {
      this.rank = rank;
      this.suit = suit;
      this.name = `${rank}_${suit}.png`;
      this.value = Card.rankToValues(rank);
    }

    //Converts the rank of the card into a value, mainly for the face cards and ace logic (1 or 11)
    static rankToValues(rank) {
        if (rank === 'A') {
            return 1;
        }
        if ('JQK'.includes(rank)) {
            return 10;
        } 
        return Number(rank);
      }
}

const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const suits = ["H", "D", "C", "S"];
let shoe = [];

//Shuffle logic made by Fisher-Yates
//https://en.wikipedia.org/wiki/Fisher–Yates_shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

//Builds a shoe of cards and returns an array of shuffled cards  
function buildShoe() {
    shoe = [];
    for (const s of suits) {
        for (const r of ranks) {
            shoe.push(new Card(r, s));
        } 
    }
    shuffle(shoe);
}

//Returns a card object from the built shoe 
function drawFromShoe() {
    if (shoe.length === 0) {
        buildShoe();
    }
    return shoe.pop();
  }

//Logs card object and updates the score of the person dealt to
function dealCard(person, faceUp) {
    console.log("dealing card");
    const card = drawFromShoe();
    console.log(card);
    if (!person.gotFirstCard) {
        person.firstCardName = card.name;
        person.gotFirstCard = true;
        console.log(person.name, "got", card.name);
    }
    drawCard(person, faceUp, card);
    person.updateScore(card);
}

function drawCard(person, isFaceUp, card) {
    if (isFaceUp) {
        const img = document.createElement("img");
        console.log(card.name);
        img.src = "../assets/cards/" + card.name;
        img.alt = "Description of image";
        img.className = "card";
        const container = document.getElementById(person.name+"-cards");
        container.append(img);
    }
    else {
        const img = document.createElement("img");
        console.log(card.name);
        img.src = "../assets/cards/card_back.png";
        img.alt = "Description of image";
        img.className = "card";
        const container = document.getElementById(person.name+"-cards");
        container.append(img);
    }
}

function flipCardUp(person, cardname) {
    const div = document.getElementById(person.name+"-cards");
    const firstImg = div.querySelector("img");

    if (firstImg) {
        firstImg.src = "../assets/cards/" + cardname;
    }
}

//dealer phase to player phase
function readyToPlay() {
    gameState.currentState = GameState.PLAYER_PHASE;
    gameState.chipsAvailable = false;
    gameState.READY_available = false;
    gameState.HIT_available = true;
    gameState.STAND_available = true;
    gameState.DOUBLE_available = true;
}

//player phase to dealer phase
function playToDeal() {
    gameState.currentState = GameState.DEALER_PHASE;
    gameState.chipsAvailable = false;
    gameState.READY_available = false;
    gameState.HIT_available = false;
    gameState.STAND_available = false;
    gameState.DOUBLE_available = false;
}

function resolve(player, dealer) {
    // flip over first dealer card
    flipCardUp(dealer, dealer.firstCardName);

    console.log("resolved game");
    playToDeal();
    if (player.currentScore > 21) {
        player.processLoss();
    }
    else {
        while(dealer.currentScore < 17) {
            console.log("hmm");
            dealCard(dealer, true);
        }
    
        if(dealer.currentScore > 21) {
            player.processWin();
        } else {
            findWinner(player, dealer);
        }
    }
    updateBetBalanceDisplay(player);
    // reset(player, dealer); do the reset logic when player says ready
    gameState.READY_available = true; // let player start new game
    const betDiv = document.getElementById("bet-dis");
    const betText = betDiv.querySelector("h2");
    betText.textContent = "Press READY to start a new game.";
    console.log("done resolving");

}

function findWinner(player, dealer) {
    if(player.currentScore > dealer.currentScore) {
        player.processWin();
    } else if(player.currentScore == dealer.currentScore) {
        player.processTie();
    } else {
        player.processLoss();
    }
}

function reset(player, dealer) {
    // Reset the game state
    gameState.currentState = GameState.BETTING_PHASE;
    gameState.chipsAvailable = true;
    gameState.READY_available = true;
    gameState.HIT_available = false;
    gameState.STAND_available = false;
    gameState.DOUBLE_available = false;

    // Reset player and dealer hands
    player.currentScore = 0;
    player.aceAvailable = true;
    player.aceInHand = false;
    player.bet = 0;

    dealer.currentScore = 0;
    dealer.aceAvailable = true;
    dealer.aceInHand = false;
    dealer.gotFirstCard = false;

    // Clear cards
    document.getElementById("dealer-cards").innerHTML = "";
    document.getElementById("player-cards").innerHTML = "";

    console.log("Game has been reset.");
}

function updateBetBalanceDisplay(player) {
    const balanceDiv = document.getElementById("balance-dis");
    const balanceText = balanceDiv.querySelector("p");
    balanceText.textContent = "Current Balance: $" + player.moneyInBank;

    const betDiv = document.getElementById("bet-dis");
    const betText = betDiv.querySelector("h2");
    betText.textContent = "Current Bet: $" + player.bet;
}

function main() {
    //Set up initial game state, button availability is set by default ^^
    const player = new Player(100);
    const dealer = new Dealer();
    player.assocDealer = dealer;
    dealer.assocPlayer = player;
    
    updateBetBalanceDisplay(player);

    //READY BUTTON
    document.getElementById("readyButton").addEventListener("click", () => {
        console.log(gameState.currentState);
        console.log(gameState.READY_available);
        if (gameState.currentState === GameState.BETTING_PHASE && gameState.READY_available) {
            //check if player has not bet yet
            if (player.bet == 0){
                console.log("You must bet money to play!");
                return;
            }
//change game state
            readyToPlay();
            console.log("Player is ready!");
            dealCard(dealer, false);
            dealCard(dealer, true);
            dealCard(player, true);
            dealCard(player, true);

            if (player.currentScore === 21) {
                console.log("Player has blackjack!");
                resolve(player, dealer);
            }
        }
        else if (gameState.currentState == GameState.DEALER_PHASE && gameState.READY_available) {
            // at this point the game is over
            // ready should start the next game
            
            reset(player, dealer);
            updateBetBalanceDisplay(player);
        }
        else{
            console.log("You cannot ready at this time!");
            return;
        }
    });

    //ALL BETTING BUTTONS
    document.querySelectorAll(".bet-button").forEach(button => {
        button.addEventListener("click", () => {
            if (gameState.currentState ===  GameState.BETTING_PHASE && gameState.chipsAvailable){
                const amount = parseInt(button.getAttribute("data-value"));
                player.placeBet(amount);
                updateBetBalanceDisplay(player);
            }
            else{
                console.log("You cannot bet at this time!");
                return;
            }
        });
    });

    //ALL REMOVING BET BUTTONS
    document.querySelectorAll(".bet-button-minus").forEach(button => {
        button.addEventListener("click", () => {
            if (gameState.currentState === GameState.BETTING_PHASE && gameState.chipsAvailable){
                const amount = parseInt(button.getAttribute("data-value"));
                player.removeBet(amount);
                updateBetBalanceDisplay(player);
            }
            else{
                console.log("You cannot bet at this time!");
                return;
            }
        });
    });

    //HIT BUTTON
    document.getElementById("hitButton").addEventListener("click", () => {
        if (gameState.currentState === GameState.PLAYER_PHASE && gameState.HIT_available) {
            console.log("Player hits!");
            //Make sure player can no longer double after standing
            gameState.DOUBLE_available = false;
            
            console.log("hit!");
            dealCard(player, true);
            console.log("player score: " + player.currentScore);

        }
    });

    //STAND BUTTON
    document.getElementById("standButton").addEventListener("click", () => {
        if (gameState.currentState === GameState.PLAYER_PHASE && gameState.STAND_available) {
            console.log("Player stands! with score: " + player.currentScore);
            
            resolve(player, dealer);
        }
    });

    //DOUBLE BUTTON
    document.getElementById("doubleButton").addEventListener("click", () => {
        if (gameState.currentState === GameState.PLAYER_PHASE && gameState.DOUBLE_available) {
            console.log("Player doubles!");
            // add card, check for bust etc
        }
    });
}

main();