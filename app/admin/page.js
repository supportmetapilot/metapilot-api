"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Campaign batch state
  const [batchPreset, setBatchPreset] = useState("50");
  const [customBatchSize, setCustomBatchSize] = useState("");
  const [startId, setStartId] = useState("");
  const [endId, setEndId] = useState("");
  const [delayPreset, setDelayPreset] = useState("2");
  const [customDelay, setCustomDelay] = useState("");
  const [delayUnit, setDelayUnit] = useState("sec"); // "sec" or "min"
  const [sendingBatch, setSendingBatch] = useState(false);
  const [batchResult, setBatchResult] = useState(null);

  // Import Leads state
  const [rawText, setRawText] = useState("");
  const [defaultRole, setDefaultRole] = useState("Software Engineer");
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importMessage, setImportMessage] = useState(null);

  // Test Email state
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("Hrushikesh More");
  const [testRole, setTestRole] = useState("Senior Software Engineer");
  const [testTemplate, setTestTemplate] = useState("A");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Leads list table
  const [leadsList, setLeadsList] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem("mp_admin_pin");
    if (savedPin === "metapilot2026") {
      setPin(savedPin);
      setIsAuthenticated(true);
      fetchStats();
      fetchLeads();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin.trim() === "metapilot2026") {
      localStorage.setItem("mp_admin_pin", "metapilot2026");
      setIsAuthenticated(true);
      fetchStats();
      fetchLeads();
    } else {
      alert("Invalid PIN. Please enter the correct MetaPilot Admin PIN.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("mp_admin_pin");
    setIsAuthenticated(false);
    setPin("");
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/send-mail?action=stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const res = await fetch("/api/leads?limit=50&offset=0");
      const data = await res.json();
      if (data.success) {
        setLeadsList(data.leads || []);
      }
    } catch (err) {
      console.error("Failed to load leads list", err);
    } finally {
      setLoadingLeads(false);
    }
  };

  // Compute active batch limit
  const activeLimit = batchPreset === "custom" ? parseInt(customBatchSize || "50", 10) : parseInt(batchPreset, 10);

  // Compute active delay in seconds
  const activeDelaySec =
    delayPreset === "custom"
      ? (parseFloat(customDelay || "2") * (delayUnit === "min" ? 60 : 1))
      : parseFloat(delayPreset);

  const estimatedTimeText = () => {
    const totalSec = activeLimit * activeDelaySec;
    if (totalSec < 60) return `${totalSec} seconds`;
    if (totalSec < 3600) return `${Math.round(totalSec / 60)} minutes`;
    return `${(totalSec / 3600).toFixed(1)} hours`;
  };

  // Handle Campaign Dispatch
  const handleSendBatch = async () => {
    const rangeMsg = startId && endId ? ` for Lead ID range ${startId} to ${endId}` : ` for next ${activeLimit} leads`;
    const confirmSend = window.confirm(
      `Start campaign${rangeMsg} with ${activeDelaySec}s gap between emails?\nEstimated duration: ~${estimatedTimeText()}`
    );
    if (!confirmSend) return;

    setSendingBatch(true);
    setBatchResult(null);

    try {
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "campaign",
          limit: activeLimit,
          startId: startId ? parseInt(startId, 10) : null,
          endId: endId ? parseInt(endId, 10) : null,
          delaySec: activeDelaySec,
          key: "metapilot2026",
        }),
      });
      const data = await res.json();
      setBatchResult(data);
      fetchStats();
      fetchLeads();
    } catch (err) {
      setBatchResult({ success: false, error: err.message });
    } finally {
      setSendingBatch(false);
    }
  };

  // Preview & Duplicate Check for Raw Lead Paste
  const handleCheckDuplicates = async () => {
    if (!rawText.trim()) {
      alert("Please paste some raw email data or names first.");
      return;
    }
    setImporting(true);
    setImportMessage(null);
    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "preview",
          rawText,
          defaultRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setImportPreview(data);
      } else {
        alert(data.error || "Failed to inspect data");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  // Save Clean Leads into Database
  const handleSaveCleanLeads = async () => {
    setImporting(true);
    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          rawText,
          defaultRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setImportMessage(`✔ ${data.message} (${data.skippedDuplicates || 0} duplicates skipped)`);
        setImportPreview(null);
        setRawText("");
        fetchStats();
        fetchLeads();
      } else {
        alert(data.error || "Failed to save leads");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  // Send Test Email
  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testEmail) {
      alert("Please enter a destination email address.");
      return;
    }

    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          email: testEmail.trim(),
          fullName: testName.trim(),
          jobRole: testRole.trim(),
          templateCode: testTemplate,
          key: "metapilot2026",
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setSendingTest(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", fontFamily: "sans-serif", padding: 16 }}>
        <div style={{ background: "#1e293b", padding: 32, borderRadius: 16, width: "100%", maxWidth: 400, color: "#fff", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px 0", textAlign: "center" }}>MetaPilot Marketing</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", margin: "0 0 24px 0" }}>Staff &amp; Admin 1-Click Portal</p>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#cbd5e1", marginBottom: 6 }}>Enter Access PIN:</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#fff", fontSize: 16, boxSizing: "border-box" }}
                autoFocus
              />
            </div>
            <button
              type="submit"
              style={{ width: "100%", padding: 14, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: "pointer" }}
            >
              Sign In to Hub &rarr;
            </button>
          </form>
          <p style={{ fontSize: 12, color: "#64748b", textAlign: "center", marginTop: 20 }}>Default PIN: metapilot2026</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "#0f172a" }}>MetaPilot Outreach Automation</h1>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 14 }}>
              100% Human HR Format (Primary Inbox) &bull; Auto Round-Robin A &rarr; B &rarr; C
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => { fetchStats(); fetchLeads(); }}
              disabled={loadingStats}
              style={{ padding: "8px 16px", background: "#e2e8f0", color: "#1e293b", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              {loadingStats ? "Refreshing..." : "🔄 Refresh"}
            </button>
            <button
              onClick={handleLogout}
              style={{ padding: "8px 16px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Live Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Leads</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{stats ? stats.totalLeads : "--"}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
              IDs: {stats?.minLeadId || 1} to {stats?.maxLeadId || "--"}
            </div>
          </div>

          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#065f46", fontWeight: 700, textTransform: "uppercase" }}>Mail 1 (Initial)</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#047857", marginTop: 4 }}>{stats ? stats.mail1Sent : "--"}</div>
            <div style={{ fontSize: 12, color: "#059669", marginTop: 2 }}>Sent &bull; {stats ? stats.mail1Pending : "--"} Ready</div>
          </div>

          <div style={{ background: "#faf5ff", border: "1px solid #d8b4fe", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#6d28d9", fontWeight: 700, textTransform: "uppercase" }}>Mail 2 (Follow-up)</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#7c3aed", marginTop: 4 }}>{stats ? stats.mail2Sent : "--"}</div>
            <div style={{ fontSize: 12, color: "#8b5cf6", marginTop: 2 }}>Sent &bull; {stats ? stats.mail2Pending : "--"} Ready</div>
          </div>

          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#92400e", fontWeight: 700, textTransform: "uppercase" }}>Mail 3 (Final Call)</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#b45309", marginTop: 4 }}>{stats ? stats.mail3Sent : "--"}</div>
            <div style={{ fontSize: 12, color: "#d97706", marginTop: 2 }}>Sent &bull; {stats ? stats.mail3Pending : "--"} Ready</div>
          </div>
        </div>

        {/* Section 1: 🚀 Smart Campaign Dispatcher */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0f172a" }}>🚀 1-Click Campaign Dispatcher</h2>
            <span style={{ fontSize: 12, padding: "4px 8px", background: "#ecfdf5", color: "#065f46", borderRadius: 4, fontWeight: 700 }}>
              Auto Shuffling: 1st=A, 2nd=B, 3rd=C, 4th=A...
            </span>
          </div>
          <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "#64748b" }}>
            The system automatically alternates templates (A &rarr; B &rarr; C) across leads for Mail 1, and follows the strict cyclic follow-up rotation (A &rarr; B &rarr; C &rarr; A).
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
            {/* Batch Size */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Batch Size:</label>
              <select
                value={batchPreset}
                onChange={(e) => setBatchPreset(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, background: "#f8fafc" }}
              >
                <option value="10">10 Leads</option>
                <option value="20">20 Leads</option>
                <option value="25">25 Leads</option>
                <option value="50">50 Leads (Recommended)</option>
                <option value="100">100 Leads</option>
                <option value="custom">Custom Limit...</option>
              </select>
              {batchPreset === "custom" && (
                <input
                  type="number"
                  placeholder="e.g. 300"
                  value={customBatchSize}
                  onChange={(e) => setCustomBatchSize(e.target.value)}
                  style={{ width: "100%", marginTop: 8, padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" }}
                />
              )}
            </div>

            {/* Range: From ID to To ID */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Lead ID Range (Optional):</label>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="number"
                  placeholder="From ID (e.g. 3056)"
                  value={startId}
                  onChange={(e) => setStartId(e.target.value)}
                  style={{ width: "50%", padding: "10px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
                />
                <span style={{ color: "#94a3b8" }}>&rarr;</span>
                <input
                  type="number"
                  placeholder="To ID (e.g. 3112)"
                  value={endId}
                  onChange={(e) => setEndId(e.target.value)}
                  style={{ width: "50%", padding: "10px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
              <span style={{ fontSize: 11, color: "#64748b" }}>Leave blank to automatically send to the next pending leads.</span>
            </div>

            {/* Delay between Emails */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Delay between Mails:</label>
              <select
                value={delayPreset}
                onChange={(e) => setDelayPreset(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, background: "#f8fafc" }}
              >
                <option value="2">2 seconds (Standard)</option>
                <option value="5">5 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute (Safe warmup)</option>
                <option value="300">5 minutes</option>
                <option value="900">15 minutes (Periodic)</option>
                <option value="custom">Custom Time Gap...</option>
              </select>
              {delayPreset === "custom" && (
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <input
                    type="number"
                    placeholder="e.g. 15"
                    value={customDelay}
                    onChange={(e) => setCustomDelay(e.target.value)}
                    style={{ width: "60%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14 }}
                  />
                  <select
                    value={delayUnit}
                    onChange={(e) => setDelayUnit(e.target.value)}
                    style={{ width: "40%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14 }}
                  >
                    <option value="sec">Seconds</option>
                    <option value="min">Minutes</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13, color: "#475569", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>Target: <strong>{activeLimit} Leads</strong> {startId && endId ? `(IDs: ${startId} to ${endId})` : ""}</div>
            <div>Gap: <strong>{activeDelaySec}s</strong> per email</div>
            <div>Est. Batch Duration: <strong style={{ color: "#2563eb" }}>~{estimatedTimeText()}</strong></div>
          </div>

          <button
            onClick={handleSendBatch}
            disabled={sendingBatch}
            style={{
              width: "100%",
              padding: 16,
              background: sendingBatch ? "#94a3b8" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 800,
              cursor: sendingBatch ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
            }}
          >
            {sendingBatch ? `⏳ Running Campaign Batch (${activeLimit} leads, please wait)...` : `🚀 Start Campaign Batch (${activeLimit} Leads)`}
          </button>

          {/* Batch Result Report */}
          {batchResult && (
            <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: batchResult.success ? "#f0fdf4" : "#fef2f2", border: `1px solid ${batchResult.success ? "#bbf7d0" : "#fecaca"}` }}>
              <div style={{ fontWeight: 700, color: batchResult.success ? "#166534" : "#991b1b", fontSize: 14 }}>
                {batchResult.success ? `✔ Campaign Completed! Successfully Sent: ${batchResult.sent} / ${batchResult.total} leads` : `❌ Error: ${batchResult.error}`}
              </div>
              {batchResult.results && batchResult.results.length > 0 && (
                <div style={{ marginTop: 12, maxHeight: 220, overflowY: "auto", fontSize: 12, color: "#334155" }}>
                  {batchResult.results.map((r, i) => (
                    <div key={i} style={{ padding: "4px 0", borderBottom: "1px dashed #e2e8f0", display: "flex", justifyContent: "space-between" }}>
                      <span>
                        {r.status === "sent" ? "✅" : "⚠️"} [ID {r.id}] {r.name} ({r.email})
                      </span>
                      <span style={{ fontWeight: 600, color: "#2563eb" }}>
                        Mail {r.slot} &bull; Template {r.template}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: 📥 Paste & Clean Raw Lead List */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px 0", color: "#0f172a" }}>📥 Paste Raw Email List &bull; Automatic Deduplication</h2>
          <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#64748b" }}>
            Paste any raw list of email IDs (e.g. from Excel, CSV, or text). The system will automatically extract emails, count them, eliminate duplicates, and check against Supabase.
          </p>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
              Paste Raw Emails / CSV Text:
            </label>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => { setRawText(e.target.value); setImportPreview(null); }}
              placeholder="Paste raw data here... e.g.&#10;rahul@gmail.com&#10;Priya Sharma, priya@yahoo.com, Java Developer&#10;amit@outlook.com, 9876543210"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
            <div style={{ minWidth: 200 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Default Job Role:</label>
              <input
                type="text"
                value={defaultRole}
                onChange={(e) => setDefaultRole(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
              />
            </div>
            <button
              onClick={handleCheckDuplicates}
              disabled={importing || !rawText.trim()}
              style={{
                marginTop: 18,
                padding: "10px 18px",
                background: "#f1f5f9",
                color: "#1e293b",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {importing ? "Scanning..." : "🔍 Scan & Check Duplicates"}
            </button>
          </div>

          {/* Import Preview Box */}
          {importPreview && (
            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 10 }}>📊 Scan Audit Report:</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
                <div style={{ background: "#fff", padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Total Found</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{importPreview.totalExtracted}</div>
                </div>
                <div style={{ background: "#fff", padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Duplicates in Paste</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#dc2626" }}>{importPreview.internalDuplicatesCount}</div>
                </div>
                <div style={{ background: "#fff", padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Already in DB</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#d97706" }}>{importPreview.alreadyInDbCount}</div>
                </div>
                <div style={{ background: "#ecfdf5", padding: 10, borderRadius: 6, border: "1px solid #a7f3d0" }}>
                  <div style={{ fontSize: 11, color: "#065f46" }}>New Clean Leads</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#059669" }}>{importPreview.newCleanCount}</div>
                </div>
              </div>

              {importPreview.newCleanCount > 0 ? (
                <button
                  onClick={handleSaveCleanLeads}
                  disabled={importing}
                  style={{
                    padding: "12px 24px",
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {importing ? "Saving..." : `💾 Save ${importPreview.newCleanCount} Clean Leads to Database`}
                </button>
              ) : (
                <div style={{ color: "#d97706", fontSize: 13, fontWeight: 600 }}>
                  ⚠️ All emails in this paste are duplicates or already present in your database!
                </div>
              )}
            </div>
          )}

          {importMessage && (
            <div style={{ padding: 12, borderRadius: 6, background: "#ecfdf5", color: "#065f46", fontSize: 13, fontWeight: 700 }}>
              {importMessage}
            </div>
          )}
        </div>

        {/* Section 3: 🧪 Test Email in Your Own Inbox */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px 0", color: "#0f172a" }}>🧪 Test Email in Your Own Inbox</h2>
          <p style={{ margin: "0 0 18px 0", fontSize: 13, color: "#64748b" }}>
            Verify how the natural human HR format looks in your Gmail Primary inbox right now.
          </p>

          <form onSubmit={handleSendTest}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Your Email Address:</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="e.g. hrishikeshmore225@gmail.com"
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Candidate Name:</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Target Job Role:</label>
                <input
                  type="text"
                  value={testRole}
                  onChange={(e) => setTestRole(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Template:</label>
                <select
                  value={testTemplate}
                  onChange={(e) => setTestTemplate(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, background: "#fff", boxSizing: "border-box" }}
                >
                  <option value="A">Template A (Initial Outreach - Human)</option>
                  <option value="B">Template B (Follow-up - Clean Text)</option>
                  <option value="C">Template C (Final Note - Invitation)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={sendingTest}
              style={{
                padding: "12px 24px",
                background: sendingTest ? "#94a3b8" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 700,
                cursor: sendingTest ? "not-allowed" : "pointer",
              }}
            >
              {sendingTest ? "Sending Test Email..." : "✉ Send Test Email to My Inbox"}
            </button>
          </form>

          {testResult && (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: testResult.success ? "#ecfdf5" : "#fef2f2", border: `1px solid ${testResult.success ? "#a7f3d0" : "#fecaca"}` }}>
              <div style={{ fontWeight: 700, color: testResult.success ? "#065f46" : "#991b1b", fontSize: 13 }}>
                {testResult.success ? `✔ ${testResult.message}` : `❌ Failed: ${testResult.error}`}
              </div>
              {testResult.subject && <div style={{ fontSize: 12, color: "#047857", marginTop: 4 }}>Subject: <strong>{testResult.subject}</strong></div>}
            </div>
          )}
        </div>

        {/* Section 4: 📋 Lead Database Live View */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0f172a" }}>📋 Database Leads &amp; Delivery Status</h2>
            <span style={{ fontSize: 12, color: "#64748b" }}>Showing recent 50 leads</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table width="100%" cellPadding={8} cellSpacing={0} style={{ borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "8px 10px" }}>ID</th>
                  <th style={{ padding: "8px 10px" }}>Name</th>
                  <th style={{ padding: "8px 10px" }}>Email</th>
                  <th style={{ padding: "8px 10px" }}>Job Role</th>
                  <th style={{ padding: "8px 10px" }}>Mail 1</th>
                  <th style={{ padding: "8px 10px" }}>Mail 2</th>
                  <th style={{ padding: "8px 10px" }}>Mail 3</th>
                </tr>
              </thead>
              <tbody>
                {leadsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>
                      No leads in database yet. Paste your email list in Section 2 above to import!
                    </td>
                  </tr>
                ) : (
                  leadsList.map((lead) => (
                    <tr key={lead.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: "#0f172a" }}>{lead.id}</td>
                      <td style={{ padding: "8px 10px", color: "#1e293b" }}>{lead.full_name || "--"}</td>
                      <td style={{ padding: "8px 10px", color: "#2563eb" }}>{lead.email}</td>
                      <td style={{ padding: "8px 10px", color: "#64748b" }}>{lead.job_role || "--"}</td>
                      <td style={{ padding: "8px 10px" }}>
                        {lead.mail_1_status ? (
                          <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                            {lead.mail_1_status}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>Pending</span>
                        )}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        {lead.mail_2_status ? (
                          <span style={{ background: "#f3e8ff", color: "#6b21a8", padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                            {lead.mail_2_status}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>--</span>
                        )}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        {lead.mail_3_status ? (
                          <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                            {lead.mail_3_status}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>--</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
