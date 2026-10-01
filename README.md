# Syphr

***Live Site:*** [https://syphr.pages.dev](https://syphr.pages.dev)

---

> ### ⚠️ Project Disclaimer
> **This is strictly a non-commercial, educational hobby project.** 
> **All application architecture, user interface design, logic, and source code in this repository were completely generated using Artificial Intelligence (AI).** It is maintained solely for learning, personal experimentation, and prototyping purposes.

---

Syphr is a browser-based, serverless communication tool designed for private, transient conversations. Unlike traditional messaging platforms that route messages through centralized databases or rely on cloud persistence, Syphr operates entirely in browser memory (RAM). Once a session terminates, either by closing the tab or initiating the emergency purge protocol, all traces of conversation history, shared files, and media are destroyed immediately.

The application leverages direct browser-to-browser WebRTC DataChannels for all data transfer. Signaling can be handled through compressed URL fragments or QR code exchange, enabling direct peer discovery without permanent backend storage.

## Tech Stack

- Languages: HTML5, CSS3, Modern JavaScript (ES6+), TypeScript
- Real-Time Communication: WebRTC API (RTCPeerConnection, RTCDataChannel)
- Media Capture: MediaStreams API, MediaRecorder API
- Tooling & Build System: Vite, TypeScript Compiler (tsc)
- External Libraries: Lucide Icons, QRCode.js

## Features

- Zero Disk Retention: Operates exclusively within volatile memory. No LocalStorage, SessionStorage, or IndexedDB caching of message bodies or transferred media.
- DTLS Transport Encryption: End-to-end cryptographic protection provided natively by the WebRTC DTLS/SRTP protocol stack.
- Peer-to-Peer File & Image Sharing: Direct binary transmission of images and documents without intermediate cloud storage. Images are rendered with automatic aspect-ratio preservation and constrained viewport heights.
- Interactive Lightbox: Click-to-expand image previews for received and sent visual media.
- Voice Messaging: Tap-to-record voice notes using standard browser audio APIs with automatic track teardown upon completion.
- Formatted Code Snippets: Dedicated syntax-ready code block presentation for technical conversations.
- Stealth Mode: Background blur overlay that masks the active chat feed when window focus is lost or manually triggered for shoulder-surfing protection.
- Emergency Purge Protocol: One-click session destruction that terminates peer connections, tears down data channels, and clears all DOM and memory references.
- QR Code Connection: Fast mobile-to-desktop pairing via dynamic QR code generation encoding session initialization parameters.
- Responsive Minimalist Interface: Notion- and Apple-inspired visual design supporting both dark and light display modes.

### Starting a Chat Session

1. Open the application in your browser to generate a new session.
2. Share the generated room link or QR code with your peer.
3. Once the peer opens the link, the WebRTC handshake completes automatically.
4. When the connection status indicator turns green, messages and files are transmitted directly between browsers.
5. End the conversation by clicking the nuke button or closing the browser window to erase all session data.
