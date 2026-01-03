"use client";
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="landing-page">
      <style jsx global>{`
        .landing-page {
          font-family: "Inter", system-ui, -apple-system, sans-serif;
        }

        .landing-page * {
          font-family: inherit;
        }

        /* Override the grid pattern from main app */
        .landing-page .grid-pattern {
          display: none !important;
        }

        /* Smooth scrolling for landing page */
        .landing-page {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar for landing page */
        .landing-page ::-webkit-scrollbar {
          width: 10px;
        }

        .landing-page ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .landing-page ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 5px;
        }

        .landing-page ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      {children}
    </div>
  );
}
