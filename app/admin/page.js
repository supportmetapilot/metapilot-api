"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("campaign"); // "campaign", "leads", "import", "templates"

  // Live Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Campaign Batch Dispatcher
  const [batchPreset, setBatchPreset] = useState("50");
  const [customBatchSize, setCustomBatchSize] = useState("");
  const [startId, setStartId] = useState("");
  const [endId, setEndId] = useState("");
  const [delayPreset, setDelayPreset] = useState("2");
  const [customDelay, setCustomDelay] = useState("");
  const [delayUnit, setDelayUnit] = useState("sec");
  const [sendingBatch, setSendingBatch] = useState(false);
  const [batchResult, setBatchResult] = useState(null);

  // Multi-Campaign & Day Gaps State
  const [campaignName, setCampaignName] = useState("");
  const [followup1Days, setFollowup1Days] = useState("3");
  const [followup2Days, setFollowup2Days] = useState("7");
  const [campaignsList, setCampaignsList] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [viewingCampaignLog, setViewingCampaignLog] = useState(null);
  const [runningFollowup, setRunningFollowup] = useState(false);

  // Import Leads state
  const [rawText, setRawText] = useState("");
  const [defaultRole, setDefaultRole] = useState("Software Testing");
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importMessage, setImportMessage] = useState(null);

  // Leads List & Search
  const [leadsList, setLeadsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [clearingLeads, setClearingLeads] = useState(false);

  // Range delete state
  const [rangeFromId, setRangeFromId] = useState("");
  const [rangeToId, setRangeToId] = useState("");
  const [deletingRange, setDeletingRange] = useState(false);

  // Edit lead modal state
  const [editingLead, setEditingLead] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    job_role: "",
    years_of_experience: "",
    notice_period: "",
    mail_1_status: "",
    mail_2_status: "",
    mail_3_status: "",
  });
  const [savingLead, setSavingLead] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState(null);

  // Test Email state
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("Candidate Name");
  const [testRole, setTestRole] = useState("Software Testing");
  const [testTemplate, setTestTemplate] = useState("A");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Templates Content Editor
  const [templates, setTemplates] = useState(null);
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [templatesSavedMsg, setTemplatesSavedMsg] = useState(null);

  useEffect(() => {
    const savedPin = localStorage.getItem("mp_admin_pin");
    if (savedPin === "metapilot2026") {
      setPin(savedPin);
      setIsAuthenticated(true);
      fetchStats();
      fetchLeads();
      fetchTemplates();
      fetchCampaigns();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin.trim() === "metapilot2026") {
      localStorage.setItem("mp_admin_pin", "metapilot2026");
      setIsAuthenticated(true);
      fetchStats();
      fetchLeads();
      fetchTemplates();
      fetchCampaigns();
    } else {
      alert("Invalid PIN. Please enter the correct MetaPilot Admin PIN.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("mp_admin_pin");
    setIsAuthenticated(false);
    setPin("");
  };

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const res = await fetch("/api/campaigns?key=metapilot2026");
      const data = await res.json();
      if (data.success) {
        setCampaignsList(data.campaigns || []);
      }
    } catch (err) {
      console.error("Failed to load campaigns", err);
    } finally {
      setLoadingCampaigns(false);
    }
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
      const res = await fetch("/api/leads?limit=300&offset=0");
      const data = await res.json();
      if (data.success) {
        setLeadsList(data.leads || []);
      }
    } catch (err) {
      console.error("Failed to load leads", err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error("Failed to load templates", err);
    }
  };

  const handleSaveTemplates = async (e) => {
    e.preventDefault();
    setSavingTemplates(true);
    setTemplatesSavedMsg(null);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templates, key: "metapilot2026" }),
      });
      const data = await res.json();
      if (data.success) {
        setTemplatesSavedMsg("✔ Templates saved successfully to database!");
      } else {
        alert(data.error || "Failed to save");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSavingTemplates(false);
    }
  };

  const handleClearAllLeads = async () => {
    const confirmWipe = window.confirm(
      "⚠️ WARNING: This will permanently delete all leads from the database so you can re-import cleanly.\n\nAre you sure you want to delete all leads?"
    );
    if (!confirmWipe) return;

    setClearingLeads(true);
    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all" }),
      });
      const data = await res.json();
      if (data.success) {
        alert("All leads have been cleared. You can now re-import freshly.");
        fetchStats();
        fetchLeads();
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setClearingLeads(false);
    }
  };

  const handleDeleteRange = async () => {
    if (!rangeFromId || !rangeToId) {
      alert("Please enter both From ID and To ID.");
      return;
    }
    const from = parseInt(rangeFromId, 10);
    const to = parseInt(rangeToId, 10);
    if (isNaN(from) || isNaN(to) || from > to) {
      alert("Please enter valid ID numbers (From ID must be less than or equal to To ID).");
      return;
    }
    const confirmDelete = window.confirm(
      `⚠️ WARNING: Are you sure you want to delete leads from ID ${from} to ${to}?\n\nThis will permanently delete those records from the database.`
    );
    if (!confirmDelete) return;

    setDeletingRange(true);
    try {
      const res = await fetch(`/api/leads?fromId=${from}&toId=${to}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert(`✔ ${data.message || `Leads from ID ${from} to ${to} deleted successfully.`}`);
        setRangeFromId("");
        setRangeToId("");
        fetchStats();
        fetchLeads();
      } else {
        alert(data.error || "Failed to delete leads range.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setDeletingRange(false);
    }
  };

  const handleDeleteSingle = async (leadId, leadName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete lead ID ${leadId} (${leadName || "Unnamed"}) from the database?`
    );
    if (!confirmDelete) return;

    setDeletingLeadId(leadId);
    try {
      const res = await fetch(`/api/leads?id=${leadId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setLeadsList((prev) => prev.filter((l) => l.id !== leadId));
        fetchStats();
      } else {
        alert(data.error || "Failed to delete lead.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setDeletingLeadId(null);
    }
  };

  const handleStartEdit = (lead) => {
    setEditingLead(lead);
    setEditForm({
      full_name: lead.full_name || "",
      email: lead.email || "",
      mobile: lead.mobile || "",
      job_role: lead.job_role || "",
      years_of_experience: lead.years_of_experience || "",
      notice_period: lead.notice_period || "",
      mail_1_status: lead.mail_1_status || "",
      mail_2_status: lead.mail_2_status || "",
      mail_3_status: lead.mail_3_status || "",
    });
  };

  const handleSaveLeadEdit = async (e) => {
    if (e) e.preventDefault();
    if (!editingLead) return;

    setSavingLead(true);
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingLead.id,
          updates: {
            full_name: editForm.full_name,
            email: editForm.email,
            mobile: editForm.mobile,
            job_role: editForm.job_role,
            years_of_experience: editForm.years_of_experience,
            notice_period: editForm.notice_period,
            mail_1_status: editForm.mail_1_status || null,
            mail_2_status: editForm.mail_2_status || null,
            mail_3_status: editForm.mail_3_status || null,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLeadsList((prev) =>
          prev.map((l) => (l.id === editingLead.id ? { ...l, ...data.lead } : l))
        );
        fetchStats();
        setEditingLead(null);
        alert(`✔ Lead ID ${editingLead.id} updated in database successfully!`);
      } else {
        alert(data.error || "Failed to update lead.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSavingLead(false);
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

  // Run campaign batch with custom sequence gaps and campaign tracking
  const handleLaunchCampaign = async () => {
    const rangeMsg = startId && endId ? ` for Lead ID range ${startId} to ${endId}` : ` for next ${activeLimit} leads`;
    const f1 = followup1Days ? parseInt(followup1Days, 10) : 3;
    const f2 = followup2Days ? parseInt(followup2Days, 10) : 7;
    const confirmSend = window.confirm(
      `Start outreach campaign "${campaignName || "Campaign #" + Date.now().toString().slice(-4)}"${rangeMsg}?\n\nSchedule:\n• Mail 1: Today (Day 0, round-robin A→B→C)\n• Mail 2: After ${f1} days\n• Mail 3: After ${f2} days\n• Delay between leads: ${activeDelaySec}s\n\nEstimated batch duration: ~${estimatedTimeText()}`
    );
    if (!confirmSend) return;

    setSendingBatch(true);
    setBatchResult(null);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName || undefined,
          limit: activeLimit,
          startId: startId ? parseInt(startId, 10) : null,
          endId: endId ? parseInt(endId, 10) : null,
          delaySec: activeDelaySec,
          followup1Days: f1,
          followup2Days: f2,
          key: "metapilot2026",
        }),
      });
      const data = await res.json();
      setBatchResult(data);
      if (data.success) {
        setCampaignName("");
      }
      fetchStats();
      fetchLeads();
      fetchCampaigns();
    } catch (err) {
      setBatchResult({ success: false, error: err.message });
    } finally {
      setSendingBatch(false);
    }
  };

  const handleSendBatch = handleLaunchCampaign;

  const handleRunFollowupNow = async () => {
    const confirmRun = window.confirm(
      "Run Follow-up sequence check right now?\n\nThe system will inspect all active campaigns and dispatch Mail 2 or Mail 3 to leads whose day-gap intervals have elapsed."
    );
    if (!confirmRun) return;

    setRunningFollowup(true);
    try {
      const res = await fetch("/api/cron/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "metapilot2026" }),
      });
      const data = await res.json();
      if (data.success) {
        alert(
          `✔ Follow-up Sequence Check Completed!\n• Mail 2 sent: ${data.results?.mail2Sent || 0}\n• Mail 3 sent: ${data.results?.mail3Sent || 0}`
        );
        fetchStats();
        fetchLeads();
        fetchCampaigns();
      } else {
        alert(data.error || "Follow-up execution failed.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setRunningFollowup(false);
    }
  };

  const handleDeleteCampaign = async (id, name) => {
    const confirmDel = window.confirm(
      `Remove campaign "${name || id}" from history? (Lead email statuses in database will remain unchanged)`
    );
    if (!confirmDel) return;

    try {
      const res = await fetch(`/api/campaigns?id=${id}&key=metapilot2026`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCampaignsList((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert(data.error || "Failed to remove campaign");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Preview & Duplicate Check for Raw Lead Paste
  const handleCheckDuplicates = async () => {
    if (!rawText.trim()) {
      alert("Please paste your raw Excel or TSV data first.");
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
        setImportMessage(`✔ ${data.message} (${data.skippedDuplicates || 0} duplicates avoided)`);
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
      alert("Please enter your email address.");
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

  // WhatsApp Link Generator
  const openWhatsApp = (lead, draftNumber = 1) => {
    if (!lead.mobile) {
      alert("No mobile number recorded for " + lead.full_name);
      return;
    }

    const cleanNum = lead.mobile.replace(/\D/g, "");
    const formattedNum = cleanNum.startsWith("91") && cleanNum.length === 12 ? cleanNum : cleanNum.length === 10 ? "91" + cleanNum : cleanNum;

    const rawTemplate =
      draftNumber === 1
        ? (templates?.wa_draft_1 || "Hi {{fullName}}, I noticed you are exploring opportunities in {{jobRole}}...")
        : draftNumber === 2
        ? (templates?.wa_draft_2 || "Hi {{fullName}}, Still giving interviews the hard way?...")
        : (templates?.wa_draft_3 || "Hi {{fullName}}, Quick check regarding your {{jobRole}} interview prep!...");

    const personalized = rawTemplate
      .replace(/{{fullName}}/g, lead.full_name || "there")
      .replace(/{{jobRole}}/g, lead.job_role || "Software");

    const waUrl = `https://wa.me/${formattedNum}?text=${encodeURIComponent(personalized)}`;
    window.open(waUrl, "_blank");
  };

  // Filter leads by search query
  const filteredLeads = leadsList.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      (l.full_name && l.full_name.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.job_role && l.job_role.toLowerCase().includes(q)) ||
      (l.mobile && l.mobile.includes(q)) ||
      String(l.id).includes(q)
    );
  });

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
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", padding: "20px 14px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a" }}>MetaPilot Outreach &amp; CRM Hub</h1>
            <p style={{ margin: "3px 0 0 0", color: "#64748b", fontSize: 13 }}>
              Natural HR 1-on-1 Deliverability &bull; Smart Cyclic Rotation A &rarr; B &rarr; C &bull; 1-Click WhatsApp
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { fetchStats(); fetchLeads(); }}
              disabled={loadingStats}
              style={{ padding: "8px 14px", background: "#e2e8f0", color: "#1e293b", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer" }}
            >
              {loadingStats ? "Refreshing..." : "🔄 Refresh"}
            </button>
            <button
              onClick={handleLogout}
              style={{ padding: "8px 14px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer" }}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: 8, borderBottom: "2px solid #e2e8f0", marginBottom: 20, overflowX: "auto" }}>
          <button
            onClick={() => setActiveTab("campaign")}
            style={{
              padding: "10px 18px",
              background: activeTab === "campaign" ? "#2563eb" : "transparent",
              color: activeTab === "campaign" ? "#fff" : "#475569",
              border: "none",
              borderRadius: "8px 8px 0 0",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            🚀 Outreach Campaigns
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            style={{
              padding: "10px 18px",
              background: activeTab === "leads" ? "#2563eb" : "transparent",
              color: activeTab === "leads" ? "#fff" : "#475569",
              border: "none",
              borderRadius: "8px 8px 0 0",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            📋 Leads &amp; 💬 WhatsApp ({leadsList.length})
          </button>
          <button
            onClick={() => setActiveTab("import")}
            style={{
              padding: "10px 18px",
              background: activeTab === "import" ? "#2563eb" : "transparent",
              color: activeTab === "import" ? "#fff" : "#475569",
              border: "none",
              borderRadius: "8px 8px 0 0",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            📥 Import &amp; Deduplicate Leads
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            style={{
              padding: "10px 18px",
              background: activeTab === "templates" ? "#2563eb" : "transparent",
              color: activeTab === "templates" ? "#fff" : "#475569",
              border: "none",
              borderRadius: "8px 8px 0 0",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            📝 Content &amp; Templates Editor
          </button>
        </div>

        {/* Live Stats Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 20 }}>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Leads</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{stats ? stats.totalLeads : "--"}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>IDs: {stats?.minLeadId || 1} to {stats?.maxLeadId || "--"}</div>
          </div>

          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: "#065f46", fontWeight: 700, textTransform: "uppercase" }}>Mail 1 (Initial)</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#047857", marginTop: 2 }}>{stats ? stats.mail1Sent : "--"}</div>
            <div style={{ fontSize: 11, color: "#059669", marginTop: 2 }}>Sent &bull; {stats ? stats.mail1Pending : "--"} Pending</div>
          </div>

          <div style={{ background: "#faf5ff", border: "1px solid #d8b4fe", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: "#6d28d9", fontWeight: 700, textTransform: "uppercase" }}>Mail 2 (Follow-up)</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#7c3aed", marginTop: 2 }}>{stats ? stats.mail2Sent : "--"}</div>
            <div style={{ fontSize: 11, color: "#8b5cf6", marginTop: 2 }}>Sent &bull; {stats ? stats.mail2Pending : "--"} Ready</div>
          </div>

          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700, textTransform: "uppercase" }}>Mail 3 (Final Call)</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#b45309", marginTop: 2 }}>{stats ? stats.mail3Sent : "--"}</div>
            <div style={{ fontSize: 11, color: "#d97706", marginTop: 2 }}>Sent &bull; {stats ? stats.mail3Pending : "--"} Ready</div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* TAB 1: 🚀 OUTREACH CAMPAIGNS */}
        {/* =================================================================== */}
        {activeTab === "campaign" && (
          <div>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0f172a" }}>🚀 1-Click Campaign Dispatcher</h2>
                <span style={{ fontSize: 12, padding: "4px 8px", background: "#ecfdf5", color: "#065f46", borderRadius: 4, fontWeight: 700 }}>
                  Auto Shuffling: 1st=A, 2nd=B, 3rd=C, 4th=A...
                </span>
              </div>
              <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "#64748b" }}>
                The system automatically rotates templates (A &rarr; B &rarr; C) across leads for Mail 1, and follows the strict cyclic follow-up rotation (A &rarr; B &rarr; C &rarr; A).
              </p>

              {/* Campaign Name Identifier */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Campaign Name / Label (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pune Software Testing Batch 1 (Apr 2026)"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box", background: "#f8fafc" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 18 }}>
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
                      placeholder="Type custom number (e.g. 300)"
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
                      placeholder="From (e.g. 153)"
                      value={startId}
                      onChange={(e) => setStartId(e.target.value)}
                      style={{ width: "50%", padding: "10px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
                    />
                    <span style={{ color: "#94a3b8" }}>&rarr;</span>
                    <input
                      type="number"
                      placeholder="To (e.g. 174)"
                      value={endId}
                      onChange={(e) => setEndId(e.target.value)}
                      style={{ width: "50%", padding: "10px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Leave blank to automatically send to the next pending leads.</span>
                </div>

                {/* Delay between Emails */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Delay between Leads:</label>
                  <select
                    value={delayPreset}
                    onChange={(e) => setDelayPreset(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, background: "#f8fafc" }}
                  >
                    <option value="2">2 seconds (Fast)</option>
                    <option value="5">5 seconds</option>
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute (Safe)</option>
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

              {/* Follow-up Sequence Schedule: Custom Day Gaps */}
              <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 10, marginBottom: 18, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#1e293b" }}>
                    ⏳ Follow-up Sequence Schedule (Custom Day Gaps)
                  </span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    Default: 0 days (Mail 1), 3 days (Mail 2), 7 days (Mail 3)
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Mail 1 &rarr; Mail 2 Gap:
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={followup1Days}
                        onChange={(e) => setFollowup1Days(e.target.value)}
                        placeholder="3"
                        style={{ width: 80, padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, fontWeight: 700, textAlign: "center", background: "#fff" }}
                      />
                      <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>Days</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>(Default: 3)</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Mail 2 &rarr; Mail 3 Gap:
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={followup2Days}
                        onChange={(e) => setFollowup2Days(e.target.value)}
                        placeholder="7"
                        style={{ width: 80, padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, fontWeight: 700, textAlign: "center", background: "#fff" }}
                      />
                      <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>Days</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>(Default: 7)</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>
                  💡 Mail 1 today round-robin A &rarr; B &rarr; C ne dispatch hoil. Mail 2 he {followup1Days || 3} diwsanantr jail, ani Mail 3 he pudhchya {followup2Days || 7} diwsanantr jail.
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13, color: "#475569", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>Target: <strong>{activeLimit} Leads</strong> {startId && endId ? `(IDs: ${startId} to ${endId})` : ""}</div>
                <div>Delay: <strong>{activeDelaySec}s</strong> gap</div>
                <div>Schedule: <strong>M1: Day 0 &bull; M2: +{followup1Days || 3}d &bull; M3: +{followup2Days || 7}d</strong></div>
                <div>Est. Time: <strong style={{ color: "#2563eb" }}>~{estimatedTimeText()}</strong></div>
              </div>

              <button
                onClick={handleLaunchCampaign}
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
                {sendingBatch
                  ? `⏳ Running Campaign Batch (${activeLimit} leads, please wait)...`
                  : `🚀 Launch Campaign Batch (${activeLimit} Leads)`}
              </button>

              {/* Batch Result Report */}
              {batchResult && (
                <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: batchResult.success ? "#f0fdf4" : "#fef2f2", border: `1px solid ${batchResult.success ? "#bbf7d0" : "#fecaca"}` }}>
                  <div style={{ fontWeight: 700, color: batchResult.success ? "#166534" : "#991b1b", fontSize: 14 }}>
                    {batchResult.success ? `✔ Campaign Launched! Successfully Sent: ${batchResult.sent} / ${batchResult.total} leads` : `❌ Error: ${batchResult.error}`}
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

            {/* Campaigns History & Live Tracking */}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0f172a" }}>📊 Active &amp; Past Outreach Campaigns ({campaignsList.length})</h2>
                  <p style={{ margin: "3px 0 0 0", fontSize: 12, color: "#64748b" }}>
                    Multiple campaigns run independently. Check progress, lead ranges, and dispatch logs.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleRunFollowupNow}
                    disabled={runningFollowup}
                    style={{
                      padding: "8px 14px",
                      background: runningFollowup ? "#94a3b8" : "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: runningFollowup ? "not-allowed" : "pointer",
                      boxShadow: "0 2px 6px rgba(16,185,129,0.2)"
                    }}
                  >
                    {runningFollowup ? "⏳ Checking..." : "⚡ Run Follow-up Check Now"}
                  </button>
                  <button
                    onClick={fetchCampaigns}
                    disabled={loadingCampaigns}
                    style={{
                      padding: "8px 14px",
                      background: "#f1f5f9",
                      color: "#334155",
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer"
                    }}
                  >
                    {loadingCampaigns ? "Loading..." : "🔄 Refresh"}
                  </button>
                </div>
              </div>

              {campaignsList.length === 0 ? (
                <div style={{ padding: "30px 20px", textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
                  No campaigns launched yet. Create and dispatch your first campaign using the form above!
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "10px 12px", color: "#475569" }}>Campaign</th>
                        <th style={{ padding: "10px 12px", color: "#475569" }}>Lead Range</th>
                        <th style={{ padding: "10px 12px", color: "#475569" }}>Schedule &amp; Delay</th>
                        <th style={{ padding: "10px 12px", color: "#475569" }}>Live Progress</th>
                        <th style={{ padding: "10px 12px", color: "#475569" }}>Status</th>
                        <th style={{ padding: "10px 12px", color: "#475569", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignsList.map((c) => (
                        <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px 12px" }}>
                            <div style={{ fontWeight: 700, color: "#0f172a" }}>{c.name || `Campaign #${c.id}`}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(c.created_at || c.start_time).toLocaleString()}</div>
                          </td>
                          <td style={{ padding: "12px 12px" }}>
                            <div style={{ fontWeight: 600, color: "#334155" }}>
                              {c.start_id && c.end_id ? `IDs: ${c.start_id} to ${c.end_id}` : `${c.leads_limit || c.total_leads || "--"} Leads`}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                              Total target: {c.total_leads || c.leads_limit || 0}
                            </div>
                          </td>
                          <td style={{ padding: "12px 12px" }}>
                            <div style={{ fontSize: 12, color: "#334155" }}>
                              Gap: <strong>{c.gap_seconds || 2}s</strong> / lead
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                              M1: 0d &bull; M2: +{c.followup_1_days || 3}d &bull; M3: +{c.followup_2_days || 7}d
                            </div>
                          </td>
                          <td style={{ padding: "12px 12px" }}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 11, padding: "2px 6px", background: "#ecfdf5", color: "#065f46", borderRadius: 4, fontWeight: 700 }}>
                                M1: {c.m1_sent ?? (c.processed_count || 0)}
                              </span>
                              <span style={{ fontSize: 11, padding: "2px 6px", background: "#faf5ff", color: "#6d28d9", borderRadius: 4, fontWeight: 700 }}>
                                M2: {c.m2_sent ?? 0}
                              </span>
                              <span style={{ fontSize: 11, padding: "2px 6px", background: "#fffbeb", color: "#92400e", borderRadius: 4, fontWeight: 700 }}>
                                M3: {c.m3_sent ?? 0}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 12px" }}>
                            <span style={{
                              fontSize: 11,
                              padding: "3px 8px",
                              borderRadius: 12,
                              fontWeight: 700,
                              background: c.status === "completed" ? "#ecfdf5" : "#eff6ff",
                              color: c.status === "completed" ? "#065f46" : "#1e40af",
                            }}>
                              {c.status || "active"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 12px", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: 6 }}>
                              {c.results && c.results.length > 0 && (
                                <button
                                  onClick={() => setViewingCampaignLog(c)}
                                  style={{ padding: "4px 8px", background: "#f1f5f9", color: "#1e293b", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                                  title="View dispatch details"
                                >
                                  📋 Logs
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteCampaign(c.id, c.name)}
                                style={{ padding: "4px 8px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                                title="Remove from history"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Test Email Box */}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px 0", color: "#0f172a" }}>🧪 Test Email in Your Own Inbox</h2>
              <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#64748b" }}>
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
                      <option value="A">Template A (Real-Time Voice & Pressure Angle)</option>
                      <option value="B">Template B (Technical Screening & Problem Solving Angle)</option>
                      <option value="C">Template C (Interview Confidence & Structuring Angle)</option>
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
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: 📋 LEADS & 💬 WHATSAPP */}
        {/* =================================================================== */}
        {activeTab === "leads" && (
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0f172a" }}>📋 Database Leads &amp; Direct WhatsApp</h2>
                  <p style={{ margin: "3px 0 0 0", fontSize: 12, color: "#64748b" }}>
                    Edit any lead, trigger WhatsApp messages, or delete individual/range of leads directly without SQL queries.
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  {/* Range Delete Controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff1f2", padding: "6px 10px", borderRadius: 8, border: "1px solid #fecdd3" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#be123c" }}>🗑️ Delete Range:</span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>From</span>
                    <input
                      type="number"
                      placeholder="ID"
                      value={rangeFromId}
                      onChange={(e) => setRangeFromId(e.target.value)}
                      style={{ width: 68, padding: "5px 6px", borderRadius: 4, border: "1px solid #cbd5e1", fontSize: 12, textAlign: "center" }}
                    />
                    <span style={{ fontSize: 11, color: "#64748b" }}>To</span>
                    <input
                      type="number"
                      placeholder="ID"
                      value={rangeToId}
                      onChange={(e) => setRangeToId(e.target.value)}
                      style={{ width: 68, padding: "5px 6px", borderRadius: 4, border: "1px solid #cbd5e1", fontSize: 12, textAlign: "center" }}
                    />
                    <button
                      onClick={handleDeleteRange}
                      disabled={deletingRange || !rangeFromId || !rangeToId}
                      style={{
                        padding: "5px 10px",
                        background: deletingRange || !rangeFromId || !rangeToId ? "#cbd5e1" : "#e11d48",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: deletingRange || !rangeFromId || !rangeToId ? "not-allowed" : "pointer",
                      }}
                    >
                      {deletingRange ? "Deleting..." : "Clear Range"}
                    </button>
                  </div>

                  {/* Clear All Leads Button */}
                  <button
                    onClick={handleClearAllLeads}
                    disabled={clearingLeads}
                    style={{
                      padding: "8px 12px",
                      background: "#fef2f2",
                      color: "#b91c1c",
                      border: "1px solid #fecaca",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {clearingLeads ? "Clearing..." : "⚠️ Clear All Leads"}
                  </button>
                </div>
              </div>

              {/* Search bar & count */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <input
                  type="text"
                  placeholder="🔍 Search name, email, role, phone, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, minWidth: 280 }}
                />
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                  Showing {filteredLeads.length} of {leadsList.length} leads
                </span>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table width="100%" cellPadding={8} cellSpacing={0} style={{ borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "8px 10px" }}>ID</th>
                    <th style={{ padding: "8px 10px" }}>Candidate Name</th>
                    <th style={{ padding: "8px 10px" }}>Email</th>
                    <th style={{ padding: "8px 10px" }}>Mobile &amp; WhatsApp</th>
                    <th style={{ padding: "8px 10px" }}>Job Role</th>
                    <th style={{ padding: "8px 10px" }}>Exp / Notice</th>
                    <th style={{ padding: "8px 10px" }}>Mail 1</th>
                    <th style={{ padding: "8px 10px" }}>Mail 2</th>
                    <th style={{ padding: "8px 10px" }}>Mail 3</th>
                    <th style={{ padding: "8px 10px", textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
                        {searchQuery ? "No matching leads found." : "No leads in database yet. Go to 'Import Leads' tab above to import your sheet data!"}
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px 10px", fontWeight: 700, color: "#0f172a" }}>{lead.id}</td>
                        <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1e293b" }}>{lead.full_name || "--"}</td>
                        <td style={{ padding: "8px 10px", color: "#2563eb" }}>{lead.email}</td>
                        <td style={{ padding: "8px 10px" }}>
                          {lead.mobile ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontFamily: "monospace", fontSize: 12 }}>{lead.mobile}</span>
                              <div style={{ display: "inline-flex", gap: 3 }}>
                                <button
                                  onClick={() => openWhatsApp(lead, 1)}
                                  title="Send WhatsApp Draft 1"
                                  style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                                >
                                  💬 D1
                                </button>
                                <button
                                  onClick={() => openWhatsApp(lead, 2)}
                                  title="Send WhatsApp Draft 2"
                                  style={{ background: "#128C7E", color: "#fff", border: "none", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                                >
                                  D2
                                </button>
                                <button
                                  onClick={() => openWhatsApp(lead, 3)}
                                  title="Send WhatsApp Draft 3"
                                  style={{ background: "#075E54", color: "#fff", border: "none", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                                >
                                  D3
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: 11 }}>No Mobile</span>
                          )}
                        </td>
                        <td style={{ padding: "8px 10px", color: "#0f172a", fontWeight: 500 }}>{lead.job_role || "--"}</td>
                        <td style={{ padding: "8px 10px", color: "#64748b", fontSize: 12 }}>
                          {lead.years_of_experience || ""} {lead.notice_period ? `(${lead.notice_period})` : ""}
                        </td>
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
                        <td style={{ padding: "8px 10px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                            <button
                              onClick={() => handleStartEdit(lead)}
                              title="Edit Lead Details"
                              style={{
                                padding: "4px 8px",
                                background: "#eff6ff",
                                color: "#1d4ed8",
                                border: "1px solid #bfdbfe",
                                borderRadius: 5,
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSingle(lead.id, lead.full_name)}
                              disabled={deletingLeadId === lead.id}
                              title="Delete this Lead"
                              style={{
                                padding: "4px 7px",
                                background: "#fff1f2",
                                color: "#e11d48",
                                border: "1px solid #fecdd3",
                                borderRadius: 5,
                                fontSize: 12,
                                cursor: "pointer",
                              }}
                            >
                              {deletingLeadId === lead.id ? "..." : "🗑️"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: 📥 IMPORT & DEDUPLICATE LEADS */}
        {/* =================================================================== */}
        {activeTab === "import" && (
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px 0", color: "#0f172a" }}>📥 Paste Excel / TSV / Sheet Data &bull; Smart Header Detection</h2>
            <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#64748b" }}>
              Copy directly from Google Sheets or Excel (including headers like <code>Full_Name</code>, <code>Email_ID</code>, <code>Mobile_Number</code>, <code>Job_Role</code>) and paste below. The system maps each column accurately and eliminates duplicates.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                Paste Sheet or Raw Data Here:
              </label>
              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => { setRawText(e.target.value); setImportPreview(null); }}
                placeholder="Lead_ID	Full_Name	Email_ID	Mobile_Number	Job_Role	Years_of_Experience	Notice_Period&#10;1	Vaishnavi Borkar	vaishnaviborkar03@gmail.com	919130972967	Software Testing	4y 5m	15 Days or less"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
              <div style={{ minWidth: 200 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>Default Job Role (if missing in data):</label>
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
                  padding: "10px 20px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {importing ? "Analyzing Columns..." : "🔍 Scan & Check Duplicates"}
              </button>
            </div>

            {/* Import Preview Box */}
            {importPreview && (
              <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 10 }}>📊 Scan Audit Report:</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
                  <div style={{ background: "#fff", padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Total Detected</div>
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
                    <div style={{ fontSize: 11, color: "#065f46" }}>Clean New Leads</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#059669" }}>{importPreview.newCleanCount}</div>
                  </div>
                </div>

                {importPreview.sampleNew && importPreview.sampleNew.length > 0 && (
                  <div style={{ marginBottom: 14, fontSize: 12, color: "#475569" }}>
                    <strong>Sample parsed entry:</strong><br />
                    Name: <code>{importPreview.sampleNew[0].full_name}</code> &bull; Email: <code>{importPreview.sampleNew[0].email}</code> &bull; Mobile: <code>{importPreview.sampleNew[0].mobile}</code> &bull; Role: <code>{importPreview.sampleNew[0].job_role}</code>
                  </div>
                )}

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
                    ⚠️ All emails in this paste are duplicates or already present in your database! (If you want to replace corrupted test data, use "Clear All Leads" under Leads tab).
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
        )}

        {/* =================================================================== */}
        {/* TAB 4: 📝 TEMPLATES & CONTENT EDITOR */}
        {/* =================================================================== */}
        {activeTab === "templates" && (
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0f172a" }}>📝 Outreach &amp; WhatsApp Templates Editor</h2>
                <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
                  Customize your 3 Email Templates and 3 WhatsApp Drafts. Use <code>{"{{fullName}}"}</code> and <code>{"{{jobRole}}"}</code> for automatic personalization!
                </p>
              </div>
              <button
                onClick={handleSaveTemplates}
                disabled={savingTemplates || !templates}
                style={{
                  padding: "10px 20px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {savingTemplates ? "Saving..." : "💾 Save All Templates"}
              </button>
            </div>

            {templatesSavedMsg && (
              <div style={{ padding: 10, borderRadius: 6, background: "#ecfdf5", color: "#065f46", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
                {templatesSavedMsg}
              </div>
            )}

            {templates ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Email Template A */}
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px 0", color: "#1e293b" }}>✉️ Email Template A (Real-Time Voice &amp; Pressure Angle)</h3>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}>Subject:</label>
                  <input
                    type="text"
                    value={templates.email_a_subject}
                    onChange={(e) => setTemplates({ ...templates, email_a_subject: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }}
                  />
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}>Email Body:</label>
                  <textarea
                    rows={6}
                    value={templates.email_a_body}
                    onChange={(e) => setTemplates({ ...templates, email_a_body: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "sans-serif", boxSizing: "border-box" }}
                  />
                </div>

                {/* Email Template B */}
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px 0", color: "#1e293b" }}>✉️ Email Template B (Technical Screening &amp; Problem Solving Angle)</h3>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}>Subject:</label>
                  <input
                    type="text"
                    value={templates.email_b_subject}
                    onChange={(e) => setTemplates({ ...templates, email_b_subject: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }}
                  />
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}>Email Body:</label>
                  <textarea
                    rows={6}
                    value={templates.email_b_body}
                    onChange={(e) => setTemplates({ ...templates, email_b_body: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "sans-serif", boxSizing: "border-box" }}
                  />
                </div>

                {/* Email Template C */}
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px 0", color: "#1e293b" }}>✉️ Email Template C (Interview Confidence &amp; Structuring Angle)</h3>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}>Subject:</label>
                  <input
                    type="text"
                    value={templates.email_c_subject}
                    onChange={(e) => setTemplates({ ...templates, email_c_subject: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }}
                  />
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}>Email Body:</label>
                  <textarea
                    rows={6}
                    value={templates.email_c_body}
                    onChange={(e) => setTemplates({ ...templates, email_c_body: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "sans-serif", boxSizing: "border-box" }}
                  />
                </div>

                {/* WhatsApp Draft 1 */}
                <div style={{ background: "#f0fdf4", padding: 16, borderRadius: 8, border: "1px solid #bbf7d0" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px 0", color: "#166534" }}>💬 WhatsApp Draft 1 (Features &amp; Demo Focus)</h3>
                  <textarea
                    rows={8}
                    value={templates.wa_draft_1}
                    onChange={(e) => setTemplates({ ...templates, wa_draft_1: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "sans-serif", boxSizing: "border-box" }}
                  />
                </div>

                {/* WhatsApp Draft 2 */}
                <div style={{ background: "#f0fdf4", padding: 16, borderRadius: 8, border: "1px solid #bbf7d0" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px 0", color: "#166534" }}>💬 WhatsApp Draft 2 (Still Giving Interviews the Hard Way?)</h3>
                  <textarea
                    rows={8}
                    value={templates.wa_draft_2}
                    onChange={(e) => setTemplates({ ...templates, wa_draft_2: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "sans-serif", boxSizing: "border-box" }}
                  />
                </div>

                {/* WhatsApp Draft 3 */}
                <div style={{ background: "#f0fdf4", padding: 16, borderRadius: 8, border: "1px solid #bbf7d0" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px 0", color: "#166534" }}>💬 WhatsApp Draft 3 (Quick Check &amp; Pass)</h3>
                  <textarea
                    rows={6}
                    value={templates.wa_draft_3}
                    onChange={(e) => setTemplates({ ...templates, wa_draft_3: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "sans-serif", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            ) : (
              <div>Loading templates...</div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL: ✏️ EDIT LEAD (Direct Supabase Sync) */}
        {/* =================================================================== */}
        {editingLead && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 16,
            }}
            onClick={() => !savingLead && setEditingLead(null)}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: 16,
                width: "100%",
                maxWidth: 560,
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                padding: 24,
                border: "1px solid #e2e8f0",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0f172a" }}>
                    ✏️ Edit Lead (ID: #{editingLead.id})
                  </h3>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    Directly updates Supabase database &bull; No SQL query needed
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => !savingLead && setEditingLead(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 20,
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveLeadEdit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  {/* Full Name */}
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Candidate Full Name:
                    </label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      required
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Email Address:
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Mobile (WhatsApp):
                    </label>
                    <input
                      type="text"
                      value={editForm.mobile}
                      onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                      placeholder="e.g. 919890912747"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Job Role */}
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Target Job Role:
                    </label>
                    <input
                      type="text"
                      value={editForm.job_role}
                      onChange={(e) => setEditForm({ ...editForm, job_role: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Years of Experience:
                    </label>
                    <input
                      type="text"
                      value={editForm.years_of_experience}
                      onChange={(e) => setEditForm({ ...editForm, years_of_experience: e.target.value })}
                      placeholder="e.g. 3y 6m"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Notice Period */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Notice Period:
                    </label>
                    <input
                      type="text"
                      value={editForm.notice_period}
                      onChange={(e) => setEditForm({ ...editForm, notice_period: e.target.value })}
                      placeholder="e.g. 15 Days or less"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Mail 1 Status */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Mail 1 Status:
                    </label>
                    <select
                      value={editForm.mail_1_status}
                      onChange={(e) => setEditForm({ ...editForm, mail_1_status: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, background: "#fff", boxSizing: "border-box" }}
                    >
                      <option value="">Pending (Not Sent)</option>
                      <option value="sent">Sent</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  {/* Mail 2 Status */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Mail 2 Status:
                    </label>
                    <select
                      value={editForm.mail_2_status}
                      onChange={(e) => setEditForm({ ...editForm, mail_2_status: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, background: "#fff", boxSizing: "border-box" }}
                    >
                      <option value="">-- (Not Sent)</option>
                      <option value="sent">Sent</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  {/* Mail 3 Status */}
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Mail 3 Status:
                    </label>
                    <select
                      value={editForm.mail_3_status}
                      onChange={(e) => setEditForm({ ...editForm, mail_3_status: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, background: "#fff", boxSizing: "border-box" }}
                    >
                      <option value="">-- (Not Sent)</option>
                      <option value="sent">Sent</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                  <button
                    type="button"
                    onClick={() => setEditingLead(null)}
                    disabled={savingLead}
                    style={{
                      padding: "10px 16px",
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingLead}
                    style={{
                      padding: "10px 20px",
                      background: savingLead ? "#94a3b8" : "#2563eb",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: savingLead ? "not-allowed" : "pointer",
                      boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
                    }}
                  >
                    {savingLead ? "💾 Saving..." : "💾 Save Changes to DB"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Campaign Dispatch Log Modal */}
        {viewingCampaignLog && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 16,
            }}
            onClick={() => setViewingCampaignLog(null)}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: 14,
                width: "100%",
                maxWidth: 680,
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
                padding: 24,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                    📋 Campaign Logs: {viewingCampaignLog.name || `Campaign #${viewingCampaignLog.id}`}
                  </h3>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                    Created: {new Date(viewingCampaignLog.created_at || viewingCampaignLog.start_time).toLocaleString()} &bull; Delay: {viewingCampaignLog.gap_seconds || 2}s/lead &bull; M2: +{viewingCampaignLog.followup_1_days || 3}d &bull; M3: +{viewingCampaignLog.followup_2_days || 7}d
                  </div>
                </div>
                <button
                  onClick={() => setViewingCampaignLog(null)}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#64748b" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <div style={{ background: "#ecfdf5", padding: "10px 12px", borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#065f46", fontWeight: 700 }}>Mail 1 Sent</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#047857" }}>{viewingCampaignLog.m1_sent ?? (viewingCampaignLog.processed_count || 0)}</div>
                </div>
                <div style={{ background: "#faf5ff", padding: "10px 12px", borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#6d28d9", fontWeight: 700 }}>Mail 2 Sent</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#7c3aed" }}>{viewingCampaignLog.m2_sent ?? 0}</div>
                </div>
                <div style={{ background: "#fffbeb", padding: "10px 12px", borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700 }}>Mail 3 Sent</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#b45309" }}>{viewingCampaignLog.m3_sent ?? 0}</div>
                </div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                Recipients Dispatched in this Campaign ({viewingCampaignLog.results ? viewingCampaignLog.results.length : 0}):
              </div>

              {viewingCampaignLog.results && viewingCampaignLog.results.length > 0 ? (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, maxHeight: 320, overflowY: "auto" }}>
                  {viewingCampaignLog.results.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 12px",
                        borderBottom: i === viewingCampaignLog.results.length - 1 ? "none" : "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 12,
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, color: "#0f172a" }}>[ID {r.id}] {r.name || "Lead"}</span>
                        <span style={{ color: "#64748b", marginLeft: 8 }}>{r.email}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ padding: "2px 6px", background: "#eff6ff", color: "#1e40af", borderRadius: 4, fontWeight: 700 }}>
                          Mail {r.slot || 1} &bull; Tpl {r.template}
                        </span>
                        <span>{r.status === "sent" ? "✅ Sent" : "⚠️ " + (r.status || "Failed")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: 8 }}>
                  No lead dispatch details recorded for this campaign.
                </div>
              )}

              <div style={{ marginTop: 18, textAlign: "right" }}>
                <button
                  onClick={() => setViewingCampaignLog(null)}
                  style={{ padding: "8px 18px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
