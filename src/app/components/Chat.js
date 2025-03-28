"use client"
import { useEffect } from "react";

const LiveStream = ({ roomName }) => {
    useEffect(() => {
        // Override User-Agent to prevent Jitsi browser warning
        navigator.__defineGetter__('userAgent', function(){
            return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36";
        });

        // Load Jitsi API dynamically
        if (!window.JitsiMeetExternalAPI) {
            const script = document.createElement("script");
            script.src = "https://meet.jit.si/external_api.js";
            script.async = true;
            script.onload = () => initializeJitsi();
            document.body.appendChild(script);
        } else {
            initializeJitsi();
        }

        function initializeJitsi() {
            if (window.JitsiMeetExternalAPI) {
                const options = {
                    roomName: roomName,
                    width: "100%",
                    height: 500,
                    parentNode: document.getElementById("jitsi-container"),
                    configOverwrite: {
                        prejoinPageEnabled: false,
                        disableDeepLinking: true,
                        enableNoAudioDetection: true,
                    },
                    interfaceConfigOverwrite: {
                        TOOLBAR_BUTTONS: ["microphone", "camera", "chat", "hangup"],
                    },
                };
                new window.JitsiMeetExternalAPI("meet.jit.si", options);
            }
        }
    }, [roomName]);

    return <div id="jitsi-container"></div>;
};

export default LiveStream;
