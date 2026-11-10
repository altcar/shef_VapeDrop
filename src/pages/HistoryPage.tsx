import { Link } from "react-router-dom";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { useDeposits } from "@/hooks/useDeposits";
import { Screen, SectionHeading } from "@/components/Screen";
import { TopBar } from "@/components/TopBar";
import { DepositRow } from "@/components/DepositRow";
import { EmptyState, Skeleton } from "@/components/Feedback";

export const HistoryPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { bins } = useAppData();
  const { deposits, loading } = useDeposits(user?.uid ?? null, 50);

  const binNames = new Map(bins.map((bin) => [bin.id, bin.name]));

  return (
    <Screen>
      <TopBar back title="Deposit history" subtitle={user ? "Every vape you have dropped off" : "Sign in to see your history"} />

      <main className="space-y-4 px-4 pt-4">
        {!authLoading && !user ? (
          <EmptyState
            title="No account yet"
            description="Sign in to keep a record of each deposit and the points it earned."
            action={
              <Link to="/account" className="btn-primary px-4 py-2 text-xs">
                Sign in
              </Link>
            }
          />
        ) : loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[64px] w-full" />
            <Skeleton className="h-[64px] w-full" />
            <Skeleton className="h-[64px] w-full" />
          </div>
        ) : deposits.length === 0 ? (
          <EmptyState
            title="Nothing logged yet"
            description="Your first deposit will appear here with the bin name, the time and the points awarded."
            action={
              <Link to="/find" className="btn-primary px-4 py-2 text-xs">
                Find a bin
              </Link>
            }
          />
        ) : (
          <section>
            <SectionHeading
              title={`${deposits.length} deposit${deposits.length === 1 ? "" : "s"}`}
              hint="Newest first"
            />
            <div className="space-y-2">
              {deposits.map((deposit) => (
                <DepositRow
                  key={deposit.id}
                  deposit={deposit}
                  binName={deposit.binId ? (binNames.get(deposit.binId) ?? null) : null}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </Screen>
  );
};
