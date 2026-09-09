/* The campaign film on the Wines & Spirits page.
 *
 * Nothing starts on its own here. The poster and a play button stand in until
 * the visitor asks for the film, at which point the browser's own controls take
 * over, sound included.
 */
(function () {
  'use strict';

  var video = document.querySelector('[data-page-video]');
  var button = document.querySelector('[data-page-video-play]');
  if (!video || !button) return;

  var frame = video.closest('.ws-film__frame');

  button.addEventListener('click', function () {
    video.preload = 'auto';
    if (frame) frame.classList.add('is-playing');
    button.hidden = true;
    var played = video.play();
    if (played && played.catch) {
      played.catch(function () {
        // Refused with sound, which is the browser's call to make. Fall back to
        // a muted start so pressing play still does something, and leave the
        // browser's own sound control there to turn it back on.
        video.muted = true;
        video.play().catch(function () {
          if (frame) frame.classList.remove('is-playing');
          button.hidden = false;
        });
      });
    }
  });

  // Nothing keeps playing once it has scrolled away.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting && !video.paused) video.pause();
    }, { threshold: 0.2 }).observe(video);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && !video.paused) video.pause();
  });
})();
