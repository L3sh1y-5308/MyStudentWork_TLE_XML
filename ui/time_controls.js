import {
  timeDateInput,
  timeSpeedRange,
  timeSpeedLabel,
  timePlayPauseBtn,
  timeNowBtn,
  timeStepBackBtn,
  timeStepForwardBtn,
  updateTime
} from "./elements.js";

const state = {
  baseRealMs: Date.now(),
  baseSimMs: Date.now(),
  speed: 1,
  lastSpeed: 1,
  paused: false
};

const STEP_MS = 5 * 60 * 1000;

function getSimMsAt(realMs) {
  if (state.paused || state.speed === 0) {
    return state.baseSimMs;
  }
  return state.baseSimMs + (realMs - state.baseRealMs) * state.speed;
}

function resetBase(realMs = Date.now()) {
  state.baseSimMs = getSimMsAt(realMs);
  state.baseRealMs = realMs;
}

export function setSimTime(date) {
  state.baseSimMs = date.getTime();
  state.baseRealMs = Date.now();
}

function setSpeed(speed) {
  resetBase();
  state.speed = speed;
  if (speed !== 0) {
    state.lastSpeed = speed;
    state.paused = false;
  } else {
    state.paused = true;
  }
}

function setPaused(paused) {
  resetBase();
  state.paused = paused;
  if (!paused && state.speed === 0) {
    state.speed = state.lastSpeed || 1;
  }
}

function stepBy(ms) {
  const next = new Date(getSimMsAt(Date.now()) + ms);
  setSimTime(next);
}

function formatForInput(date) {
  const tzOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 19);
}

function syncInput(date) {
  if (document.activeElement !== timeDateInput) {
    timeDateInput.value = formatForInput(date);
  }
}

function updateSpeedLabel() {
  const speedText = `${state.speed}x`;
  timeSpeedLabel.textContent = `Speed: ${speedText}`;
  timePlayPauseBtn.textContent = state.paused ? "Play" : "Pause";
  if (Number(timeSpeedRange.value) !== state.speed) {
    timeSpeedRange.value = String(state.speed);
  }
}

export function initTimeControls() {
  const initialDate = new Date();
  setSimTime(initialDate);
  timeDateInput.value = formatForInput(initialDate);
  updateSpeedLabel();

  timeDateInput.addEventListener("change", () => {
    if (!timeDateInput.value) {
      return;
    }
    const selected = new Date(timeDateInput.value);
    if (!Number.isNaN(selected.getTime())) {
      setSimTime(selected);
      updateTime(selected);
    }
  });

  timeSpeedRange.addEventListener("input", () => {
    const nextSpeed = Number.parseFloat(timeSpeedRange.value);
    if (Number.isFinite(nextSpeed)) {
      setSpeed(nextSpeed);
      updateSpeedLabel();
    }
  });

  timePlayPauseBtn.addEventListener("click", () => {
    setPaused(!state.paused);
    updateSpeedLabel();
  });

  timeNowBtn.addEventListener("click", () => {
    const now = new Date();
    setSimTime(now);
    updateTime(now);
    syncInput(now);
  });

  timeStepBackBtn.addEventListener("click", () => {
    stepBy(-STEP_MS);
    const sim = getSimulatedDate();
    updateTime(sim);
    syncInput(sim);
  });

  timeStepForwardBtn.addEventListener("click", () => {
    stepBy(STEP_MS);
    const sim = getSimulatedDate();
    updateTime(sim);
    syncInput(sim);
  });
}

export function getSimulatedDate() {
  return new Date(getSimMsAt(Date.now()));
}

export function syncTimeControls(date) {
  updateTime(date);
  syncInput(date);
  updateSpeedLabel();
}
