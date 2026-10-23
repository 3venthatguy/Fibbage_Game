/**
 * Stage scaling for the host screen.
 * Lays the host UI out on a fixed 1920x1080 canvas and scales it to fit the
 * window, so the host screen never needs to scroll.
 */

const STAGE_WIDTH = 1920;
const STAGE_HEIGHT = 1080;

/**
 * Scales and centers the stage to fit the window.
 * If the content grows taller than the stage (many players, expanded results),
 * the stage shrinks further so everything stays visible.
 */
function fitStage() {
  const stage = document.getElementById('stage');
  if (!stage) return;

  const contentHeight = Math.max(STAGE_HEIGHT, stage.offsetHeight);
  const scale = Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / contentHeight);
  const offsetX = (window.innerWidth - STAGE_WIDTH * scale) / 2;
  const offsetY = (window.innerHeight - contentHeight * scale) / 2;

  stage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

window.addEventListener('resize', fitStage);

// Transforms don't affect layout size, so this only fires when content changes
new ResizeObserver(fitStage).observe(document.getElementById('stage'));

fitStage();
