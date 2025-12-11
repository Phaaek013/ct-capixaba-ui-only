import Link from "next/link";
import { Bell } from "lucide-react";
import clsx from "clsx";

type NotificationBellProps = {
  href: string;
  unreadCount: number;
};

export function NotificationBell({ href, unreadCount }: NotificationBellProps) {
  const hasUnread = unreadCount > 0;
  const displayCount = unreadCount > 9 ? "9+" : unreadCount.toString();

  return (
    <Link
      href={href}
      className={clsx(
        "relative inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 transition",
        "hover:border-zinc-500 hover:bg-zinc-800"
      )}
      aria-label={hasUnread ? `Você tem ${unreadCount} notificações` : "Sem novas notificações"}
    >
      <Bell className="h-4 w-4" />
      {hasUnread && (
        <span className="ml-2 rounded-full bg-orange-500 px-2 text-xs font-medium text-black">
          {displayCount}
        </span>
      )}
    </Link>
  );
}
