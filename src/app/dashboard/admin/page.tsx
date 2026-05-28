"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "./admin.module.css";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  department: string | null;
  batchYear: number | null;
  image: string | null;
  isVerified: boolean;
  forcePasswordChange: boolean;
  kycStatus: string;
  createdAt: string;
};

type ReviewAudit = {
  id: string;
  rating: number;
  rawContent: string | null;
  moderatedText: string | null;
  teacherName: string;
  teacherDepartment: string;
  studentBatchYear: number | null;
  createdAt: string;
};

type AIRAHealth = {
  status: string;
  totalKeys: number;
  currentKeyIndex: number;
  latencyMs: number | null;
  responseSnippet: string | null;
  errorMessage: string | null;
  checkedAt: string;
};

type Tab = "HEALTH" | "KYC" | "USERS" | "REVIEWS";

export default function AdminPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "";
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const [activeTab, setActiveTab] = useState<Tab>(isSuperAdmin ? "HEALTH" : "KYC");

  // KYC State
  const [kycs, setKycs] = useState<any[]>([]);

  // Teacher Create State
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "", department: "COMPUTER", image: "" });

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", department: "", batchYear: "", role: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // Reviews State
  const [reviews, setReviews] = useState<ReviewAudit[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // AIRA AI Health State
  const [aira, setAira] = useState<AIRAHealth | null>(null);
  const [airaLoading, setAiraLoading] = useState(false);

  // System stats
  const [systemStats, setSystemStats] = useState({ totalUsers: 0, totalStudents: 0, totalTeachers: 0, totalReviews: 0 });

  // Set default tab based on role once session loads
  useEffect(() => {
    if (userRole) {
      setActiveTab(isSuperAdmin ? "HEALTH" : "KYC");
    }
  }, [userRole, isSuperAdmin]);

  useEffect(() => {
    fetchKycs();
    fetchUsers();
    if (isSuperAdmin) fetchAiraHealth();
    fetchReviews();
  }, [isSuperAdmin]);

  useEffect(() => {
    if (users.length > 0 || reviews.length > 0) {
      setSystemStats({
        totalUsers: users.length,
        totalStudents: users.filter((u) => u.role === "STUDENT").length,
        totalTeachers: users.filter((u) => u.role === "TEACHER").length,
        totalReviews: reviews.length,
      });
    }
  }, [users, reviews]);

  // ---- Fetch Functions ----
  const fetchKycs = async () => {
    const res = await fetch("/api/admin/kyc");
    if (res.ok) setKycs(await res.json());
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers(await res.json());
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) setReviews(await res.json());
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchAiraHealth = async () => {
    setAiraLoading(true);
    try {
      const res = await fetch("/api/admin/gemini-health");
      if (res.ok) setAira(await res.json());
    } finally {
      setAiraLoading(false);
    }
  };

  // ---- KYC Actions ----
  const handleKycAction = async (kycId: string, action: "APPROVE" | "REJECT") => {
    await fetch("/api/admin/kyc", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kycId, action })
    });
    fetchKycs();
  };

  // ---- Teacher Create ----
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTeacher)
    });
    if (res.ok) {
      setNewTeacher({ name: "", email: "", department: "COMPUTER", image: "" });
      fetchUsers();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to add teacher");
    }
  };

  // ---- User Edit ----
  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      department: user.department || "",
      batchYear: user.batchYear ? String(user.batchYear) : "",
      role: user.role,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setEditSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingUser.id, ...editForm })
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update user");
      }
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string | null) => {
    if (!confirm(`Are you sure you want to delete "${name || "this user"}"? This action cannot be undone.`)) return;
    await fetch(`/api/admin/teachers?id=${id}`, { method: "DELETE" });
    fetchUsers();
  };

  // ---- Filters ----
  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term) ||
      (u.department || "").toLowerCase().includes(term)
    );
  });

  // ---- Helpers ----
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Build tabs based on role
  const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
    // System Health — SUPER_ADMIN only
    ...(isSuperAdmin ? [{ key: "HEALTH" as Tab, label: "System Health", icon: "🩺" }] : []),
    { key: "KYC", label: "KYC Approvals", icon: "📋", count: kycs.length },
    { key: "USERS", label: "User Management", icon: "👥", count: users.length },
    { key: "REVIEWS", label: "Review Audit", icon: "🔍", count: reviews.length },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
            {isSuperAdmin ? (
              <>
                <span style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Super Admin
                </span>{" "}
                Panel
              </>
            ) : (
              "Admin Panel"
            )}
          </h1>
          <p style={{ color: "#64748b", fontWeight: 500, marginTop: "0.25rem" }}>
            {isSuperAdmin ? "Full system management & AI monitoring" : "User & KYC management"}
          </p>
        </div>
        {/* Role badge */}
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 800,
            padding: "0.375rem 0.875rem",
            borderRadius: "999px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            ...(isSuperAdmin
              ? { background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "white" }
              : { background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white" }),
          }}
        >
          {userRole.replace("_", " ")}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "0.75rem",
              border: activeTab === t.key ? "none" : "1px solid #e2e8f0",
              background: activeTab === t.key ? "#2563eb" : "white",
              color: activeTab === t.key ? "white" : "#475569",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s",
            }}
          >
            <span>{t.icon}</span>
            {t.label}
            {t.count !== undefined && (
              <span
                style={{
                  fontSize: "0.7rem",
                  padding: "0.125rem 0.5rem",
                  borderRadius: "999px",
                  background: activeTab === t.key ? "rgba(255,255,255,0.2)" : "#f1f5f9",
                  fontWeight: 800,
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========== SYSTEM HEALTH TAB (SUPER_ADMIN ONLY) ========== */}
      {activeTab === "HEALTH" && isSuperAdmin && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Quick Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            {[
              { label: "Total Users", value: systemStats.totalUsers, icon: "👥", color: "#2563eb" },
              { label: "Students", value: systemStats.totalStudents, icon: "🎓", color: "#059669" },
              { label: "Teachers", value: systemStats.totalTeachers, icon: "👨‍🏫", color: "#7c3aed" },
              { label: "Total Reviews", value: systemStats.totalReviews, icon: "📝", color: "#ea580c" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "white",
                  borderRadius: "1.25rem",
                  padding: "1.25rem",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ fontSize: "1.75rem", opacity: 0.08, position: "absolute", top: "0.75rem", right: "1rem" }}>{s.icon}</div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {s.label}
                </span>
                <span style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a" }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* AIRA AI Health Card */}
          <div
            style={{
              background: "white",
              borderRadius: "1.5rem",
              border: "1px solid #e2e8f0",
              padding: "2rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>🤖 AIRA AI Status</h2>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 500, marginTop: "0.25rem" }}>
                  Live health check of the AIRA AI moderation system
                </p>
              </div>
              <button
                onClick={fetchAiraHealth}
                disabled={airaLoading}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #e2e8f0",
                  background: "white",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "#475569",
                }}
              >
                {airaLoading ? "Checking..." : "🔄 Re-check"}
              </button>
            </div>

            {airaLoading && !aira ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
                Pinging AIRA AI...
              </div>
            ) : aira ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                {/* Status */}
                <div
                  style={{
                    padding: "1.25rem",
                    borderRadius: "1rem",
                    background:
                      aira.status === "LIVE"
                        ? "linear-gradient(135deg, #f0fdf4, #dcfce7)"
                        : aira.status === "DEGRADED"
                        ? "linear-gradient(135deg, #fffbeb, #fef3c7)"
                        : "linear-gradient(135deg, #fef2f2, #fee2e2)",
                    border: `1px solid ${
                      aira.status === "LIVE" ? "#bbf7d0" : aira.status === "DEGRADED" ? "#fde68a" : "#fecaca"
                    }`,
                  }}
                >
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Status
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 900,
                      marginTop: "0.25rem",
                      color: aira.status === "LIVE" ? "#16a34a" : aira.status === "DEGRADED" ? "#d97706" : "#dc2626",
                    }}
                  >
                    {aira.status === "LIVE" ? "🟢" : aira.status === "DEGRADED" ? "🟡" : "🔴"} {aira.status}
                  </div>
                </div>

                {/* Key Pool */}
                <div style={{ padding: "1.25rem", borderRadius: "1rem", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    API Key Pool
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, marginTop: "0.25rem", color: "#0f172a" }}>
                    {aira.totalKeys} <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#94a3b8" }}>keys loaded</span>
                  </div>
                </div>

                {/* Latency */}
                <div style={{ padding: "1.25rem", borderRadius: "1rem", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Response Latency
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, marginTop: "0.25rem", color: "#0f172a" }}>
                    {aira.latencyMs !== null ? `${aira.latencyMs}ms` : "—"}
                  </div>
                </div>

                {/* Last Checked */}
                <div style={{ padding: "1.25rem", borderRadius: "1rem", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Last Checked
                  </div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, marginTop: "0.5rem", color: "#0f172a" }}>
                    {aira.checkedAt ? new Date(aira.checkedAt).toLocaleTimeString() : "—"}
                  </div>
                </div>

                {/* Error message if present */}
                {aira.errorMessage && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      padding: "1rem",
                      borderRadius: "0.75rem",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#dc2626",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ {aira.errorMessage}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ========== KYC TAB ========== */}
      {activeTab === "KYC" && (
        <div className={styles.tableContainer}>
          {kycs.length === 0 ? (
            <div className={styles.emptyState}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✅</div>
              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>All Clear!</div>
              No pending KYC documents to review.
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Document</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {kycs.map((kyc) => (
                  <tr key={kyc.id}>
                    <td style={{ fontWeight: 700 }}>{kyc.user.name}</td>
                    <td>{kyc.user.email}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          padding: "0.25rem 0.75rem",
                          borderRadius: "999px",
                          background: "#f1f5f9",
                          color: "#475569",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {kyc.user.department || "N/A"}
                      </span>
                    </td>
                    <td>
                      {kyc.documentUrl?.startsWith("data:image/") ? (
                        <img
                          src={kyc.documentUrl}
                          alt="ID Card"
                          onClick={() => window.open(kyc.documentUrl, "_blank")}
                          style={{
                            width: "80px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "0.5rem",
                            border: "1px solid #e2e8f0",
                            cursor: "pointer",
                          }}
                          title="Click to view full size"
                        />
                      ) : (
                        <a
                          href={kyc.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none" }}
                        >
                          View ID Card ↗
                        </a>
                      )}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button onClick={() => handleKycAction(kyc.id, "APPROVE")} className={styles.btnApprove}>
                          ✓ Approve
                        </button>
                        <button onClick={() => handleKycAction(kyc.id, "REJECT")} className={styles.btnReject}>
                          ✗ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ========== USER MANAGEMENT TAB ========== */}
      {activeTab === "USERS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Search */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: "250px" }}>
              <input
                type="text"
                placeholder="🔍 Search users by name, email, role, department..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  outline: "none",
                  background: "white",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
            {/* Users Table */}
            <div className={styles.tableContainer} style={{ flex: "1 1 0%", minWidth: 0, overflowX: "auto" }}>
              {usersLoading ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>Loading users...</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>KYC</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 700, color: "#0f172a" }}>{u.name || "—"}</td>
                        <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{u.email}</td>
                        <td>
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              padding: "0.2rem 0.6rem",
                              borderRadius: "999px",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              ...(u.role === "SUPER_ADMIN"
                                ? { background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "white" }
                                : u.role === "ADMIN"
                                ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white" }
                                : u.role === "TEACHER"
                                ? { background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white" }
                                : { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }),
                            }}
                          >
                            {u.role.replace("_", " ")}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{u.department || "—"}</td>
                        <td>
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              padding: "0.2rem 0.6rem",
                              borderRadius: "999px",
                              ...(u.kycStatus === "APPROVED"
                                ? { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }
                                : u.kycStatus === "PENDING"
                                ? { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }
                                : u.kycStatus === "REJECTED"
                                ? { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }
                                : { background: "#f8fafc", color: "#94a3b8", border: "1px solid #e2e8f0" }),
                            }}
                          >
                            {u.kycStatus}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.375rem" }}>
                            <button
                              onClick={() => openEdit(u)}
                              style={{
                                padding: "0.375rem 0.75rem",
                                borderRadius: "0.5rem",
                                border: "1px solid #e2e8f0",
                                background: "white",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                color: "#2563eb",
                              }}
                            >
                              ✏️ Edit
                            </button>
                            {/* SUPER_ADMIN can delete anyone except themselves; ADMIN can delete students only */}
                            {(isSuperAdmin
                              ? u.role !== "SUPER_ADMIN"
                              : u.role === "STUDENT") && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                style={{
                                  padding: "0.375rem 0.75rem",
                                  borderRadius: "0.5rem",
                                  border: "1px solid #fecaca",
                                  background: "#fef2f2",
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  color: "#dc2626",
                                }}
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className={styles.emptyState}>
                          {userSearch ? "No users match your search." : "No users found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Add Teacher Form — SUPER_ADMIN only */}
            {isSuperAdmin && (
              <form className={styles.form} onSubmit={handleAddTeacher} style={{ width: "100%", maxWidth: "500px" }}>
                <h3 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem" }}>➕ Add New Teacher</h3>
                <div className={styles.inputGroup}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Full Name</label>
                  <input required value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} />
                </div>
                <div className={styles.inputGroup}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Email Address</label>
                  <input type="email" required value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} />
                </div>
                <div className={styles.inputGroup}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Department</label>
                  <select value={newTeacher.department} onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}>
                    <option value="COMPUTER">Computer Engineering</option>
                    <option value="CIVIL">Civil Engineering</option>
                    <option value="ARCHITECTURE">Architecture</option>
                    <option value="BASIC_SCIENCE">Basic Science</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Photo URL (Optional)</label>
                  <input value={newTeacher.image} onChange={(e) => setNewTeacher({ ...newTeacher, image: e.target.value })} placeholder="https://..." />
                </div>
                <button
                  type="submit"
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.75rem",
                    borderRadius: "0.75rem",
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Create Teacher Profile
                </button>
              </form>
            )}
          </div>

          {/* Edit Modal */}
          {editingUser && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "1rem",
              }}
              onClick={() => setEditingUser(null)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "white",
                  borderRadius: "1.5rem",
                  padding: "2rem",
                  width: "100%",
                  maxWidth: "460px",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                }}
              >
                <h2 style={{ fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem", fontSize: "1.25rem" }}>
                  ✏️ Edit User
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className={styles.inputGroup}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Full Name</label>
                    <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Email</label>
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Department</label>
                    <select value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}>
                      <option value="">None</option>
                      <option value="COMPUTER">Computer Engineering</option>
                      <option value="CIVIL">Civil Engineering</option>
                      <option value="ARCHITECTURE">Architecture</option>
                      <option value="BASIC_SCIENCE">Basic Science</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Role</label>
                    <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      {/* Only SUPER_ADMIN can assign admin-level roles */}
                      {isSuperAdmin && (
                        <>
                          <option value="ADMIN">Admin</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </>
                      )}
                    </select>
                  </div>
                  {editForm.role === "STUDENT" && (
                    <div className={styles.inputGroup}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Batch Year</label>
                      <input
                        type="number"
                        value={editForm.batchYear}
                        onChange={(e) => setEditForm({ ...editForm, batchYear: e.target.value })}
                        placeholder="e.g. 2081"
                      />
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <button
                    onClick={handleSaveEdit}
                    disabled={editSaving}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      borderRadius: "0.75rem",
                      border: "none",
                      background: "#2563eb",
                      color: "white",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {editSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    style={{
                      padding: "0.75rem 1.25rem",
                      borderRadius: "0.75rem",
                      border: "1px solid #e2e8f0",
                      background: "white",
                      fontWeight: 700,
                      cursor: "pointer",
                      color: "#475569",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== REVIEW AUDIT TAB ========== */}
      {activeTab === "REVIEWS" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              padding: "1rem 1.25rem",
              background: isSuperAdmin ? "#eff6ff" : "#f0fdf4",
              borderRadius: "0.75rem",
              border: `1px solid ${isSuperAdmin ? "#bfdbfe" : "#bbf7d0"}`,
              fontSize: "0.8rem",
              fontWeight: 600,
              color: isSuperAdmin ? "#1d4ed8" : "#16a34a",
            }}
          >
            {isSuperAdmin ? (
              <>
                🔬 <strong>Super Admin View:</strong> You can see both the raw student input and AIRA AI&apos;s moderated output side-by-side.
                Use this to evaluate and tune AI moderation quality.
              </>
            ) : (
              <>
                🔒 Privacy Note: Reviews are 100% anonymous. You are viewing AI-moderated feedback only.
                Raw student input is restricted to Super Admin for AI tuning purposes.
              </>
            )}
          </div>

          {reviewsLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className={styles.emptyState} style={{ background: "white", borderRadius: "1rem", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📭</div>
              No reviews have been submitted yet.
            </div>
          ) : (
            <div className={styles.tableContainer} style={{ overflowX: "auto" }}>
              <table className={styles.table} style={{ minWidth: isSuperAdmin ? "900px" : "600px" }}>
                <thead>
                  <tr>
                    <th style={{ width: "110px" }}>Teacher</th>
                    <th style={{ width: "60px" }}>Rating</th>
                    {/* Raw column — SUPER_ADMIN only */}
                    {isSuperAdmin && <th>Raw Student Input</th>}
                    <th>AI Moderated Output</th>
                    <th style={{ width: "90px" }}>Batch</th>
                    <th style={{ width: "100px" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => {
                    const wasEdited = isSuperAdmin && r.rawContent && r.moderatedText && r.rawContent !== r.moderatedText;
                    return (
                      <tr key={r.id}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>{r.teacherName}</div>
                          <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                            {r.teacherDepartment}
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontWeight: 800,
                              color: r.rating >= 4 ? "#16a34a" : r.rating >= 3 ? "#d97706" : "#dc2626",
                            }}
                          >
                            <span style={{ color: "#fbbf24" }}>★</span> {r.rating}
                          </div>
                        </td>
                        {/* Raw column — SUPER_ADMIN only */}
                        {isSuperAdmin && (
                          <td>
                            <div
                              style={{
                                fontSize: "0.8rem",
                                color: "#475569",
                                lineHeight: 1.5,
                                padding: "0.5rem 0.75rem",
                                background: wasEdited ? "#fef2f2" : "#f8fafc",
                                borderRadius: "0.5rem",
                                border: `1px solid ${wasEdited ? "#fecaca" : "#e2e8f0"}`,
                                maxHeight: "100px",
                                overflow: "auto",
                              }}
                            >
                              {r.rawContent || "—"}
                            </div>
                          </td>
                        )}
                        <td>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#0f172a",
                              lineHeight: 1.5,
                              padding: "0.5rem 0.75rem",
                              background: wasEdited ? "#f0fdf4" : "#f8fafc",
                              borderRadius: "0.5rem",
                              border: `1px solid ${wasEdited ? "#bbf7d0" : "#e2e8f0"}`,
                              maxHeight: "100px",
                              overflow: "auto",
                              fontWeight: 500,
                            }}
                          >
                            {r.moderatedText || "—"}
                            {wasEdited && (
                              <span
                                style={{
                                  display: "inline-block",
                                  marginLeft: "0.5rem",
                                  fontSize: "0.6rem",
                                  fontWeight: 800,
                                  color: "#16a34a",
                                  background: "#dcfce7",
                                  padding: "0.125rem 0.4rem",
                                  borderRadius: "999px",
                                  verticalAlign: "middle",
                                }}
                              >
                                AI EDITED
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                          {r.studentBatchYear || "—"}
                        </td>
                        <td style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>
                          {formatDate(r.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
