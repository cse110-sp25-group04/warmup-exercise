document.addEventListener('DOMContentLoaded', () => {
    const deckEl       = document.getElementById('card_deck');
    const shuffleBtn   = document.getElementById('shuffleButton');
    const btnContainer = document.querySelector('.button_container');
    if (!deckEl || !shuffleBtn || !btnContainer) {
        return;
    }
    const CARD_W = 100, CARD_H = 140;
  
    shuffleBtn.addEventListener('click', () => {
      shuffleBtn.disabled = true;
  
      //Timing
            const N       = 6,
            spawnDelay    = 200,
            liftDur       = 200,
            spawnDur      = 400,
            swapDur       = 300,
            swapRounds    = 3,
            roundDelay    = 150,
            returnDelay   = 200,
            returnDur     = 400,
            cleanupBuffer = 50;
  
      //GEOMETRY
      const deckR  = deckEl.getBoundingClientRect();
      const startX = deckR.left + deckR.width  / 2;
      const startY = deckR.top  + deckR.height / 2;
  
      const btnR   = btnContainer.getBoundingClientRect();
      //Make cards always spawn above buttons
      const spawnY = btnR.top - CARD_H - 40;
  
      //Spacing and centering
      const spacing = CARD_W * 1.2;
      const spawnXs = Array.from({ length: N }, (_, i) =>
        startX + (i - (N - 1) / 2) * spacing
      );
  
      const wrappers = [];
  
      //Card Spawn and length of distance
      for (let i = 0; i < N; i++) {
        setTimeout(() => {
          const wrap = document.createElement('div');
          Object.assign(wrap.style, {
            position:  'absolute',
            width:     `${CARD_W}px`,
            height:    `${CARD_H}px`,
            left:      `${startX}px`,
            top:       `${startY}px`,
            transform: 'translate(-50%,-50%)',
            zIndex:    20,
          });
  
          const img = document.createElement('img');
          img.src          = '../assets/cards/card_back.png';
          img.classList.add('shuffle-card');
          img.style.width  = '100%';
          img.style.height = '100%';
          wrap.appendChild(img);
          document.body.appendChild(wrap);
          wrappers.push(wrap);

          wrap.style.transition = `transform ${liftDur}ms ease-out`;
          wrap.style.transform  = 'translate(-50%, calc(-50% - 20px))';
  
          //Cards flying to their spawn
          setTimeout(() => {
            const dx = spawnXs[i] - startX;
            const dy = spawnY    - startY;
            wrap.style.transition = `transform ${spawnDur}ms ease-out`;
            wrap.style.transform  =
              `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
          }, liftDur);
  
          //After the last card reaches it's position, start the swapping
          if (i === N - 1) {
            const totalSpawn = (N - 1)*spawnDelay + liftDur + spawnDur;
  
            //Swaps
            for (let round = 1; round <= swapRounds; round++) {
              setTimeout(() => {
                const positions = spawnXs.slice();
                for (let j = positions.length - 1; j > 0; j--) {
                  const k = Math.floor(Math.random() * (j + 1));
                  [positions[j], positions[k]] = [positions[k], positions[j]];
                }
                wrappers.forEach((w, idx) => {
                  w.style.transition = `transform ${swapDur}ms ease-in-out`;
                  const dx = positions[idx] - startX;
                  const dy = spawnY - startY;
                  w.style.transform  = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
                });
              }, totalSpawn + (round - 1)*(swapDur + roundDelay));
            }
  
            const totalSwaps = swapRounds*(swapDur + roundDelay) - roundDelay;
  
            //Returns all cards
            setTimeout(() => {
              wrappers.forEach((w, idx) => {
                setTimeout(() => {
                  w.style.transition = `transform ${returnDur}ms ease-in-out`;
                  w.style.transform  = 'translate(-50%,-50%)';
                  setTimeout(() => {
                    w.remove();
                    if (idx === N - 1) {
                        shuffleBtn.disabled = false;
                    }
                  }, returnDur + cleanupBuffer);
                }, idx * returnDelay);
              });
            }, totalSpawn + totalSwaps);
          }
        }, i * spawnDelay);
      }
    });
  });
  