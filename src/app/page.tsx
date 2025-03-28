"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
const useRouter = dynamic(() => import("next/router").then((mod) => mod.useRouter), { ssr: false });

export default function LiveStream() {
  const [peerId, setPeerId] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [viewerId, setViewerId] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const videoRef = useRef(null);
  const peerInstance = useRef(null);
  const connRef = useRef(null);
  const router = isClient ? useRouter() : null;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && router.isReady) {
      setViewerId(router.query.viewer || null);
    }
  }, [isClient, router.isReady, router.query]);

  useEffect(() => {
    if (isClient) {
      import("peerjs").then(({ Peer }) => {
        const peer = new Peer(); // Using PeerJS cloud service
        peerInstance.current = peer;

        peer.on("open", (id) => {
          setPeerId(id);
        });

        if (!viewerId) {
          navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
              if (videoRef.current) videoRef.current.srcObject = stream;
              peer.on("connection", (conn) => {
                connRef.current = conn;
                conn.on("data", (data) => {
                  setMessages((prev) => [...prev, { sender: "viewer", text: data }]);
                });
              });
              peer.on("call", (call) => call.answer(stream));
            })
            .catch((err) => console.error("Error accessing media devices:", err));
        } else {
          const remotePeer = new Peer();
          remotePeer.on("open", () => {
            const conn = remotePeer.connect(viewerId);
            connRef.current = conn;
            conn.on("data", (data) => {
              setMessages((prev) => [...prev, { sender: "streamer", text: data }]);
            });
            const call = remotePeer.call(viewerId, null);
            call.on("stream", (stream) => {
              if (videoRef.current) videoRef.current.srcObject = stream;
            });
          });
        }
      });
    }
  }, [isClient, viewerId]);

  const sendMessage = () => {
    if (connRef.current) {
      connRef.current.send(message);
      setMessages((prev) => [...prev, { sender: "me", text: message }]);
      setMessage("");
    }
  };

if (!isClient || !router) return null;

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <h1 className="text-xl font-bold">Live Streaming & Chat</h1>
      {!viewerId && typeof window !== "undefined" && (
        <p className="text-sm">Share this link for viewers: <a href={`${window.location.origin}?viewer=${peerId}`} target="_blank" className="text-blue-600 underline">{window.location.origin}?viewer={peerId}</a></p>
      )}
      <video ref={videoRef} autoPlay playsInline className="w-1/2 border" />
      <div className="w-full max-w-md border p-4 rounded">
        <h2 className="text-lg font-bold">Chat</h2>
        <div className="h-40 overflow-y-auto border p-2 rounded mb-2">
          {messages.map((msg, index) => (
            <p key={index} className={msg.sender === "me" ? "text-right" : "text-left"}>
              <span className={msg.sender === "me" ? "bg-blue-300 p-1 rounded" : "bg-gray-300 p-1 rounded"}>
                {msg.text}
              </span>
            </p>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border p-2 flex-grow rounded"
          />
          <button onClick={sendMessage} className="bg-green-500 text-white p-2 ml-2 rounded">Send</button>
        </div>
      </div>
    </div>
  );
}
