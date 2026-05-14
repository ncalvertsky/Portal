import { useState } from "react";
import LoginPage from "./components/pages/LoginPage";
import PaymentsPage from "./components/pages/PaymentsPage";
import AgreementsPage from "./components/pages/AgreementsPage";
import SettingsPage from "./components/pages/SettingsPage";
import TeamPage from "./components/pages/TeamPage";
import SupportPage from "./components/pages/SupportPage";
import MerchantLandingPage from "./components/pages/MerchantLandingPage";
import MerchantSignupFlow from "./components/pages/MerchantSignupFlow";
import RequestDetailPage from "./components/pages/RequestDetailPage";
import ProjectsPage, { type ProjectId } from "./components/pages/ProjectsPage";
import FractalSettingsPage from "./components/pages/FractalSettingsPage";
import SiteGate, { isSiteUnlocked } from "./components/pages/SiteGate";
import type { PageId } from "./data/mockData";

function App() {
  // Site-wide access gate — `outpave / g7ghnpWB`. Persists in
  // sessionStorage so a refresh doesn't re-prompt within the same tab.
  const [siteUnlocked, setSiteUnlocked] = useState(() => isSiteUnlocked());
  const [project, setProject] = useState<ProjectId | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [page, setPage] = useState<PageId>("payments");
  const [viewingRef, setViewingRef] = useState<string | null>(null);
  const [signupPath, setSignupPath] = useState<"solo" | "business" | null>(null);

  const navigate = (next: PageId) => {
    setViewingRef(null);
    setSignupPath(null);
    setPage(next);
  };

  const logout = () => {
    setViewingRef(null);
    setSignupPath(null);
    setPage("payments");
    setAuthenticated(false);
  };

  const exitToProjects = () => {
    setViewingRef(null);
    setSignupPath(null);
    setPage("payments");
    setAuthenticated(false);
    setProject(null);
  };

  if (!siteUnlocked) {
    return <SiteGate onUnlock={() => setSiteUnlocked(true)} />;
  }

  if (!project) {
    return <ProjectsPage onSelect={setProject} />;
  }

  if (project === "fractal-settings") {
    return <FractalSettingsPage onExit={exitToProjects} />;
  }

  if (!authenticated) {
    return (
      <LoginPage
        onLogin={() => setAuthenticated(true)}
        onExitProject={exitToProjects}
      />
    );
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
  if (page === "merchant-signup") {
    if (signupPath) {
      return (
        <MerchantSignupFlow
          path={signupPath}
          onExit={() => {
            setSignupPath(null);
            navigate("payments");
          }}
        />
      );
    }
    return (
      <MerchantLandingPage
        onBack={() => navigate("payments")}
        onSelectPath={setSignupPath}
      />
    );
  }
  return <AgreementsPage onNavigate={navigate} onLogout={logout} onViewRequest={setViewingRef} />;
}

export default App;
