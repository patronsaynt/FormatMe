import { useEffect } from "react";
import { TopBar } from "./components/toolbar/TopBar";
import { EditorPane } from "./components/editor/EditorPane";
import { PreviewPane } from "./components/preview/PreviewPane";
import { useUI, applyTheme } from "./store/uiStore";

export default function App() {
  const theme = useUI((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="theme-anim flex h-screen flex-col bg-surface text-ink">
      <TopBar />
      <main className="grid min-h-0 flex-1 grid-cols-[minmax(420px,1fr)_1.1fr]">
        <div className="min-h-0 overflow-hidden border-r border-line bg-surface">
          <EditorPane />
        </div>
        <div className="min-h-0 overflow-hidden">
          <PreviewPane />
        </div>
      </main>
    </div>
  );
}
