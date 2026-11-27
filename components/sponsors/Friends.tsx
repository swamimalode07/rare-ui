import { cn } from "@/lib/utils";
import { MotionVideoLogo, type LogoProps } from "@/components/logos";
import { CARD } from "@/components/sponsors/SponsorCards";

type Friend = {
  name: string;
  href: string;
  logo: (props: LogoProps) => React.ReactElement;
};

export const FRIENDS: Friend[] = [
  {
    name: "MotionVideo",
    href: "https://motionvideo.xyz/?utm_source=rareui&utm_medium=referral&utm_campaign=friends",
    logo: MotionVideoLogo,
  },
];

export function FriendsGroup() {
  return (
    <div className="flex w-full flex-col gap-4">
      <h2 className="text-center font-runde text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Friends
      </h2>
      <div className="flex w-full flex-wrap justify-center gap-4">
        {FRIENDS.map((friend) => (
          <a
            key={friend.name}
            href={friend.href}
            target="_blank"
            rel="noopener"
            data-track="friend_click"
            data-friend={friend.name}
            className={cn(CARD, "h-16 sm:h-20 sm:w-[calc((100%-3rem)/4)]")}
          >
            <friend.logo className="h-4 w-auto max-w-full sm:h-4.5" />
          </a>
        ))}
      </div>
    </div>
  );
}
