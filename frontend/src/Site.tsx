import { lazy, Suspense, useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { ArrowLeft } from "lucide-react";
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
      : "Sauda — A little talk. A better deal.";
  }, [workspace]);
  return (
    <MotionConfig reducedMotion="user">
      {workspace ? (
        <div className="editorial-workspace">
          <div className="edition-bar">
            <a href="#">
              <ArrowLeft size={13} /> Back to Sauda
            </a>
            <span>
              THE SHOPPING DESK <i> / </i> BUILDATHON EDITION
            </span>
          </div>
          <Suspense
            fallback={
              <div className="loading-screen">Opening your shopping desk…</div>
            }
          >
            <Workspace />
          </Suspense>
        </div>
      ) : (
        <Landing />
      )}
    </MotionConfig>
  );
}
