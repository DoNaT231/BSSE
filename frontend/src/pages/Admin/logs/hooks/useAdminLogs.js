import { useCallback, useEffect, useState } from "react";
import {
  fetchActivityLogs,
  fetchErrorLogs,
  fetchLogsSummary,
  resolveErrorLog,
} from "../api/adminLogsApi";

export default function useAdminLogs() {
  const [tab, setTab] = useState("summary");
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState({ items: [], total: 0, page: 1, limit: 50 });
  const [errors, setErrors] = useState({ items: [], total: 0, page: 1, limit: 50 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activityFilters, setActivityFilters] = useState({
    category: "",
    eventType: "",
    page: 1,
  });

  const [errorFilters, setErrorFilters] = useState({
    category: "",
    resolved: "",
    page: 1,
  });

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchLogsSummary();
      setSummary(data);
    } catch (e) {
      setError(e.message || "Hiba az összefoglaló betöltésekor.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActivity = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchActivityLogs(activityFilters);
      setActivity(data);
    } catch (e) {
      setError(e.message || "Hiba az eseménynapló betöltésekor.");
    } finally {
      setLoading(false);
    }
  }, [activityFilters]);

  const loadErrors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchErrorLogs(errorFilters);
      setErrors(data);
    } catch (e) {
      setError(e.message || "Hiba a hibanapló betöltésekor.");
    } finally {
      setLoading(false);
    }
  }, [errorFilters]);

  useEffect(() => {
    if (tab === "summary") loadSummary();
    if (tab === "activity") loadActivity();
    if (tab === "errors") loadErrors();
  }, [tab, loadSummary, loadActivity, loadErrors]);

  async function markErrorResolved(id, note) {
    await resolveErrorLog(id, note);
    await loadErrors();
    if (tab === "summary") await loadSummary();
  }

  return {
    tab,
    setTab,
    summary,
    activity,
    errors,
    loading,
    error,
    activityFilters,
    setActivityFilters,
    errorFilters,
    setErrorFilters,
    reload: {
      summary: loadSummary,
      activity: loadActivity,
      errors: loadErrors,
    },
    markErrorResolved,
  };
}
