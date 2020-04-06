import { useState, useEffect } from 'react';
const cardAudio = require('./sounds/cardSlide4.wav');

const useAudio = (url) => {
  const [queue, setQueue] = useState(0);
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const play = (num) => {
    if (!num) {
      num = 1;
    }
    if (!playing) {
      setPlaying(true);
      setQueue(queue + num - 1);
    } else {
      setQueue(queue + num);
    }
  };

  useEffect(() => {
    playing ? audio.play() : audio.pause();
  }, [playing, audio]);

  useEffect(() => {
    const endedEventListener = () => {
      if (queue === 0) {
        setPlaying(false);
      } else {
        setQueue(queue - 1);
        audio.play();
      }
    };
    audio.addEventListener('ended', endedEventListener);
    return () => {
      audio.removeEventListener('ended', endedEventListener);
    };
  }, [audio, queue]);

  return play;
};

const useCardAudio = () => {
  return useAudio(cardAudio);
};

export { useAudio, useCardAudio };
