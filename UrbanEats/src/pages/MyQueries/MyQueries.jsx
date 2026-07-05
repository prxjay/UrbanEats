import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./MyQueries.css";

const MyQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const fetchQueries = async () => {
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("email", currentUser.email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQueries(data || []);
    } catch (err) {
      console.error("Error fetching customer queries:", err);
      toast.error("Unable to load support queries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchQueries();

    // Subscribe to support updates in real-time
    const subscription = supabase
      .channel(`public:support_messages:${currentUser.email}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "support_messages", filter: `email=eq.${currentUser.email}` }, () => {
        fetchQueries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="my-queries-container page-content text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-queries-container page-content">
      <h2>My Support Tickets</h2>
      {queries.length === 0 ? (
        <p className="no-queries">You haven't submitted any support tickets yet.</p>
      ) : (
        <div className="queries-list">
          {queries.map((q) => {
            const dateStr = q.created_at
              ? new Date(q.created_at).toLocaleString("en-IN")
              : "N/A";
            return (
              <div key={q.id} className="query-card">
                <div className="query-header">
                  <span className="query-date">{dateStr}</span>
                  <span className={`query-status ${q.status === "resolved" ? "status-resolved" : "status-pending"}`}>
                    {q.status === "resolved" ? "Resolved" : "Under Review"}
                  </span>
                </div>
                <div className="query-body">
                  <div className="query-message-box">
                    <strong className="text-secondary">Your Message:</strong>
                    <p className="query-text">"{q.message}"</p>
                  </div>

                  {/* Reply block if resolved */}
                  {q.admin_reply ? (
                    <div className="query-reply-box">
                      <strong className="text-success">
                        <i className="bi bi-chat-left-dots-fill me-1.5"></i>Support Reply:
                      </strong>
                      <p className="reply-text">{q.admin_reply}</p>
                    </div>
                  ) : (
                    <div className="query-pending-box">
                      <i className="bi bi-clock-history me-1.5"></i>Our support team is reviewing your ticket and will reply shortly.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyQueries;
