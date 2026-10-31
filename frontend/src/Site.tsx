import { lazy, Suspense, useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import Landing from "./Landing";
const Workspace = lazy(() => import("./App"));

export default function Site() {
  const [workspace, setWorkspace] = useState(
    location.hash.startsWith("#/workspace"),
  );
  useEffect(() => {
    const change = () => {
      const next = location.hash.startsWith("#/workspace");
      if (workspace !== next) window.scrollTo({ top: 0, behavior: "instant" });
      setWorkspace(next);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, [workspace]);
  useEffect(() => {
    document.title = workspace
      ? "Sauda — Your shopping desk"
      : "Sauda — Voice agents. Reimagined";
  }, [workspace]);
  useEffect(() => {
    if (workspace) return;
    const target = document.getElementById(location.hash.slice(1));
    target?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [workspace]);
  return (
    <MotionConfig reducedMotion="user">
      {workspace ? (
        <Suspense fallback={<main className="ws ws-loading"><p role="status">Loading…</p></main>}>
          <Workspace />
        </Suspense>
      ) : (
        <Landing />
      )}
    </MotionConfig>
  );
}
