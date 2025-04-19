document.getElementById("shuffle").addEventListener("click", () => {
    const deck = document.getElementById("shuffle-anim");

    // Remove previous animation (if any)
    deck.classList.remove("shuffling");

    // Trigger reflow so animation can restart
    void deck.offsetWidth;

    // Add shuffle animation
    deck.classList.add("shuffling");
});
