import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Dashboard from "./components/Dashboard";
import BSMappingPage from "./components/mapping/BSMappingPage";
import PLMappingPage from "./components/mapping/PLMappingPage";
import AutoIntegrationPage from "./components/integration/AutoIntegrationPage";
import ManualIntegrationPage from "./components/integration/ManualIntegrationPage";
import HistoryPage from "./components/integration/HistoryPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mapping/bs" element={<BSMappingPage />} />
          <Route path="/mapping/pl" element={<PLMappingPage />} />
          <Route path="/integration/auto" element={<AutoIntegrationPage />} />
          <Route path="/integration/manual" element={<ManualIntegrationPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
