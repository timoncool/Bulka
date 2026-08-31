import reverbGen from './reverbGen.mjs';
import { clamp } from './util.mjs';

if (typeof AudioContext !== 'undefined') {
  AudioContext.prototype.adjustLength = function (duration, buffer, speed = 1, offsetAmount = 0) {
    const sampleOffset = Math.floor(clamp(offsetAmount, 0, 1) * buffer.length);
    const newLength = buffer.sampleRate * duration;
    const newBuffer = this.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      let oldData = buffer.getChannelData(channel);
      let newData = newBuffer.getChannelData(channel);

      for (let i = 0; i < newLength; i++) {
        // loop the buffer around to prevent
        let position = (sampleOffset + i * Math.abs(speed)) % oldData.length;
        if (speed < 1) {
          position = position * -1;
        }

        newData[i] = oldData.at(position) || 0;
      }
    }
    return newBuffer;
  };

  AudioContext.prototype.createReverb = function (duration, fade, lp, dim, ir, irspeed, irbegin) {
    const convolver = this.createConvolver();
    convolver.generate = (d = 2, fade = 0.1, lp = 15000, dim = 1000, ir, irspeed, irbegin) => {
      convolver.duration = d;
      convolver.fade = fade;
      convolver.lp = lp;
      convolver.dim = dim;
      convolver.ir = ir;
      convolver.irspeed = irspeed;
      convolver.irbegin = irbegin;
      if (ir) {
        convolver.buffer = this.adjustLength(d, ir, irspeed, irbegin);
      } else {
        reverbGen.generateReverb(
          {
            audioContext: this,
            numChannels: 2,
            decayTime: d,
            fadeInTime: fade,
            lpFreqStart: lp,
            lpFreqEnd: dim,
          },
          (buffer) => {
            convolver.buffer = buffer;
          },
        );
      }
    };
    convolver.generate(duration, fade, lp, dim, ir, irspeed, irbegin);
    return convolver;
  };
}
