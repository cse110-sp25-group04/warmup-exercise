// Enum-like structure for game states
const GameState = Object.freeze({
    BETTING_PHASE: 'BETTING_PHASE',
    PLAYER_PHASE: 'PLAYER_PHASE',
    DEALER_PHASE: 'DEALER_PHASE',
    RESOLUTION_PHASE: 'RESOLUTION_PHASE'
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
        if (amount <= this.moneyInBank) {
            this.bet += amount;
            this.moneyInBank -= amount;
            console.log(`Player has placed a bet of $${amount}`);
        } else {
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

function main() {
    //Set up initial game state, button availability is set by default ^^
    const player = new Player();


    //READY BUTTON
    document.getElementById("readyButton").addEventListener("click", () => {
        if (gameState.currentState === 'BETTING_PHASE' && gameState.READY_available) {
            console.log("Player hits!");
            // add card, check for bust etc
        }
    });

    //HIT BUTTON
    document.getElementById("hitButton").addEventListener("click", () => {
        if (gameState.currentState === 'PLAYER_PHASE' && gameState.HIT_available) {
            console.log("Player hits!");
            // add card, check for bust etc
        }
    });

    //STAND BUTTON
    document.getElementById("standButton").addEventListener("click", () => {
        if (gameState.currentState === 'PLAYER_PHASE' && gameState.STAND_available) {
            console.log("Player hits!");
            // add card, check for bust etc
        }
    });

    //DOUBLE BUTTON
    document.getElementById("doubleButton").addEventListener("click", () => {
        if (gameState.currentState === 'PLAYER_PHASE' && gameState.DOUBLE_available) {
            console.log("Player hits!");
            // add card, check for bust etc
        }
    });
}

main();