"use client";

import { useEffect, useRef } from "react";
import { TalkingHead } from "@met4citizen/talkinghead";

export default function TalkingHeadAvatar() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const headRef = useRef<any>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // import talking head from public
        
        let cancelled = false;
        
        const init = async () => {
            const mod = await (0, eval)(
            'import("/talkinghead/modules/talkinghead.mjs")'
            );
            const TalkingHead = mod.TalkingHead;
            
            const head = new TalkingHead(container, {
                ttsEndpoint: "/api/tts",
                cameraView: "upper",
            });

            await head.showAvatar({
                url: "/avatars/model.glb",
                body: "F",
                avatarMood: "neutral",
                ttsLang: "en-US",
            });

            if (!cancelled) {
                headRef.current = head;
            }
        };

        init().catch(console.error);

        return () => {
            cancelled = true;
            headRef.current = null;
        };
    }, []);

    return <div ref={containerRef} className="h-[500px] w-full" />;
}