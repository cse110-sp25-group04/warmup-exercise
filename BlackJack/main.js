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

        if(this.currentScore == 21) {
            gameState.currentState = GameState.DEALER_PHASE;
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
            removeBet(amount);
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

        if(this.currentScore >= 17) {
            gameState.currentState = GameState.DEALER_PHASE;
        }

        console.log("dealer score: " + this.currentScore);
    }
}

class Card {
    constructor(rank, suit) {
      this.rank = rank;
      this.suit = suit;
      this.name = '${rank}_${suit}.png';
      this.values = Card.rankToValues(rank);
    }

    //Converts the rank of the card into a value, mainly for the face cards and ace logic (1 or 11)
    static rankToValues(rank) {
        if (rank === 'A') {
            return [1, 11];
        }
        if ('JQK'.includes(rank)) {
            return [10];
        } 
        return [Number(rank)];
      }
}

const rank = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const suit = ["H", "D", "C", "S"];

//Shuffle logic made by Fisher-Yates
//https://en.wikipedia.org/wiki/Fisher–Yates_shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

//Builds a shoe of cards and returns a shuffled deck 
function buildShoe() {
    const shoe = [];
    for (const s of suits) {
        for (const r of ranks) {
            shoe.push(new Card(r, s));
        } 
    }
    shuffle(shoe);
    return shoe;
}

function dealCard(person) {
    // randomize draw
    console.log(person.name);
    let valueIdx = Math.floor(Math.random() * values.length);
    let typeIdx = Math.floor(Math.random() * types.length);

    let value = values[valueIdx];
    let type = types[typeIdx];

    /*
    const image = document.createElement("img");
    image.src = `../assets/cards/${value}_${type}.png`;
    // instead of document, have the CardContainer
    cardContainer.appendChild(image);
    */

    const card = new Card(values[valueIdx], types[typeIdx]);
    console.log(card);
    person.updateScore(card);
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
    if (player.currentScore > 21) {
        player.processLoss();
        return;
    }

    while(dealer.currentScore < 17) {
        dealCard(dealer);
    }

    if(dealer.currentScore > 21) {
        player.processWin();
        return;
    } else {
        findWinner(player, dealer);
    }   
}

function findWinner(player, dealer) {
    if(player.currentScore > dealer.currentScore) {
        player.processWin();
    } else if(player.currentScore == dealer.currentScore) {
        player.processTie();
    } else {
        player.processLoss();
    }
    reset(player, dealer);
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

    console.log("Game has been reset.");
}

function main() {
    //Set up initial game state, button availability is set by default ^^
    const player = new Player(100);
    const dealer = new Dealer();

    console.log(gameState.currentState);

    //READY BUTTON
    document.getElementById("readyButton").addEventListener("click", () => {
        if (gameState.currentState === "BETTING_PHASE" && gameState.READY_available) {
            //check if player has not bet yet
            if (player.bet == 0){
                console.log("You must bet money to play!");
                return;
            }

            console.log("Player is ready!");
            //deal initial hands
            dealCard(player);
            dealCard(dealer);
            dealCard(player);
            dealCard(dealer);

            //change game state
            readyToPlay();

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
            }
            else{
                console.log("You cannot bet at this time!");
                return;
            }
        });
    });

    //HIT BUTTON
    document.getElementById("hitButton").addEventListener("click", () => {
        if (gameState.currentState === "PLAYER_PHASE" && gameState.HIT_available) {
            console.log("Player hits!");
            //Make sure player can no longer double after standing
            gameState.DOUBLE_available = false;

            dealCard(player);
            console.log("player score: " + player.currentScore);

            if(player.currentScore > 21) {
                reset(player, dealer);
            }
        }
    });
    

    //STAND BUTTON
    document.getElementById("standButton").addEventListener("click", () => {
        if (gameState.currentState === "PLAYER_PHASE" && gameState.STAND_available) {
            console.log("Player stands! with score: " + player.currentScore);
            playToDeal();

            resolve(player, dealer);
        }
    });

    //DOUBLE BUTTON
    document.getElementById("doubleButton").addEventListener("click", () => {
        if (gameState.currentState === "PLAYER_PHASE" && gameState.DOUBLE_available) {
            console.log("Player doubles!");
            // add card, check for bust etc
        }
    });
}

main();