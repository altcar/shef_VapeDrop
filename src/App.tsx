import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppDataProvider } from "@/hooks/useAppData";
import { HomePage } from "@/pages/HomePage";
import { RecyclePage } from "@/pages/RecyclePage";
import { RewardsPage } from "@/pages/RewardsPage";
import { AccountPage } from "@/pages/AccountPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Feedback";

// The map bundle (MapLibre) is the heaviest dependency, so it only loads
// when someone actually opens the "find a bin" screen.
const FindPage = lazy(() => import("@/pages/FindPage").then((module) => ({ default: module.FindPage })));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
};

const FindFallback = () => (
  <Screen>
    <div className="space-y-3 px-4 pt-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-[46vh] w-full rounded-3xl" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  </Screen>
);

export const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppDataProvider>
        <ScrollToTop />
        <Suspense fallback={<FindFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/find" element={<FindPage />} />
            <Route path="/recycle" element={<RecyclePage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/account/history" element={<HistoryPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AppDataProvider>
    </AuthProvider>
  </BrowserRouter>
);
