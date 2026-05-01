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
import { USE_MOCK } from "@/services/api";

export function useWebSocket(enabled: boolean = true) {
  const dispatch = useAppDispatch();
  const clientRef = useRef<Client | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    if (USE_MOCK) {
      dispatch(setConnecting());
      const connectTimeout = setTimeout(() => {
        dispatch(setConnected());

        intervalRef.current = setInterval(() => {
          const types = ["DoS", "Probe", "R2L", "U2R"];
          const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
          
          const typeIdx = Math.floor(Math.random() * types.length);
          const sevIdx = Math.random() > 0.8 ? 0 : Math.floor(Math.random() * 3) + 1;
          
          const newAlert: WsAlert = {
            id: Date.now(),
            packetId: Math.floor(Math.random() * 10000),
            alertType: types[typeIdx],
            severity: severities[sevIdx],
            message: `Mock incoming threat detected from external IP. Pattern: ${types[typeIdx]}`,
            status: "OPEN",
            createdAt: new Date().toISOString()
          };

          dispatch(addRealtimeAlert(newAlert as never));
          dispatch(setLastMessage(new Date().toISOString()));

          const toastFn = newAlert.severity === "CRITICAL" ? toast.error : toast.warning;
          toastFn(`[${newAlert.severity}] ${newAlert.alertType}`, {
            description: newAlert.message,
            duration: 6000,
          });

        }, Math.floor(Math.random() * 5000) + 3000);
      }, 1000);

      return () => {
        clearTimeout(connectTimeout);
        if (intervalRef.current) clearInterval(intervalRef.current);
        dispatch(setDisconnected());
      };
    }

    // --- REAL STOMP LOGIC ---
    const token = store.getState().auth.accessToken;
    dispatch(setConnecting());

    const client = new Client({
      // SockJS uses HTTP URL mapping
      webSocketFactory: () => new SockJS(WS_URL.replace("ws://", "http://").replace("wss://", "https://")),
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : "",
      },
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
