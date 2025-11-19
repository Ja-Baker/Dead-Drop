import { useState } from 'react';
import { Button } from '../primitives/Button';
import './LastWordsGenerator.css';

const LAST_WORDS = [
  "DELETE MY BROWSER HISTORY",
  "I LEFT $10 MILLION IN THE...",
  "IT'S IN THE BANANA STAND",
  "TELL THEM I SAID NOTHING",
  "CLEAR MY SEARCH HISTORY",
  "THE PASSWORDS ARE IN MY...",
  "I HIDDEN THE MONEY IN...",
  "THEY'LL NEVER FIND THE...",
  "MY THERAPIST WAS RIGHT",
  "I SHOULD'VE BOUGHT BITCOIN",
  "EPSTEIN DIDN'T...",
  "JET FUEL CAN'T...",
  "SKIP MY FUNERAL, GO BRUNCH",
  "MONETIZE MY DEATH",
  "STREAM MY FUNERAL",
  "TAG ME IN THE OBITUARY",
  "MAKE IT A MEME",
  "GO VIRAL OR GO HOME",
  "RATIO GOD HIMSELF",
  "BASED AND DEATH-PILLED",
];

export const LastWordsGenerator = () => {
  const [words, setWords] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const randomWords = LAST_WORDS[Math.floor(Math.random() * LAST_WORDS.length)];
    setWords(randomWords);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (words) {
      navigator.clipboard.writeText(words);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="last-words-generator">
      <h3 className="generator-title">LAST WORDS GENERATOR</h3>
      <p className="generator-subtitle">WHAT'S YOUR FINAL QUOTE?</p>

      {!words ? (
        <Button variant="primary" size="lg" fullWidth onClick={generate}>
          GENERATE LAST WORDS
        </Button>
      ) : (
        <div className="words-result slide-up">
          <div className="words-quote rgb-split">"{words}"</div>
          <div className="words-attribution">- YOU, PROBABLY</div>
          <div className="words-actions">
            <Button variant="ghost" size="sm" fullWidth onClick={generate}>
              REGENERATE
            </Button>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={copyToClipboard}
            >
              {copied ? '✓ COPIED' : 'COPY'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
