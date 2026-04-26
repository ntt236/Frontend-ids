"use client";
import { useEffect, useRef } from "react";
import { useAppDispatch } from "./useAppStore";
import { addRealtimeAlert } from "@/store/slices/alertSlice";
import { setConnected, setDisconnected, setConnecting, setLastMessage } from "@/store/slices/wsSlice";
import type { WsAlert } from "@/types";
import { toast } from "sonner";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "@/lib/constants";
import { store } from "@/store/store";

export function useWebSocket(enabled: boolean = true) {
  const dispatch = useAppDispatch();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const token = store.getState().auth.accessToken;
    
    dispatch(setConnecting());

    const client = new Client({
      // SockJS uses HTTP URL mapping
      webSocketFactory: () => new SockJS(WS_URL.replace("ws://", "http://").replace("wss://", "https://")),
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      // debug: (str) => console.log(str), // Uncomment to debug STOMP traffic
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      dispatch(setConnected());
      // Lắng nghe topic từ backend Spring Boot
      client.subscribe("/topic/alerts", (message) => {
        if (message.body) {
          try {
            const alert = JSON.parse(message.body) as WsAlert;
            dispatch(addRealtimeAlert(alert as never));
            dispatch(setLastMessage(new Date().toISOString()));

            const toastFn = alert.severity === "CRITICAL" ? toast.error : toast.warning;
            toastFn(`[${alert.severity}] ${alert.alertType}`, {
              description: alert.message,
              duration: 6000,
            });
          } catch (err) {
            console.error("Failed to parse websocket message", err);
          }
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    client.onWebSocketClose = () => {
      dispatch(setDisconnected());
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      dispatch(setDisconnected());
    };
  }, [enabled, dispatch]);

  return clientRef;
}
