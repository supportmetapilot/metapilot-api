"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Campaign batch state
  const [mailSlot, setMailSlot] = useState(1);
  const [batchLimit, setBatchLimit] = useState(50);
  const [sendingBatch, setSendingBatch] = useState(false);
  const [batchResult, setBatchResult] = useState(null);

  // Test email state
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("Hrushikesh More");
  const [testRole, setTestRole] = useState("Senior Software Engineer");
  const [testTemplate, setTestTemplate] = useState("A");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const savedPin = localStorage.getItem("mp_admin_pin");
    if (savedPin === "metapilot2026") {
      setPin(savedPin);
      setIsAuthenticated(true);
      fetchStats();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin.trim() === "metapilot2026") {
      localStorage.setItem("mp_admin_pin", "metapilot2026");
      setIsAuthenticated(true);
      fetchStats();
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

  const handleSendBatch = async () => {
    const confirmSend = window.confirm(
      `Are you sure you want to send the next batch of ${batchLimit} emails for Mail Slot ${mailSlot}?`
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
          mailSlot: parseInt(mailSlot, 10),
          limit: parseInt(batchLimit, 10),
          key: "metapilot2026",
        }),
      });
      const data = await res.json();
      setBatchResult(data);
      fetchStats();
    } catch (err) {
      setBatchResult({ success: false, error: err.message });
    } finally {
      setSendingBatch(false);
    }
  };

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
              style={{ width: "100%", padding: 14, background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: "pointer" }}
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
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "#0f172a" }}>MetaPilot Marketing Hub</h1>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 14 }}>1-Click Campaign Automation &bull; Smart PLM Academy Card Design</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={fetchStats}
              disabled={loadingStats}
              style={{ padding: "8px 16px", background: "#e2e8f0", color: "#1e293b", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              {loadingStats ? "Refreshing..." : "🔄 Refresh Stats"}
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
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>in Supabase Database</div>
          </div>

          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#065f46", fontWeight: 700, textTransform: "uppercase" }}>Mail 1 (Initial)</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#047857", marginTop: 4 }}>{stats ? stats.mail1Sent : "--"}</div>
            <div style={{ fontSize: 12, color: "#059669", marginTop: 2 }}>Sent &bull; {stats ? stats.mail1Pending : "--"} Pending</div>
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

        {/* Section: 1-Click Campaign Batch Sender */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px 0", color: "#0f172a" }}>🚀 1-Click Campaign Batch Sender</h2>
          <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "#64748b" }}>
            Tap the button below to dispatch the next batch of marketing emails. Staff can do this directly from any phone or PC without touching any code.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Select Email Round:</label>
              <select
                value={mailSlot}
                onChange={(e) => setMailSlot(Number(e.target.value))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, background: "#f8fafc" }}
              >
                <option value={1}>Round 1: Initial Outreach (Mail 1)</option>
                <option value={2}>Round 2: Follow-up (Mail 2)</option>
                <option value={3}>Round 3: Final Briefing (Mail 3)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Batch Size (Limit):</label>
              <select
                value={batchLimit}
                onChange={(e) => setBatchLimit(Number(e.target.value))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, background: "#f8fafc" }}
              >
                <option value={10}>10 Emails (Quick test)</option>
                <option value={25}>25 Emails</option>
                <option value={50}>50 Emails (Recommended daily batch)</option>
                <option value={100}>100 Emails</option>
              </select>
            </div>
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
            {sendingBatch ? `⏳ Sending Next ${batchLimit} Emails (Please wait)...` : `🚀 Send Next ${batchLimit} Emails (Round ${mailSlot})`}
          </button>

          {/* Batch Result Report */}
          {batchResult && (
            <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: batchResult.success ? "#f0fdf4" : "#fef2f2", border: `1px solid ${batchResult.success ? "#bbf7d0" : "#fecaca"}` }}>
              <div style={{ fontWeight: 700, color: batchResult.success ? "#166534" : "#991b1b", fontSize: 14 }}>
                {batchResult.success ? `✔ Campaign Batch Completed! Sent: ${batchResult.sent} / ${batchResult.total}` : `❌ Error: ${batchResult.error}`}
              </div>
              {batchResult.results && batchResult.results.length > 0 && (
                <div style={{ marginTop: 10, maxHeight: 180, overflowY: "auto", fontSize: 12, color: "#334155" }}>
                  {batchResult.results.map((r, i) => (
                    <div key={i} style={{ padding: "3px 0", borderBottom: "1px dashed #e2e8f0" }}>
                      {r.status === "sent" ? "✅" : "⚠️"} {r.name} ({r.email}) &bull; Template {r.template} &bull; {r.status}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section: Send Test Email */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px 0", color: "#0f172a" }}>🧪 Test Email in Your Own Inbox</h2>
          <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "#64748b" }}>
            Verify how the new Smart PLM card format looks inside your Gmail or Outlook inbox right now.
          </p>

          <form onSubmit={handleSendTest}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Your Email Address:</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="e.g. hrishikesh@gmail.com"
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
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Template Version:</label>
                <select
                  value={testTemplate}
                  onChange={(e) => setTestTemplate(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, background: "#fff", boxSizing: "border-box" }}
                >
                  <option value="A">Template A (Overcoming Interview Pressure)</option>
                  <option value="B">Template B (Career Briefing &amp; Real-Time AI)</option>
                  <option value="C">Template C (Final Preparation Alert)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={sendingTest}
              style={{
                padding: "12px 24px",
                background: sendingTest ? "#94a3b8" : "#7c3aed",
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

        {/* Section: Mobile Bookmark & Supabase Helper */}
        <div style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px 0", color: "#334155" }}>📱 Mobile 1-Tap Shortcut (No login required)</h3>
          <p style={{ margin: "0 0 10px 0", fontSize: 12, color: "#64748b" }}>
            You can bookmark this direct URL on your phone's browser. Opening it automatically triggers the next batch:
          </p>
          <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#0f172a", fontFamily: "monospace", wordBreak: "break-all" }}>
            https://api.metapilot.in/api/send-mail?key=metapilot2026&amp;slot=1&amp;limit=50
          </div>
          <p style={{ margin: "14px 0 6px 0", fontSize: 12, color: "#64748b" }}>
            Or inside Supabase SQL Editor, run this single query:
          </p>
          <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#0f172a", fontFamily: "monospace" }}>
            SELECT net.http_post(url := 'https://api.metapilot.in/api/send-mail?key=metapilot2026&amp;slot=1&amp;limit=50');
          </div>
        </div>

      </div>
    </div>
  );
}
