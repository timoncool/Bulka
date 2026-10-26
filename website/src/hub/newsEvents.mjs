// Impressions and clicks of the hub's news go through the hub's notices script: it holds the hub that answered and
// sends nothing until the person agreed to statistics (data-events), like its own strips and popups.
let missingReported = false;

/** @param {string} id @param {'shown'|'clicked'|'dismissed'} kind @param {string} [button] `b<index>` or `link` */
export function countNewsEvent(id, kind, button) {
  const hub = window.StudioHub;
  if (typeof hub?.count !== 'function') {
    if (!missingReported) {
      missingReported = true;
      console.error(
        '[hub news] the notices script has no StudioHub.count(): news impressions and clicks are not counted',
      );
    }
    return;
  }
  hub.count(id, kind, button);
}
