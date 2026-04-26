import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { DashboardStatsResponse } from "@/types";
import { dashboardService } from "@/services/api";

interface DashboardState {
  stats: DashboardStatsResponse | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  status: "idle",
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (params: { from?: string; to?: string } | undefined, { rejectWithValue }) => {
    try {
      const res = await dashboardService.getStats(params?.from, params?.to);
      return res.data as DashboardStatsResponse;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || "Failed to fetch dashboard stats");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = "idle";
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;

export const selectDashboardStats = (state: { dashboard: DashboardState }) => state.dashboard.stats;
export const selectDashboardStatus = (state: { dashboard: DashboardState }) => state.dashboard.status;
