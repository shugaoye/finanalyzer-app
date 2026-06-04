import { useEffect, useRef, useState, type ReactNode } from "react";
import { AIAssistant } from "../ai/AIAssistant";
import "./AppLayout.css";
import { MobileNavBar } from "./MobileNavBar";
import { ResizeHandle } from "./ResizeHandle";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(240);
  const [rightWidth, setRightWidth] = useState(0);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<
    "menu" | "apps" | "search" | "copilot"
  >("apps");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setLeftWidth(0);
        setRightWidth(0);
        setIsRightPanelOpen(false);
      } else {
        setLeftWidth(240);
        setIsMobileSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle left panel resize
  const handleLeftResize = (delta: number) => {
    setLeftWidth((prev) => Math.min(Math.max(prev + delta, 60), 400));
  };

  // Handle right panel resize
  const handleRightResize = (delta: number) => {
    setRightWidth((prev) => Math.min(Math.max(prev - delta, 300), 600));
  };

  // Toggle right panel
  const toggleRightPanel = () => {
    setIsRightPanelOpen((prev) => !prev);
    setRightWidth((prev) => (prev === 0 ? 400 : 0));
  };

  // Expand copilot panel to full width
  const expandCopilot = () => {
    setIsRightPanelOpen(true);
    setRightWidth(600);
  };

  // Minimize copilot panel to normal width
  const minimizeCopilot = () => {
    setRightWidth(400);
  };

  // Toggle expand/minimize copilot panel
  const toggleExpandCopilot = () => {
    if (rightWidth >= 600) {
      minimizeCopilot();
    } else {
      expandCopilot();
    }
  };

  // Handle mobile tab change
  const handleMobileTabChange = (
    tab: "menu" | "apps" | "search" | "copilot",
  ) => {
    setMobileActiveTab(tab);
    if (tab === "menu") {
      setIsMobileSidebarOpen(true);
    } else if (tab === "copilot") {
      setIsRightPanelOpen(true);
      setRightWidth(320);
    } else {
      setIsMobileSidebarOpen(false);
      setIsRightPanelOpen(false);
      setRightWidth(0);
    }
  };

  // Handle sidebar close
  const handleSidebarClose = () => {
    setIsMobileSidebarOpen(false);
    setMobileActiveTab("apps");
  };

  // Close right panel when clicking outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isRightPanelOpen) {
        setIsRightPanelOpen(false);
        setRightWidth(0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRightPanelOpen]);

  return (
    <div
      ref={containerRef}
      className={`app-layout ${isMobile ? "mobile" : ""}`}
      data-left-width={leftWidth}
      data-right-width={rightWidth}
      style={
        {
          "--left-width": `${leftWidth}px`,
          "--right-width": `${rightWidth}px`,
        } as React.CSSProperties
      }
    >
      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <>
          <div
            className="mobile-sidebar-overlay"
            onClick={handleSidebarClose}
          />
          <div className="mobile-sidebar">
            <Sidebar isMobile onClose={handleSidebarClose} />
          </div>
        </>
      )}

      {/* Desktop Left Sidebar */}
      {!isMobile && leftWidth > 0 && (
        <div className="left-panel" style={{ width: `${leftWidth}px` }}>
          <Sidebar />
        </div>
      )}

      {/* Left Resize Handle (Desktop only) */}
      {!isMobile && (
        <ResizeHandle
          direction="horizontal"
          onResize={handleLeftResize}
          onDoubleClick={() =>
            setLeftWidth((prev) => (prev === 240 ? 60 : 240))
          }
        />
      )}

      {/* Main Content */}
      <div className={`middle-panel ${isMobile ? "mobile" : ""}`}>
        {children}
      </div>

      {/* Right AI Panel */}
      {isRightPanelOpen && rightWidth > 0 && (
        <>
          {/* Mobile overlay for copilot */}
          {isMobile && (
            <div
              className="mobile-copilot-overlay"
              onClick={() => {
                setIsRightPanelOpen(false);
                setRightWidth(0);
                setMobileActiveTab("apps");
              }}
            />
          )}
          {!isMobile && (
            <ResizeHandle
              direction="horizontal"
              onResize={handleRightResize}
              onDoubleClick={() => setRightWidth(400)}
            />
          )}
          <div
            className={`right-panel ${isMobile ? "mobile" : ""}`}
            style={{ width: isMobile ? "100%" : `${rightWidth}px` }}
          >
            <AIAssistant
              onClose={() => {
                setIsRightPanelOpen(false);
                setRightWidth(0);
                if (isMobile) {
                  setMobileActiveTab("apps");
                }
              }}
              onToggleExpand={toggleExpandCopilot}
              isExpanded={rightWidth >= 600}
            />
          </div>
        </>
      )}

      {/* Floating Copilot Button (Desktop only) */}
      {!isMobile && !isRightPanelOpen && (
        <button
          type="button"
          title="Open Copilot"
          onClick={toggleRightPanel}
          className="copilot-toggle-btn"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </button>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileNavBar
          activeTab={mobileActiveTab}
          onTabChange={handleMobileTabChange}
        />
      )}
    </div>
  );
}
