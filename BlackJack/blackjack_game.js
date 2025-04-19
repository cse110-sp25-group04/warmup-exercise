// Enum-like structure for game states
const GameState = Object.freeze({
    BETTING_PHASE: 'BETTING_PHASE',
    PLAYER_PHASE: 'PLAYER_PHASE',
    DEALER_PHASE: 'DEALER_PHASE',
    //Dealer phase and resolution phase are the same as we can't do anything, so I odn't think we need this
    //RESOLUTION_PHASE: 'RESOLUTION_PHASE'
  });
  
// Global game state object
const gameState = {
    currentState: GameState.BETTING_PHASE,
    chipsAvailable: true,
    READY_available: true,
    HIT_available: false,
    STAND_available: false,
    DOUBLE_available: false
};

class Player {
    constructor() {
        // Player properties
        this.currentScore = 0;          // Player's current score (sum of card values)
        this.aceAvailable = true;       // Whether the player can use an Ace as 11 or not
        this.moneyInBank = 250;        // Amount of money the player has (starting value)
        this.bet = 0;                   // The amount the player has bet in the current round
    }

    // Method to update the current score (like adding card values)
    updateScore(cardValue) {
        this.currentScore += cardValue;
        
        // Check if we need to adjust for Ace value
        if (this.currentScore > 21 && this.aceAvailable) {
            // If score is over 21 and we have an Ace available, adjust Ace to be 1
            this.currentScore -= 10;
            this.aceAvailable = false;  // No more Aces can be used as 11
        }
    }

    // Method to place a bet
    placeBet(amount) {
        if (amount > 0 && amount <= this.moneyInBank) {
            //adding bet
            this.bet += amount;
            this.moneyInBank -= amount;
            console.log(`Player has placed a bet of $${amount}`);
        } else if (amount < 0 && Math.abs(amount) <= this.bet) {
            // Removing bet
            const positiveAmount = Math.abs(amount);
            if (positiveAmount <= this.bet) {
                this.bet -= positiveAmount;
                this.moneyInBank += positiveAmount;
                console.log(`Player has removed $${positiveAmount} from bet.`);
            } else {
                console.log("Cannot remove more than you have bet.");
            }
        }else {
            console.log("Insufficient funds to place bet.");
        }
    }

    // Method to win the round
    winRound() {
        this.moneyInBank += this.bet * 2;  // Player wins double the bet
        this.bet = 0;  // Reset the bet after winning
        console.log(`Player wins! Current balance: $${this.moneyInBank}`);
    }

    // Method to lose the round
    loseRound() {
        this.bet = 0;  // Reset the bet after losing
        console.log(`Player loses. Current balance: $${this.moneyInBank}`);
    }

    // Method to tie the round
    tieRound() {
        this.moneyInBank += this.bet;  // Return the bet to the player
        this.bet = 0;
        console.log(`It's a tie. Player's balance: $${this.moneyInBank}`);
    }
}

//just so we can keep track of dealer's hand
class Dealer {
    constructor() {
        // Dealer properties
        this.currentScore = 0;          // Dealer's current score (sum of card values)
        this.aceAvailable = true;       // Whether the player can use an Ace as 11 or not
    }

    // Method to update the current score (like adding card values)
    updateScore(cardValue) {
        this.currentScore += cardValue;
        
        // Check if we need to adjust for Ace value
        if (this.currentScore > 21 && this.aceAvailable) {
            // If score is over 21 and we have an Ace available, adjust Ace to be 1
            this.currentScore -= 10;
            this.aceAvailable = false;  // No more Aces can be used as 11
        }
    }
}

//draws a random card and updates total for dealer.player
function dealCard(person){
    //cardValue = draw() //draw a random card here and remove from deck
    person.updateScore(cardValue);
}

//dealer phase to player phase
function readyToPlay(){
    gameState.currentState = GameState.PLAYER_PHASE;
    gameState.chipsAvailable = false;
    gameState.READY_available = false;
    gameState.HIT_available = true;
    gameState.STAND_available = true;
    gameState.DOUBLE_available = true;
}

//player phase to dealer phase
function playToDeal(){
    gameState.currentState = GameState.DEALER_PHASE;
    gameState.chipsAvailable = false;
    gameState.READY_available = false;
    gameState.HIT_available = false;
    gameState.STAND_available = false;
    gameState.DOUBLE_available = false;
}

function main() {
    //Set up initial game state, button availability is set by default ^^
    const player = new Player();
    const dealer = new Dealer();

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
            if (gameState.currentState === "PLAYER_PHASE" && gameState.chipsAvailable){
                const amount = parseInt(button.getAttribute("data-amount"));
                player.placeBet(amount);
            }
            else{
                console.log("You cannot bet at this time!");
                return;
            }
        });
    });

    //ALL REMOVING BET BUTTONS
    document.querySelectorAll(".bet-button minus").forEach(button => {
        button.addEventListener("click", () => {
            if (gameState.currentState === "PLAYER_PHASE" && gameState.chipsAvailable){
                const amount = parseInt(button.getAttribute("data-amount"));
                player.placeBet(amount);
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
        }
    });
    

    //STAND BUTTON
    document.getElementById("standButton").addEventListener("click", () => {
        if (gameState.currentState === "PLAYER_PHASE" && gameState.STAND_available) {
            console.log("Player stands!");
            playToDeal();

            // add card, check for bust etc
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