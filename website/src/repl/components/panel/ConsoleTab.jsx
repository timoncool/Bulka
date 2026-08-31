import cx from '@src/cx.mjs';
import { useSettings } from '../../../settings.mjs';
import { useStore } from '@nanostores/react';
import { $strudel_log_history } from '../useLogger';
import { useEffect, useRef } from 'react';

export function ConsoleTab() {
  const log = useStore($strudel_log_history);
  const { fontFamily } = useSettings();
  const scrollRef = useRef();
  // scroll to bottom when log changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log]);
  return (
    <div id="console-tab" className="break-all w-full h-full" style={{ fontFamily }}>
      <div className="h-full w-full overflow-auto space-y-1 p-2 rounded-md" ref={scrollRef}>
        {' '}
        {/* bg-background */}
        {log.map((l, i) => {
          const message = linkify(l.message);
          const color = l.data?.hap?.value?.color;
          return (
            <div
              key={l.id}
              className={cx(
                'whitespace-nowrap',
                l.type === 'error' ? 'text-background bg-foreground' : 'text-foreground',
                l.type === 'highlight' && 'underline',
              )}
              style={color ? { color } : {}}
            >
              <span dangerouslySetInnerHTML={{ __html: message }} className="whitespace-nowrap" />
              {l.count ? ` (${l.count})` : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function linkify(inputText) {
  var replacedText, replacePattern1, replacePattern2, replacePattern3;

  //URLs starting with http://, https://, or ftp://
  replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  replacedText = inputText.replace(replacePattern1, '<a class="underline" href="$1" target="_blank">$1</a>');

  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  replacedText = replacedText.replace(
    replacePattern2,
    '$1<a class="underline" href="http://$2" target="_blank">$2</a>',
  );

  //Change email addresses to mailto:: links.
  replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
  replacedText = replacedText.replace(replacePattern3, '<a class="underline" href="mailto:$1">$1</a>');

  return replacedText;
}
