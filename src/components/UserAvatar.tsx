import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { IconUser } from "./icons";

export const UserAvatar = ({ size = 42 }: { size?: number }) => {
  const { user, profile, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const photo = profile?.photo ?? user?.photoURL;

  const style = { width: size, height: size };

  if (loading) {
    return <div className="animate-pulse rounded-full bg-white/10" style={style} aria-hidden />;
  }

  if (photo) {
    return (
      <Link to="/account" aria-label="Your account" className="shrink-0">
        <img
          src={photo}
          alt=""
          style={style}
          className="rounded-full border border-line object-cover"
          referrerPolicy="no-referrer"
        />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (user ? navigate("/account") : void signIn())}
      aria-label={user ? "Your account" : "Sign in"}
      className="grid shrink-0 place-items-center rounded-full border border-line bg-white/5 text-white/70 transition hover:text-white"
      style={style}
    >
      <IconUser size={size * 0.5} />
    </button>
  );
};
