import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentSuccess from './PaymentSuccess';
import App from './main';

function MainApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
      </Routes>
    </Router>
  );
}

export default MainApp;
