class Card {
    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
        this.name = `${rank}_${suit}.png`;
        this.values = Card.rankToValues(rank);
    }

    static rankToValues(rank) {
        if (rank === 'A') return 1;
        if ('JQK'.includes(rank)) return 10;
        return Number(rank);
    }
}

const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const suits = ["H", "D", "C", "S"];
let shoe = [];
buildShoe();

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function buildShoe() {
    let tempShoe = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            tempShoe.push(new Card(rank, suit));
        }
    }

    shuffle(tempShoe);
    shoe = tempShoe;
}

function drawFromShoe() {
    if (shoe.length === 0) {
        buildShoe();
        resetCards();
    }
    return shoe.pop();
}

function resetCards() {
    alert("Deck is empty. Resetting cards.");
    const cards = document.querySelectorAll(".draggable-card");
    cards.forEach(card => card.remove());
}


document.addEventListener('DOMContentLoaded', () => {
    const deck = document.querySelector('#deck');
    const tableContainer = document.querySelector('#table-container');

    let draggingCard = null;
    let offsetX = 0;
    let offsetY = 0;

    // Add a card when deck is clicked and held 
    deck.addEventListener('mousedown', (e) => {
        const card = drawFromShoe(shoe);

        const newCard = document.createElement('img');
        newCard.setAttribute("draggable", false)
        newCard.src = `../assets/cards/${card.name}`;
        newCard.classList.add('card-image', 'draggable-card');
        newCard.style.position = 'absolute';
        newCard.style.left = `${e.clientX - 50}px`;
        newCard.style.top = `${e.clientY - 70}px`;
        newCard.style.width = '100px';

        tableContainer.appendChild(newCard);

        startDragging(newCard, e);
    });

    // Handle dragging existing cards
    tableContainer.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('draggable-card')) {
            startDragging(e.target, e);
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (draggingCard) {
            draggingCard.style.left = `${e.clientX - offsetX}px`;
            draggingCard.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        draggingCard = null;
    });

    function startDragging(card, e) {
        draggingCard = card;
        const rect = card.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        card.style.zIndex = '1000';
    }
});
