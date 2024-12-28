import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const WebSocketService = {
    connect: (username, onMessageReceived) => {
        const wsURL = `http://localhost:8080/ws/`; //
        const client = new Client({
            // Replace `${username}` with actual value

            webSocketFactory: () => new SockJS(wsURL, null, { withCredentials: true }), // Ensure this endpoint matches your backend
            reconnectDelay: 5000,

            onConnect: () => {
                console.log("WebSocket connected successfully! ✅"); // Add this log
                client.subscribe(`/user/${username}/queue/notifications`, (message) => {
                    console.log("Notification received:", message.body); // Log messages from the server
                    onMessageReceived(message.body);
                });
            },

            onStompError: (frame) => {
                console.error('WebSocket STOMP error:', frame.headers['message']); // Log Stomp errors
            },

            onDisconnect: () => {
                console.log("WebSocket disconnected! ❌"); // Log disconnects
            },
        });

        console.log("Initializing WebSocket connection..."); // Log initialization
        client.activate(); // Activate the connection
        return client;
    },
};