class MemoryGame {
	/**
	* Create a memory game
	* @param {Object} options - Game options.
	* @param {Array} [options.values] - list of values to use
	* @param {Element} [options.board] - HTML Element to add cards to
	* @param {Element} [options.cardTemplate] - HTML Element with a child element .value
	* @param {Element} [options.buttonStart] - HTML Element for start button
	* @param {Element} [options.buttonReset] - HTML Element for end button
	* @param {Element} [options.buttonHint] - HTML Element for hint button
	* @param {function} [options.onTimer] - called when the timer updates. Each second
	* @param {function} [options.onMatched] - called when cards are matched
	* @param {function} [options.onStart] - called when the start button is pressed
	* @param {function} [options.onEnd] - called all cards have been matched
	* @param {string} [options.cardCount=24] - Number of cards on the board.
	* @param {string} [options.matchesNeeded=2] - Number of cards to flip and match
	*/
	constructor(options) {
		// Setup
		this.cardsCount = options.cardsCount || 24;
		this.matchesNeeded = options.matchesNeeded || 2;
		this.cardTemplate = options.cardTemplate;
		this.values = options.values;
		this.board = options.board;

		// Buttons
		this.buttonStart = options.buttonStart;
		this.buttonReset = options.buttonReset;
		this.buttonHint = options.buttonHint;

		// Events
		this.onTimer = options.onTimer;
		this.onMatched = options.onMatched;
		this.onStart = options.onStart;
		this.onEnd = options.onEnd;

		this.startTime = 0;
		this.timePassed = 0;
		this.stats = { clicks: 0, hints: 0, time: 0 };
		this.blockInput = false;
		this.flippedCards = [];
		this.cards = [];
		this.matches = 0;

		this.cardTemplate.parentElement.removeChild(this.cardTemplate);
		this.buttonStart.addEventListener('click', e => this.gameStart());
		this.buttonReset.addEventListener('click', e => this.gameStart());
		this.buttonHint.addEventListener('click', e => this.hint());
	}

	gameStart() {
		this.cards = [];
		this.matches = 0;
		this.startTime = new Date();
		this.setupBoardAndCards();
		this.updateMatched();
		this.startTimerDisplay();
		this.onStart();
	}

	setupBoardAndCards() {
		this.board.innerHTML = '';
		for(let id = 0; id < this.cardsCount; id++) {
			var card = {
				html: this.cardTemplate.cloneNode(true),
				wrapper: document.createElement('div'),
				value: this.values[Math.floor(id/this.matchesNeeded)],
				matched: false,
				id: id
			}
			card.html.style.animationDuration = id*0.1+'s';
			card.html.addEventListener('click', this.flipCard.bind(this, card));
			card.html.querySelector('.value').innerHTML = card.value;
			card.wrapper.classList.add('card-wrapper');
			card.wrapper.appendChild(card.html);
			this.insertCardToBoardRandomly(card);
			this.cards.push(card);
		}
	}

	insertCardToBoardRandomly(card) {
		if(!card.id) return this.board.appendChild(card.wrapper); // First
		var randomPosition = Math.floor(Math.random()*card.id);
		var referenceNode = this.cards[randomPosition].wrapper;
		this.board.insertBefore(card.wrapper, referenceNode);
	}

	flipCard(card) {
		if(this.blockInput || card.flipped || card.matched) return;
		this.stats.clicks++
		card.html.classList.toggle('flip');
		this.flippedCards.push(card);
		card.flipped = true;
		this.afterFlip();
	}

	afterFlip() {
		if(this.flippedCards.length != this.matchesNeeded) return false;
		this.restoreFlippedAndSaveMatch(this.checkedFlippedCardsMatch());
	}

	checkedFlippedCardsMatch() {
      return this.flippedCards.every(card => card.value == this.flippedCards[0].value);
	}

	restoreFlippedAndSaveMatch(match) {
		this.blockInput = true;
		setTimeout(() => {
			this.flippedCards = this.flippedCards.filter((card) => {
				card.html.classList.toggle('match', match);
				card.html.classList.remove('flip');
				card.flipped = false;
				card.matched = match;
			});
			this.blockInput = false;
			this.updateMatched(match);
		}, match ? 0 : 750);
	}

	updateMatched(match) {
		this.matches += match ? this.matchesNeeded : 0;
		this.onMatched(this.matches, this.cards.length);
		if(this.matches == this.cards.length) this.gameEnd();
	}

	gameEnd() {
		this.onEnd(this.stats);
	}

	hint() {
		this.startTime -= 5000;
		this.stats.hints++;
		this.blockInput = true;
		for(let card of this.cards) card.html.classList.add('hint');
		setTimeout(() => {
			for(let card of this.cards) card.html.classList.remove('hint');
			this.blockInput = false;
		}, 1000);
	}

	startTimerDisplay() {
		if(this.timer) clearInterval(this.timer);
		this.timer = setInterval(() => {
			var timePassed = new Date(new Date() - this.startTime);
			var secondsIn00Format = ('0' + timePassed.getSeconds()).substr(-2);
			this.stats.time = `${timePassed.getMinutes()}:${secondsIn00Format}`;
			this.onTimer(this.stats.time);
		}, 1000);
	}
}
