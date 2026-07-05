import React, { useState, useEffect } from "react";
import "./Contact.css";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import { Link, Navigate } from "react-router-dom";

// ─── GUEST CONTACT FORM (Web3Forms) ───────────────────────────────────────────
const GuestContactForm = () => {
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formEl = event.target;
    const formData = new FormData(formEl);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const resData = await response.json();
      if (resData.success) {
        toast.success("Message sent! Support team will contact you.");
        formEl.reset();
        setCharCount(0);
      } else {
        toast.error("Form dispatch failed: " + resData.message);
      }
    } catch (err) {
      toast.error("Unable to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page page-content">
      <div className="contact-card">
        <div className="contact-brand-strip">
          <h2>Get in Touch</h2>
          <p>We'd love to hear from you. Send us a message!</p>
        </div>
        <div className="contact-body">
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="access_key" value="e0630778-a382-4f61-93cd-649c0c7d1ae7" />
            <div className="contact-row">
              <div className="auth-field" style={{ flex: 1 }}>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input id="contact-name" type="text" name="first_name" className="auth-input" placeholder="Full Name" maxLength={20} required />
                </div>
              </div>
              <div className="auth-field" style={{ flex: 1 }}>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon contact-phone-prefix">+91</span>
                  <input id="contact-phone" type="tel" name="phone" className="auth-input contact-phone-input" placeholder="Phone Number" maxLength={15} pattern="[0-9]{7,15}" inputMode="numeric" required />
                </div>
              </div>
            </div>
            <div className="auth-field">
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input id="contact-email" type="email" name="email" className="auth-input" placeholder="Email Address" required />
              </div>
            </div>
            <div className="auth-field">
              <div style={{ position: "relative" }}>
                <textarea id="contact-message" name="message" className="contact-textarea" placeholder="Your Message (max 250 characters)" maxLength={250} rows={5} required onChange={(e) => setCharCount(e.target.value.length)} />
                <span className="contact-char-count">{charCount}/250</span>
              </div>
            </div>
            <button type="submit" className="auth-submit-btn" id="contact-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── SIGNED-IN QUERY FORM (Supabase) ──────────────────────────────────────────
const UserQueryForm = ({ user }) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeQuery, setActiveQuery] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!user) return null;

  const getFirstName = (u) => {
    const rawName = u.user_metadata?.name || u.user_metadata?.full_name || u.user_metadata?.display_name || u.email?.split("@")[0] || "User";
    let first = rawName.split(" ")[0].split(".")[0].split("_")[0];
    first = first.charAt(0).toUpperCase() + first.slice(1);
    if (first.toLowerCase().startsWith("prawin")) {
      return "Prawin";
    }
    return first;
  };

  const displayName = getFirstName(user);

  const fetchActiveQuery = async () => {
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("email", user.email)
        .eq("status", "unresolved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setActiveQuery(data[0]); // Get the most recent unresolved ticket
      } else {
        setActiveQuery(null);
      }
    } catch (err) {
      console.error("Error fetching unresolved support query:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveQuery();
  }, [user.email]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) { toast.error("Please write your query first."); return; }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("support_messages").insert([{
        name: displayName,
        email: user.email,
        message: message.trim(),
        status: "unresolved",
      }]);
      if (error) throw error;
      toast.success("Your query has been submitted! Our team will get back to you.");
      setMessage("");
      fetchActiveQuery();
    } catch (err) {
      console.error(err);
      toast.error("Unable to submit query. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page page-content">
      <div className="contact-card">
        <div className="contact-brand-strip" style={{ background: "linear-gradient(135deg, #fc8019, #e5711a)" }}>
          <div style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", color: "white", marginBottom: "12px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "26px", height: "26px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </div>
          <h2>Send a Query</h2>
          <p>Hi {displayName}! Let us know how we can help.</p>
        </div>
        <div className="contact-body">
          <div style={{
            display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px",
            background: "var(--gray-50)", borderRadius: "10px", marginBottom: "20px",
            border: "1px solid var(--gray-200)",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: "14px", flexShrink: 0,
            }}>
              {displayName[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px" }}>{displayName}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user.email}</div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : activeQuery ? (
            // Anti-Spam block overlay when query is unresolved
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ display: "inline-flex", justifyContent: "center", alignItems: "center", width: "72px", height: "72px", borderRadius: "50%", background: "#fef3c7", color: "#d97706", marginBottom: "16px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "32px", height: "32px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h4 style={{ fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>Active Query Pending</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
                You have already raised a support query. To avoid spam, you can submit another query only after our support team responds to this one.
              </p>

              <div style={{
                textAlign: "left", background: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: "12px", padding: "16px", marginBottom: "24px"
              }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                  Submitted Query ({new Date(activeQuery.created_at).toLocaleDateString()}):
                </div>
                <p style={{ color: "#334155", fontSize: "14px", margin: 0, fontStyle: "italic" }}>
                  "{activeQuery.message}"
                </p>
              </div>

              <Link to="/myqueries" className="auth-submit-btn" style={{ display: "inline-block", textDecoration: "none", padding: "12px 28px" }}>
                View All Queries
              </Link>
            </div>
          ) : (
            // Render regular form if no unresolved queries
            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px", display: "block" }}>
                  Describe your query or issue
                </label>
                <div style={{ position: "relative" }}>
                  <textarea
                    className="contact-textarea"
                    placeholder="e.g. My order was missing an item, I want to request a refund, I have a complaint about delivery time..."
                    rows={5}
                    maxLength={500}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <span className="contact-char-count">{message.length}/500</span>
                </div>
              </div>
              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Query"}
              </button>
            </form>
          )}

          {!activeQuery && !loading && (
            <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "16px", marginBottom: 0 }}>
              Our support team typically responds within 24 hours.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN CONTACT COMPONENT ────────────────────────────────────────────────────
const Contact = () => {
  const { currentUser } = useAuth();
  const { token } = React.useContext(StoreContext);
  
  if (!currentUser || !token) {
    return <Navigate to="/login" />;
  }
  
  return <UserQueryForm user={currentUser} />;
};

export default Contact;
