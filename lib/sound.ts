interface Sounds {
  [key: string]: HTMLAudioElement;
}

export class SoundManager {
  private sounds: Sounds;

  constructor() {
    this.sounds = {
      pop: new Audio('sounds/pop.mp3'),
      remove: new Audio('sounds/remove.mp3'),
      check: new Audio('sounds/check.mp3'),
      wrong: new Audio('sounds/wrong.mp3'),
      win: new Audio('sounds/win.mp3'),
      lose: new Audio('sounds/lose.mp3'),
      click: new Audio('sounds/click.mp3'),
    };
  }

  play(soundName: keyof Sounds): void {
    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.error('播放音效失败:', err));
    }
  }
} 