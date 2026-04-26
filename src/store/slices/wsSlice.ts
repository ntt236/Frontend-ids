import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ConnectionStatus = "disconnected" | "connecting" | "connected";

interface WsState {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  lastMessageTime: string | null;
}

const initialState: WsState = {
  isConnected: false,
  connectionStatus: "disconnected",
  lastMessageTime: null,
};

const wsSlice = createSlice({
  name: "ws",
  initialState,
  reducers: {
    setConnecting(state) {
      state.connectionStatus = "connecting";
      state.isConnected = false;
    },
    setConnected(state) {
      state.connectionStatus = "connected";
      state.isConnected = true;
    },
    setDisconnected(state) {
      state.connectionStatus = "disconnected";
      state.isConnected = false;
    },
    setLastMessage(state, action: PayloadAction<string>) {
      state.lastMessageTime = action.payload;
    },
  },
});

export const { setConnecting, setConnected, setDisconnected, setLastMessage } = wsSlice.actions;
export default wsSlice.reducer;

export const selectWsStatus = (state: { ws: WsState }) => state.ws.connectionStatus;
export const selectIsWsConnected = (state: { ws: WsState }) => state.ws.isConnected;
