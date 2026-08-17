(() => {
  'use strict';

  const els = {
    startScreen: document.getElementById('startScreen'),
    gameScreen: document.getElementById('gameScreen'),
    endScreen: document.getElementById('endScreen'),
    errorScreen: document.getElementById('errorScreen'),
    beginBtn: document.getElementById('beginBtn'),
    restartBtn: document.getElementById('restartBtn'),
    continueBtn: document.getElementById('continueBtn'),
    sailboatBtn: document.getElementById('sailboatBtn'),
    progressText: document.getElementById('progressText'),
    priorityTag: document.getElementById('priorityTag'),
    routeFill: document.getElementById('routeFill'),
    boat: document.getElementById('boat'),
    scenarioNumber: document.getElementById('scenarioNumber'),
    scenarioTitle: document.getElementById('scenarioTitle'),
    scenarioText: document.getElementById('scenarioText'),
    choices: document.getElementById('choices'),
    feedbackPanel: document.getElementById('feedbackPanel'),
    feedbackEvent: document.getElementById('feedbackEvent'),
    feedbackText: document.getElementById('feedbackText'),
    eventModal: document.getElementById('eventModal'),
    eventTitle: document.getElementById('eventTitle'),
    eventBody: document.getElementById('eventBody'),
    eventContinueBtn: document.getElementById('eventContinueBtn'),
    resultTitle: document.getElementById('resultTitle'),
    resultDescription: document.getElementById('resultDescription'),
    finalMeters: document.getElementById('finalMeters'),
    errorText: document.getElementById('errorText')
  };

  const metricEls = {
    momentum: { bar: document.getElementById('momentumBar'), value: document.getElementById('momentumValue'), label: 'Momentum' },
    capacity: { bar: document.getElementById('capacityBar'), value: document.getElementById('capacityValue'), label: 'Faculty Capacity' },
    impact: { bar: document.getElementById('impactBar'), value: document.getElementById('impactValue'), label: 'Student Impact' },
    collaboration: { bar: document.getElementById('collaborationBar'), value: document.getElementById('collaborationValue'), label: 'Collaboration' }
  };

  let data = null;
  let state = null;

  function clamp(n, min = 0, max = 100) {
    return Math.max(min, Math.min(max, n));
  }

  function showScreen(screen) {
    [els.startScreen, els.gameScreen, els.endScreen, els.errorScreen].forEach(el => el.classList.remove('active'));
    screen.classList.add('active');
  }

  function createInitialState() {
    const start = data.settings.startingIndicators;
    return {
      index: 0,
      indicators: { ...start },
      tagCounts: {},
      awaitingContinue: false,
      pendingFeedback: null
    };
  }

  function renderIndicators() {
    Object.entries(metricEls).forEach(([key, meta]) => {
      const val = clamp(state.indicators[key]);
      meta.bar.style.width = `${val}%`;
      meta.value.textContent = Math.round(val);
      meta.bar.setAttribute('aria-valuenow', String(Math.round(val)));
    });
  }

  function renderRoute() {
    const total = data.scenarios.length;
    const progress = total <= 1 ? 100 : (state.index / (total - 1)) * 82;
    els.routeFill.style.width = `${progress}%`;
    els.boat.style.left = `${progress}%`;
  }

  function renderScenario() {
    const scenario = data.scenarios[state.index];
    const total = data.scenarios.length;

    els.progressText.textContent = `${state.index + 1} of ${total}`;
    els.priorityTag.textContent = scenario.priority;
    els.scenarioNumber.textContent = `Decision ${state.index + 1}`;
    els.scenarioTitle.textContent = scenario.title;
    els.scenarioText.textContent = scenario.situation;
    els.feedbackPanel.hidden = true;
    els.eventModal.hidden = true;
    els.eventModal.setAttribute('aria-hidden', 'true');
    els.feedbackEvent.hidden = true;
    els.feedbackEvent.textContent = '';
    els.feedbackText.textContent = '';
    state.pendingFeedback = null;
    els.continueBtn.textContent = state.index === total - 1 ? 'See Your Course' : 'Continue';
    state.awaitingContinue = false;

    els.choices.innerHTML = '';
    scenario.choices.forEach((choice, choiceIndex) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-button';
      btn.textContent = choice.text;
      btn.dataset.choiceIndex = choiceIndex;
      btn.addEventListener('click', () => selectChoice(choiceIndex));
      els.choices.appendChild(btn);
    });

    renderIndicators();
    renderRoute();
    els.scenarioTitle.focus?.({ preventScroll: true });
  }

  function selectChoice(choiceIndex) {
    if (state.awaitingContinue) return;

    const scenario = data.scenarios[state.index];
    const choice = scenario.choices[choiceIndex];
    state.awaitingContinue = true;

    Object.entries(choice.effects || {}).forEach(([key, delta]) => {
      if (Object.prototype.hasOwnProperty.call(state.indicators, key)) {
        state.indicators[key] = clamp(state.indicators[key] + delta);
      }
    });

    (choice.tags || []).forEach(tag => {
      state.tagCounts[tag] = (state.tagCounts[tag] || 0) + 1;
    });

    [...els.choices.querySelectorAll('.choice-button')].forEach((btn, index) => {
      btn.disabled = true;
      if (index === choiceIndex) btn.classList.add('selected');
    });

    renderIndicators();
    state.pendingFeedback = choice.feedback;

    if (choice.eventTitle) {
      els.eventTitle.textContent = choice.eventTitle;
      els.eventBody.textContent = choice.eventBody || 'Not literally. But things have taken a sudden turn.';
      els.eventModal.hidden = false;
      els.eventModal.setAttribute('aria-hidden', 'false');
      els.eventContinueBtn.focus();
    } else {
      revealFeedback(choice);
    }
  }

  function revealFeedback(choice = null) {
    const source = choice || {};
    if (source.eventTitle) {
      els.feedbackEvent.textContent = source.eventTitle;
      els.feedbackEvent.hidden = false;
    } else {
      els.feedbackEvent.hidden = true;
      els.feedbackEvent.textContent = '';
    }
    els.feedbackText.textContent = state.pendingFeedback || source.feedback || '';
    els.feedbackPanel.hidden = false;
    els.continueBtn.focus();
  }

  function dismissEventModal() {
    els.eventModal.hidden = true;
    els.eventModal.setAttribute('aria-hidden', 'true');
    revealFeedback();
  }

  function determineResult() {
    const experiments = state.tagCounts.experiment || 0;
    const { momentum, capacity, collaboration } = state.indicators;

    // Prioritize a clear behavioral pattern when the player repeatedly chose experiments.
    if (experiments >= 2) {
      return data.results.find(r => r.rule === 'experiment');
    }

    const candidates = [
      { rule: 'collaboration', value: collaboration },
      { rule: 'capacity', value: capacity },
      { rule: 'momentum', value: momentum }
    ].sort((a, b) => b.value - a.value);

    return data.results.find(r => r.rule === candidates[0].rule) || data.results[0];
  }

  function finalMeterMarkup(key, value) {
    const meta = metricEls[key];
    return `
      <div class="final-meter-row">
        <div class="meter-heading"><span>${meta.label}</span><strong>${Math.round(value)}</strong></div>
        <div class="meter"><div class="meter-fill" style="width:${clamp(value)}%"></div></div>
      </div>`;
  }

  function showEnding() {
    const result = determineResult();
    els.resultTitle.textContent = result.title;
    els.resultDescription.textContent = result.description;
    els.finalMeters.innerHTML = Object.keys(metricEls)
      .map(key => finalMeterMarkup(key, state.indicators[key]))
      .join('');

    els.sailboatBtn.textContent = data.settings.sailboatUrl ? 'Continue to the Sailboat Exercise' : 'Finish';
    showScreen(els.endScreen);
    els.restartBtn.hidden = false;
  }

  function nextStep() {
    if (!state.awaitingContinue) return;
    if (state.index >= data.scenarios.length - 1) {
      showEnding();
      return;
    }
    state.index += 1;
    renderScenario();
  }

  function startGame() {
    state = createInitialState();
    els.restartBtn.hidden = false;
    showScreen(els.gameScreen);
    renderScenario();
  }

  function restartGame() {
    state = createInitialState();
    els.restartBtn.hidden = true;
    showScreen(els.startScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function loadData() {
    try {
      const response = await fetch('scenarios.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = await response.json();

      if (!data.scenarios || !Array.isArray(data.scenarios) || data.scenarios.length === 0) {
        throw new Error('No scenarios were found in scenarios.json.');
      }

      state = createInitialState();
    } catch (error) {
      console.error(error);
      els.errorText.textContent = `The game could not read scenarios.json (${error.message}). If you opened index.html directly from your computer, start a local web server instead. See README.md for instructions.`;
      showScreen(els.errorScreen);
    }
  }

  els.beginBtn.addEventListener('click', startGame);
  els.restartBtn.addEventListener('click', restartGame);
  els.continueBtn.addEventListener('click', nextStep);
  els.eventContinueBtn.addEventListener('click', dismissEventModal);

  els.sailboatBtn.addEventListener('click', () => {
    const url = data?.settings?.sailboatUrl?.trim();
    if (url) {
      window.location.href = url;
    } else {
      els.sailboatBtn.textContent = 'Ready for the Sailboat Exercise';
      els.sailboatBtn.disabled = true;
    }
  });

  loadData();
})();
