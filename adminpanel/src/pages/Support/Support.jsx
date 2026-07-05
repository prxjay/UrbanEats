import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { toast } from "react-toastify";

const Support = () => {
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("unresolved");
  const [replies, setReplies] = useState({}); // Keep track of typed replies per ticket

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching support messages:", error);
      toast.error("Unable to load support tickets.");
    }
  };

  useEffect(() => {
    fetchMessages();

    // Real-time subscription
    const subscription = supabase
      .channel("public:support_messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_messages" }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  const handleReplyChange = (ticketId, value) => {
    setReplies(prev => ({ ...prev, [ticketId]: value }));
  };

  const submitReply = async (ticket) => {
    const replyText = (replies[ticket.id] || "").trim();
    if (!replyText) {
      toast.error("Please enter a reply message.");
      return;
    }

    try {
      const { error } = await supabase
        .from("support_messages")
        .update({ 
          status: "resolved",
          admin_reply: replyText
        })
        .eq("id", ticket.id);
      if (error) throw error;
      
      toast.success("Reply sent and ticket resolved!");
      setReplies(prev => {
        const copy = { ...prev };
        delete copy[ticket.id];
        return copy;
      });
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply. Did you add the admin_reply column to Supabase?");
    }
  };

  const reopenTicket = async (ticket) => {
    try {
      const { error } = await supabase
        .from("support_messages")
        .update({ status: "unresolved" })
        .eq("id", ticket.id);
      if (error) throw error;
      toast.success("Ticket reopened!");
    } catch (error) {
      toast.error("Failed to reopen ticket.");
    }
  };

  const filteredTickets = messages.filter((m) => m.status === activeTab);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Customer Support Center</h2>

      {/* Tabs Row */}
      <div className="d-flex border-bottom mb-4">
        <button
          className={`btn pb-2 px-4 rounded-0 fw-bold ${activeTab === "unresolved" ? "border-bottom border-primary border-3 text-primary" : "text-muted"}`}
          onClick={() => setActiveTab("unresolved")}
          style={{ background: "none", border: "none" }}
        >
          Unresolved Tickets ({messages.filter(m => m.status === "unresolved").length})
        </button>
        <button
          className={`btn pb-2 px-4 rounded-0 fw-bold ${activeTab === "resolved" ? "border-bottom border-primary border-3 text-primary" : "text-muted"}`}
          onClick={() => setActiveTab("resolved")}
          style={{ background: "none", border: "none" }}
        >
          Resolved Archive ({messages.filter(m => m.status === "resolved").length})
        </button>
      </div>

      {/* Support Messages Grid */}
      <div className="row g-3">
        {filteredTickets.length === 0 ? (
          <div className="col-12 card text-center py-5 text-muted border-0 shadow-sm mt-0">
            <i className="bi bi-chat-heart fs-1 mb-2 d-block"></i>
            All clear! No {activeTab} tickets.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div className="col-md-6" key={ticket.id}>
              <div className="card p-4 border-0 bg-white shadow-sm h-100 mt-0 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">{ticket.name}</h5>
                      <div className="text-muted small">
                        <i className="bi bi-envelope me-1"></i>{ticket.email}
                      </div>
                      {ticket.phone && (
                        <div className="text-muted small">
                          <i className="bi bi-telephone me-1"></i>+91 {ticket.phone}
                        </div>
                      )}
                    </div>
                    <span className="badge bg-light text-muted small">
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString("en-IN") : ""}
                    </span>
                  </div>
                  <p className="bg-light p-3 rounded text-secondary" style={{ fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    <strong>Query:</strong> "{ticket.message}"
                  </p>

                  {/* Render Existing Reply if it exists in resolved tab */}
                  {ticket.admin_reply && (
                    <div className="mt-3 p-3 rounded border border-success-light" style={{ backgroundColor: "#f0fdf4", fontSize: "14px" }}>
                      <strong className="text-success"><i className="bi bi-reply-fill me-1"></i>Your Response:</strong>
                      <p className="mb-0 text-secondary mt-1">{ticket.admin_reply}</p>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  {ticket.status === "unresolved" ? (
                    <div className="w-100">
                      <div className="mb-3">
                        <label className="form-label small fw-bold text-secondary">Write Reply</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          placeholder="Type reply and resolve ticket..."
                          value={replies[ticket.id] || ""}
                          onChange={(e) => handleReplyChange(ticket.id, e.target.value)}
                          style={{ resize: "none", fontSize: "13px" }}
                        />
                      </div>
                      <button className="btn btn-primary btn-sm fw-bold" onClick={() => submitReply(ticket)}>
                        <i className="bi bi-send me-1"></i>Send Reply & Resolve
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-outline-secondary btn-sm fw-bold" onClick={() => reopenTicket(ticket)}>
                      <i className="bi bi-arrow-counterclockwise me-1"></i>Reopen Ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Support;
