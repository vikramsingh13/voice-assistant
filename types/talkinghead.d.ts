declare module "@met4citizen/talkinghead" {
  export class TalkingHead {
    constructor(container: HTMLElement, options?: any);
    showAvatar(options: any): Promise<void>;
    speakText(text: string, options?: any): Promise<void>;
    speakAudio(audio: ArrayBuffer | Blob, options?: any): Promise<void>;
  }
}