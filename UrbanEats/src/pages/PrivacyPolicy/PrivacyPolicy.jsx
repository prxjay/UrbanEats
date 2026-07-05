import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="page-content" style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 64px" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "800", color: "var(--secondary)", marginBottom: "8px" }}>Privacy Policy</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "36px", fontSize: "13px" }}>Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

      {[
        { title: "1. Information We Collect", text: "We collect information you provide directly to us, including your name, email address, phone number, delivery address, and payment details. We also collect usage data to improve our services." },
        { title: "2. How We Use Your Information", text: "Your information is used to process and deliver your orders, communicate updates, send promotional offers (with your consent), and improve the platform. We do not sell your personal data to third parties." },
        { title: "3. Data Sharing", text: "We share your data only with restaurant partners (for order fulfillment), delivery personnel, and payment processors. All third parties are bound by confidentiality agreements." },
        { title: "4. Cookies", text: "UrbanEats uses cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You may disable cookies through your browser settings, though this may affect functionality." },
        { title: "5. Data Security", text: "We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure." },
        { title: "6. Data Retention", text: "We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your data by contacting us." },
        { title: "7. Your Rights", text: "You have the right to access, correct, or delete your personal data at any time. To exercise these rights, please contact us via the Contact page." },
        { title: "8. Children's Privacy", text: "UrbanEats is not intended for children under 13 years of age. We do not knowingly collect personal information from children." },
        { title: "9. Changes to This Policy", text: "We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our platform." },
        { title: "10. Contact Us", text: "For privacy-related inquiries, please reach out to us via the Contact page on UrbanEats." },
      ].map((section) => (
        <div key={section.title} style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "17px", fontWeight: "700", color: "var(--secondary)", marginBottom: "8px" }}>{section.title}</h2>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: "1.7" }}>{section.text}</p>
        </div>
      ))}
    </div>
  );
};

export default PrivacyPolicy;
