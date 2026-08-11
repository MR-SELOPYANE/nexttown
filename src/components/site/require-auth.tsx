import { Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/store/auth-context";
import type { Role } from "@/lib/domain/types";
import { ROLE_HOME } from "@/lib/domain/roles";
import { Skeleton } from "@/components/ui/skeleton";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96 max-w-full" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

export function RequireRole({ role, children }: { role: Role | Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else {
      const allowed = Array.isArray(role) ? role : [role];
      if (!allowed.includes(user.role)) navigate({ to: ROLE_HOME[user.role] });
    }
  }, [loading, user, navigate, role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96 max-w-full" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role]} />;
  }

  return <>{children}</>;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Skeleton className="h-6 w-48" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={ROLE_HOME[user.role]} />;
  }

  return <>{children}</>;
}
