import React from "react";

const Terms = () => {
  return (
    <div className="page-content" style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 64px" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "800", color: "var(--secondary)", marginBottom: "8px" }}>Terms & Conditions</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "36px", fontSize: "13px" }}>Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

      {[
        { title: "1. Acceptance of Terms", text: "By accessing or using UrbanEats, you agree to be bound by these Terms and Conditions. If you do not agree to any of these terms, please do not use our services." },
        { title: "2. Use of Service", text: "UrbanEats provides an online platform to browse and order food from local restaurants. You agree to use the service only for lawful purposes and in a manner that does not infringe upon the rights of others." },
        { title: "3. Account Responsibility", text: "You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility. Notify us immediately if you suspect unauthorized use." },
        { title: "4. Order & Payment", text: "All orders placed through UrbanEats are subject to availability. We reserve the right to cancel or refuse any order at our discretion. Payments are processed securely through our payment partners." },
        { title: "5. Delivery Policy", text: "Delivery times are estimates and may vary based on location, traffic, and restaurant preparation time. UrbanEats is not liable for delays outside our control." },
        { title: "6. Cancellation & Refunds", text: "Orders may be cancelled before they are confirmed by the restaurant. Refunds are processed within 5–7 business days to the original payment method. No refunds are issued after food is dispatched." },
        { title: "7. Intellectual Property", text: "All content, trademarks, and intellectual property on UrbanEats are owned by or licensed to us. You may not reproduce, distribute, or create derivative works without our written consent." },
        { title: "8. Limitation of Liability", text: "UrbanEats is not liable for any indirect, incidental, or consequential damages arising from your use of the platform or inability to access it." },
        { title: "9. Changes to Terms", text: "We reserve the right to update these Terms at any time. Continued use of the platform after changes constitutes your acceptance of the updated terms." },
        { title: "10. Contact", text: "For questions about these Terms, please reach out to us via the Contact page." },
      ].map((section) => (
        <div key={section.title} style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "17px", fontWeight: "700", color: "var(--secondary)", marginBottom: "8px" }}>{section.title}</h2>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: "1.7" }}>{section.text}</p>
        </div>
      ))}
    </div>
  );
};

export default Terms;
