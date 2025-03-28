"use client"
import { useEffect } from "react";

const LiveStream = ({ roomName, isHost }) => {
  useEffect(() => {
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
        const domain = "meet.jit.si";
        const options = {
          roomName: roomName,
          width: "100%",
          height: 500,
          parentNode: document.getElementById("jitsi-container"),
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableNoAudioDetection: true,
            enableNoisyMicDetection: true,
            disableSimulcast: false, // Ensures better compatibility
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: ["microphone", "camera", "chat", "hangup"],
          },
        };
        new window.JitsiMeetExternalAPI(domain, options);
      }
    }

    return () => {
      document.getElementById("jitsi-container").innerHTML = "";
    };
  }, [roomName, isHost]);

  return <div id="jitsi-container"></div>;
};

export default LiveStream;