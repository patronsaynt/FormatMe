// Imported first so its returning-user check reads only state carried over from
// previous sessions, before the other persisted stores write this session.
import { useOnboarding } from "./store/onboardingStore";
import { useEffect } from "react";
import { Onboarding } from "./components/onboarding/Onboarding";
import { TopBar } from "./components/toolbar/TopBar";
import { EditorPane } from "./components/editor/EditorPane";
import { PreviewPane } from "./components/preview/PreviewPane";
import { Sidebar } from "./components/sidebar/Sidebar";
import { GlobalProfileModal } from "./components/profile/GlobalProfileModal";
import { EmptyState } from "./components/EmptyState";
import { useUI, applyTheme } from "./store/uiStore";
import { useProjects } from "./store/projectsStore";

export default function App() {
  const theme = useUI((s) => s.theme);
  const hasProjects = useProjects((s) => s.projects.length > 0);
  const onboarded = useOnboarding((s) => s.completed);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  if (!onboarded) return <Onboarding />;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="theme-anim flex min-w-0 flex-1 flex-col bg-surface text-ink">
        {hasProjects ? (
          <>
            <TopBar />
            <main className="grid min-h-0 flex-1 grid-cols-[minmax(420px,1fr)_1.1fr]">
              <div className="min-h-0 overflow-hidden border-r border-line bg-surface">
                <EditorPane />
              </div>
              <div className="min-h-0 overflow-hidden">
                <PreviewPane />
              </div>
            </main>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
      <GlobalProfileModal />
    </div>
  );
}
