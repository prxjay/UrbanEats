import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { updatePaymentStatus } from '../../service/orderService';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        if (orderId) {
          await updatePaymentStatus(orderId, 'paid');
          toast.success('Payment successful! Your order has been placed.');
          navigate('/myorders');
        } else {
          toast.error('Invalid order ID');
          navigate('/');
        }
      } catch (error) {
        console.error('Error updating payment status:', error);
        toast.error('Error processing payment. Please contact support.');
        navigate('/');
      }
    };

    handlePaymentSuccess();
  }, [orderId, navigate]);

  return (
    <div className="place-order-page page-content text-center" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div className="spinner-border text-primary mb-4" role="status" style={{ width: "3.5rem", height: "3.5rem", borderWidth: "4px", color: "var(--primary) !important" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--secondary)" }}>Processing Payment...</h2>
      <p style={{ color: "var(--text-muted)" }}>Please wait while we confirm your payment transaction.</p>
    </div>
  );
};

export default PaymentSuccess; 