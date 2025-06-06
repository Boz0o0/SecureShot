const supabase = require('./supabaseClient');

async function sendPurchaseEmail(buyerEmail, sessionId, photographerId) {
  const { error } = await supabase.rpc('send_purchase_email', {
    p_buyer_email: buyerEmail,
    p_session_id: sessionId,
    p_photographer_id: photographerId,
  });

  if (error) {
    console.error('Error sending email via Supabase RPC:', error.message);
    throw error;
  }
}

module.exports = sendPurchaseEmail;
