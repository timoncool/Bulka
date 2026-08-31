if (typeof DelayNode !== 'undefined') {
  class FeedbackDelayNode extends DelayNode {
    constructor(ac, wet, time, feedback) {
      super(ac);
      wet = Math.abs(wet);
      this.delayTime.value = time;

      this.feedbackGain = ac.createGain();
      this.feedbackGain.gain.value = Math.min(Math.abs(feedback), 0.995);
      this.feedback = this.feedbackGain.gain;

      this.delayGain = ac.createGain();
      this.delayGain.gain.value = wet;

      this.connect(this.feedbackGain);
      this.connect(this.delayGain);
      this.feedbackGain.connect(this);

      this.connect = (target) => this.delayGain.connect(target);
      return this;
    }
    start(t) {
      this.delayGain.gain.setValueAtTime(this.delayGain.gain.value, t + this.delayTime.value);
    }
  }

  BaseAudioContext.prototype.createFeedbackDelay = function (wet, time, feedback) {
    return new FeedbackDelayNode(this, wet, time, feedback);
  };
}
