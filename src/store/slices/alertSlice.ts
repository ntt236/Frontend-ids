import { createSlice, createAsyncThunk, createSelector, PayloadAction } from "@reduxjs/toolkit";
import type { AlertResponse, AlertStatusUpdateRequest, PageResponse } from "@/types";
import { alertService } from "@/services/api";
import type { RootState } from "@/store/store";

interface AlertFilters {
  status: string;
  alertType: string;
  page: number;
  size: number;
}

interface AlertState {
  list: AlertResponse[];
  totalElements: number;
  totalPages: number;
  filters: AlertFilters;
  unreadCount: number;
  latestAlert: AlertResponse | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: AlertState = {
  list: [],
  totalElements: 0,
  totalPages: 0,
  filters: { status: "ALL", alertType: "ALL", page: 0, size: 10 },
  unreadCount: 0,
  latestAlert: null,
  status: "idle",
  error: null,
};

export const fetchAlerts = createAsyncThunk(
  "alerts/fetchAll",
  async (filters: Partial<AlertFilters> | undefined, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const f = { ...state.alerts.filters, ...filters };
      const params = new URLSearchParams({ page: String(f.page), size: String(f.size) });
      if (f.status !== "ALL") params.append("status", f.status);
      if (f.alertType !== "ALL") params.append("alertType", f.alertType);
      const res = await alertService.getAll(Object.fromEntries(params));
      return res.data as PageResponse<AlertResponse>;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || "Failed to fetch alerts");
    }
  }
);

export const updateAlertStatus = createAsyncThunk(
  "alerts/updateStatus",
  async ({ id, body }: { id: number; body: AlertStatusUpdateRequest }, { rejectWithValue }) => {
    try {
      const res = await alertService.updateStatus(id, body.status);
      return res.data as AlertResponse;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || "Failed to update alert");
    }
  }
);

export const deleteAlert = createAsyncThunk(
  "alerts/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await alertService.delete(id);
      return id;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || "Failed to delete alert");
    }
  }
);

const alertSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<AlertFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    addRealtimeAlert(state, action: PayloadAction<AlertResponse>) {
      state.unreadCount += 1;
      state.latestAlert = action.payload;
      // Prepend to list if we're on first page
      if (state.filters.page === 0) {
        state.list.unshift(action.payload);
        if (state.list.length > state.filters.size) state.list.pop();
        state.totalElements += 1;
      }
    },
    clearUnread(state) {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.status = "idle";
        state.list = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(updateAlertStatus.fulfilled, (state, action) => {
        const idx = state.list.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.list = state.list.filter((a) => a.id !== action.payload);
        state.totalElements -= 1;
      });
  },
});

export const { setFilters, addRealtimeAlert, clearUnread } = alertSlice.actions;
export default alertSlice.reducer;

// Selectors
export const selectAlerts = (state: RootState) => state.alerts.list;
export const selectAlertFilters = (state: RootState) => state.alerts.filters;
export const selectUnreadCount = (state: RootState) => state.alerts.unreadCount;
export const selectLatestAlert = (state: RootState) => state.alerts.latestAlert;
export const selectAlertStatus = (state: RootState) => state.alerts.status;
export const selectTotalPages = (state: RootState) => state.alerts.totalPages;
export const selectTotalElements = (state: RootState) => state.alerts.totalElements;

// Memoized
export const selectOpenAlerts = createSelector(selectAlerts, (alerts) =>
  alerts.filter((a) => a.status === "OPEN")
);
