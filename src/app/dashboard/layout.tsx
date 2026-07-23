"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import KycVerificationCard from "@/frontend/components/KycVerificationCard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const user = session?.user as any;
  
  if (user?.role === "TEACHER") {
    if (user?.forcePasswordChange) {
      router.push("/auth/force-reset");
    } else {
      router.push("/teacher/dashboard");
    }
    return null;
  }

  const isPendingKyc = user?.role === "STUDENT" && user?.kycStatus !== "APPROVED";

  const navLinks = [
    { name: "Leaderboard", path: "/dashboard", show: true },
    { name: "Review Teachers", path: "/dashboard/teachers", show: user?.role === "STUDENT", locked: isPendingKyc },
    { name: "My Inbox", path: "/dashboard/inbox", show: user?.role === "STUDENT", locked: isPendingKyc },
    { name: "Admin Panel", path: "/dashboard/admin", show: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="MBMAN Logo" className="h-8 w-8 object-contain" />
          <div className="font-black text-xl bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">MBMAN</div>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 hover:text-blue-600 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100 hidden md:flex">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="MBMAN Logo" className="h-8 w-8 object-contain" />
            <div className="font-black text-2xl bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent tracking-tight">MBMAN</div>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {navLinks.filter(link => link.show).map(link => {
            const isActive = pathname === link.path;
            return (
              <div key={link.path} className="relative group">
                <Link 
                  href={link.locked ? "#" : link.path}
                  onClick={(e) => {
                    if (link.locked) {
                      e.preventDefault();
                      alert("This feature unlocks after admin verification.");
                    } else {
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    isActive 
                      ? "bg-blue-50 text-blue-700" 
                      : link.locked 
                        ? "text-slate-400 cursor-not-allowed hover:bg-slate-50" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {link.name}
                  {link.locked && <span className="ml-auto text-xs">🔒</span>}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col">
            <span className="text-sm font-bold text-slate-800 truncate">{user?.name || user?.email}</span>
            <span className="text-xs font-bold text-blue-600 tracking-wider mt-1">{user?.role}</span>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="mt-3 text-xs bg-white hover:bg-red-50 hover:text-red-600 text-slate-500 py-2 rounded-lg font-bold transition-colors w-full border border-slate-200 hover:border-red-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen pt-16 md:pt-0 w-full overflow-x-hidden relative">
        <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
          {isPendingKyc ? (
            <KycVerificationCard currentStatus={user?.kycStatus || "PENDING"} />
          ) : (
            children
          )}
        </div>
      </main>

    </div>
  );
}
