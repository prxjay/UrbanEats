import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";

const Footer = () => {
  return (
    <footer style={{
      background: "#000000",
      color: "rgba(255,255,255,0.6)",
      padding: "52px 24px 28px",
      marginTop: "auto"
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Top grid */}
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <img src={assets.logo} alt="UrbanEats" style={{ height: "48px", width: "48px", objectFit: "contain" }} />
              <span style={{ color: "white", fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px" }}>UrbanEats</span>
            </div>
            <p style={{ fontSize: "14px", lineHeight: "1.7", maxWidth: "260px" }}>
              Delivering happiness to your doorstep. Fresh food from the best restaurants, right to you.
            </p>

            {/* Social icons — LinkedIn + Instagram only */}
            <div style={{ display: "flex", gap: "12px", marginTop: "22px" }}>
              {/* LinkedIn */}
              <div
                style={{ ...socialIconStyle, cursor: "default" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(10,102,194,0.4)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                aria-label="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                </svg>
              </div>

              {/* Instagram */}
              <div
                style={{ ...socialIconStyle, cursor: "default" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(193,53,132,0.4)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="black"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="footer-col-title">Navigate</h4>
            {[
              { label: "Home", path: "/" },
              { label: "Explore Food", path: "/explore" },
              { label: "My Orders", path: "/myorders" },
              { label: "Cart", path: "/cart" },
            ].map(item => (
              <Link key={item.label} to={item.path} style={footerLinkStyle}
                onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
              >{item.label}</Link>
            ))}
          </div>

          {/* Support */}
          <div>
            <h4 className="footer-col-title">Support</h4>
            <Link to="/contact" style={footerLinkStyle}
              onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
            >Contact Us</Link>
            <Link to="/privacy-policy" style={footerLinkStyle}
              onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
            >Privacy Policy</Link>
            <Link to="/terms" style={footerLinkStyle}
              onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
            >Terms & Conditions</Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p style={{ fontSize: "13px" }}>© {new Date().getFullYear()} UrbanEats. All rights reserved.</p>
          <p style={{ fontSize: "13px" }}>
            Designed with ❤️ by{" "}
            <a
              href="https://www.linkedin.com/in/prawin-jayakhar/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}
            >
              Prawin
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

const socialIconStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  transition: "background 0.2s",
  flexShrink: 0,
};

const footerLinkStyle = {
  display: "block",
  color: "rgba(255,255,255,0.55)",
  fontSize: "14px",
  marginBottom: "11px",
  textDecoration: "none",
  transition: "color 0.2s",
};

export default Footer;
