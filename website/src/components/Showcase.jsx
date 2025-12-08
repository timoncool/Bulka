import { useState } from 'react';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

export function shuffleArray(array) {
  array = [...array];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
let _shuffled;

export function Showcase() {
  const [videos, setVideos] = useState(_shuffled);
  return (
    <>
      <div className="flex space-x-2">
        <button className="bg-lineHighlight p-2 rounded-md" onClick={() => setVideos(shuffleArray(_videos))}>
          <span>shuffle videos</span>
        </button>
        <button className="bg-lineHighlight p-2 rounded-md" onClick={() => setVideos(_videos)}>
          <span>newest first</span>
        </button>
      </div>
      {videos.map((video, i) => (
        <div key={i}>
          <h2>{video.title}</h2>
          <LiteYouTubeEmbed {...video} />
          {video.description && <p>{video.description}</p>}
        </div>
      ))}
    </>
  );
}

let _videos = [
  // 2025
  { title: 'Switch Angel - 2 Minute Deep Acid in Strudel (Aug 2025)', id: 'HkgV_-nJOuE' },
  { title: 'Switch Angel - Trance from scratch (2025)', id: 'iu5rnQkfO6M' },
  // TOPLAP Solstice December 2024
  { title: 'Djenerative Music by Bogdan Vera @ TOPLAP solstice Dec 2024', id: 'LtMX4Lr1nzY' },
  { title: 'La musique by BuboBubo @ TOPLAP solstice Dec 2024', id: 'Oz00Y_f80wU' },
  { title: 'Livecode and vocal breaks by Switch Angel @ TOPLAP solstice Dec 2024', id: '2kzjOIsL6CM' },
  { title: 'TOPLAP Solstice Stream Dec 2024 - Full Playlist', id: '2kECLkYhrp8', params: 'list=PLbyPZ-v56IPnG1-_sGboU7U8qIra_GxEn' },
  // 2024
  { title: 'Eddyflux algorave set @ rudolf5 2024', id: 'MXz8131Ut0A' },
  { title: 'DJ_Dave - Array [Lil Data Edit]', id: 'KUujFuTcuKc' },
  { title: 'DJ_Dave - Bitrot [v10101a Edit]', id: 'z_cJMdBp67Q' },
  { title: 'Switch Angel - Morrow', id: 'qiatPuJpxLs' },
  {
    title: 'Jade Rose - Into your spell',
    id: 'lxQgBeLQBgk',
    description:
      'Jade Rose performing with various synths via MIDI, superdirt via OSC and the native strudel superdough engine + vocal parts!',
  },
  {
    title: 'boggo - Live Coding Metal Djents',
    id: 'n0rhn9-PRwE',
    description: 'A rare sight: live coded Metal Djents, where strudel is sending MIDI to bespoke synth!',
  },
  // solstice 2023
  { title: 'Jade Rose @ solstice stream 2023', id: 'wg0vW5Ac7L0' },
  {
    title: 'eddyflux @ solstice stream 2023',
    id: 'DX8E99kC7q0',
    description:
      'A from-scratch session, starting with sample loops, later transitioning to more electronic territory.',
  },
  {
    title: 'CCC @ solstice stream 2023',
    id: '3uLTIDQa_Lc',
    params: 'start=24',
  },
  { title: 'letSeaTstrudeL @ solstice stream 2023', id: 'fTiX6dVtdWQ' },
  { title: 'totalgee (Glen F) @ solstice stream 2023', id: 'IvI6uaE3nLU' },
  // algo afro futures 2023
  {
    title: 'Emma Osman @ (Algo|Afro) Futures 2023',
    id: 'zUoZvkZ3J7Q',
    params: 'start=1278',
  },
  {
    title: 'Tyga Blue @ (Algo|Afro) Futures 2023',
    id: 'zUoZvkZ3J7Q',
    params: 'start=10909',
  },
  // другие
  { title: 'you will not steve reich your way out of it', id: 'xpILnXcWyuo' },
  { title: 'dough dream #1 - strudel jam', id: 'p0J7XrT9JEs' },
  { title: 'eddyflux & superdirtspatz at the dough cathedral', id: 'GrkwKMQ7_Ys' },
  {
    title: 'yaxu & olivia - Algorithmic Pattern Live Stream',
    id: 'Jvs7Q4cdLy4',
    description:
      'A first foray into combining (an early version) strudel and hydra, using flok for collaborative coding.',
  },
  { title: 'froos @ Algorave 10th Birthday stream', id: 'IcMSocdKwvw' },
  { title: 'todepasta 1.5', id: 'gCwaVu1Mijg' },
];

_shuffled = shuffleArray(_videos);
