(() => {
  /* global SC */

  const iframe   = document.getElementById('sc-player');
  const soundBtn = document.querySelector('.btn-sound');
  const iconOn   = document.getElementById('icon-on');
  const iconOff  = document.getElementById('icon-off');

  const widget = SC.Widget(iframe);
  let isPlaying = false;

  // Use style.display — element.hidden is unreliable on inline SVG elements.
  function syncIcon(playing) {
    isPlaying             = playing;
    iconOn.style.display  = playing ? 'block' : 'none';
    iconOff.style.display = playing ? 'none'  : 'block';
  }

  // SC events keep state in sync for autoplay and track-end cases.
  widget.bind(SC.Widget.Events.PLAY,   () => syncIcon(true));
  widget.bind(SC.Widget.Events.PAUSE,  () => syncIcon(false));
  widget.bind(SC.Widget.Events.FINISH, () => syncIcon(false));

  // Play on first interaction with the page if autoplay was blocked.
  const INTERACTION_EVENTS = ['click', 'keydown', 'touchstart'];

  function startOnInteraction() {
    if (!isPlaying) widget.play();
    INTERACTION_EVENTS.forEach(evt =>
      document.removeEventListener(evt, startOnInteraction),
    );
  }

  INTERACTION_EVENTS.forEach(evt =>
    document.addEventListener(evt, startOnInteraction),
  );

  soundBtn.addEventListener('click', (e) => {
    // Stop the click from bubbling to startOnInteraction on the document.
    e.stopPropagation();
    // Update the icon immediately — don't wait for the async SC event.
    if (isPlaying) {
      widget.pause();
      syncIcon(false);
    } else {
      widget.play();
      syncIcon(true);
    }
  });
})();
