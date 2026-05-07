import { useState } from "react";
import LoginPage from "./components/pages/LoginPage";
import PaymentsPage from "./components/pages/PaymentsPage";
import AgreementsPage from "./components/pages/AgreementsPage";
import SettingsPage from "./components/pages/SettingsPage";
import TeamPage from "./components/pages/TeamPage";
import SupportPage from "./components/pages/SupportPage";
import RequestDetailPage from "./components/pages/RequestDetailPage";
import type { PageId } from "./data/mockData";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [page, setPage] = useState<PageId>("payments");
  const [viewingRef, setViewingRef] = useState<string | null>(null);

  const navigate = (next: PageId) => {
    setViewingRef(null);
    setPage(next);
  };

  const logout = () => {
    setViewingRef(null);
    setPage("payments");
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  if (viewingRef) {
    return (
      <RequestDetailPage
        reference={viewingRef}
        onBack={() => setViewingRef(null)}
        onNavigate={navigate}
        onLogout={logout}
      />
    );
  }
  if (page === "payments")
    return <PaymentsPage onNavigate={navigate} onLogout={logout} onViewRequest={setViewingRef} />;
  if (page === "settings") return <SettingsPage onNavigate={navigate} onLogout={logout} />;
  if (page === "team") return <TeamPage onNavigate={navigate} onLogout={logout} />;
  if (page === "support") return <SupportPage onNavigate={navigate} onLogout={logout} />;
  return <AgreementsPage onNavigate={navigate} onLogout={logout} onViewRequest={setViewingRef} />;
}

export default App;
