"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";

type SetView = (view: string) => void;
import { Drawer } from "vaul";
import useMeasure from "react-use-measure";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";


export default function FamilyDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState("default");
    const [elementRef, bounds] = useMeasure();
    const previousHeightRef = useRef<number | null>(null);

    const content = useMemo(() => {
        switch (view) {
            case "default":
                return <DefaultView setView={setView} />;
            case "remove":
                return <RemoveWallet setView={setView} />;
            case "phrase":
                return <Phrase setView={setView} />;
            case "key":
                return <Key setView={setView} />;
        }
    }, [view]);

    const opacityDuration = useMemo(() => {
        const MIN_DURATION = 0.15;
        const MAX_DURATION = 0.27;

        if (!previousHeightRef.current) {
            previousHeightRef.current = bounds.height;
            return MIN_DURATION;
        }

        const heightDifference = Math.abs(
            bounds.height - previousHeightRef.current,
        );
        previousHeightRef.current = bounds.height;

        const duration = Math.min(
            Math.max(heightDifference / 500, MIN_DURATION),
            MAX_DURATION,
        );

        return duration;
    }, [bounds.height]);

    return (
        <>
            <button
                className="focus-visible:shadow-focus-ring-button absolute top-1/2 left-1/2 h-[44px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white px-4 py-2 font-medium text-black transition-colors hover:bg-[#F9F9F8] md:font-medium"
                onClick={() => setIsOpen(true)}
                style={{ fontFamily: "var(--font-open-runde)" }}
            >
                Try it out
            </button>
            <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay
                        className="fixed inset-0 z-[60] bg-black/30"
                        onClick={() => setIsOpen(false)}
                    />
                    <Drawer.Content
                        asChild
                        className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-[361px] overflow-hidden rounded-[36px] bg-[#FEFFFE] outline-hidden md:mx-auto md:w-full"
                    >
                        <motion.div animate={{ height: bounds.height }}>
                            <Drawer.Close asChild>
                                <button
                                    data-vaul-no-drag=""
                                    className="focus-visible:shadow-focus-ring-button absolute top-7 right-8 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F8F9] text-[#949595] transition-transform focus:scale-95 active:scale-75"
                                >
                                    <CloseIcon />
                                </button>
                            </Drawer.Close>
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={view}
                                    transition={{
                                        duration: opacityDuration,
                                        ease: [0.26, 0.08, 0.25, 1],
                                    }}
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    ref={elementRef}
                                    className="px-6 pt-2.5 pb-8 antialiased"
                                    style={{ fontFamily: "var(--font-open-runde)" }}
                                >
                                    {content}
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </>
    );
}


export function Button({
    children,
    onClick,
}: {
    children: ReactNode;
    onClick?: () => void;
}) {
    return (
        <button
            data-vaul-no-drag=""
            className="focus-visible:shadow-focus-ring-button flex h-12 w-full items-center gap-[15px] rounded-[16px] bg-[#F7F8F9] px-4 text-[17px] font-semibold text-[#222222] transition-transform focus:scale-95 active:scale-95 md:font-medium"
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export function SecondaryButton({
    children,
    onClick,
    className,
}: {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
}) {
    return (
        <button
            data-vaul-no-drag=""
            className={clsx(
                "focus-visible:shadow-focus-ring-button flex h-12 w-full items-center justify-center gap-[15px] rounded-full text-center text-[19px] font-semibold transition-transform focus:scale-95 active:scale-95 md:font-medium",
                className,
            )}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export function Header({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: ReactNode;
    description: ReactNode;
}) {
    return (
        <header className="mt-[21px]">
            {icon}
            <h2 className="mt-2.5 text-[22px] font-semibold text-[#222222] md:font-medium">
                {title}
            </h2>

            <p className="mt-3 text-[17px] leading-[24px] font-medium text-[#999999] md:font-normal">
                {description}
            </p>
        </header>
    );
}

export function Phrase({ setView }: { setView: SetView }) {
    return (
        <div>
            <div className="px-2">
                <Header
                    icon={<RecoveryPhraseIcon />}
                    title="Secret Recovery Phrase"
                    description="Your Secret Recovery Phrase is the key used to back up your wallet. Keep it secret at all times."
                />
                <ul className="mt-6 space-y-4 border-t border-[#F5F5F5] pt-6">
                    <li className="flex items-center gap-3 text-[15px] font-semibold text-[#999999] md:font-medium">
                        <ShieldIcon />
                        Keep your Secret Phrase safe
                    </li>
                    <li className="flex items-center gap-3 text-[15px] font-semibold text-[#999999] md:font-medium">
                        <PassIcon />
                        Don’t share it with anyone else
                    </li>
                    <li className="flex items-center gap-3 text-[15px] font-semibold text-[#999999] md:font-medium">
                        <BannedIcon />
                        If you lose it, we can’t recover it
                    </li>
                </ul>
            </div>
            <div className="mt-7 flex gap-4">
                <SecondaryButton
                    onClick={() => setView("default")}
                    className="bg-[#F0F2F4] text-[#222222]"
                >
                    Cancel
                </SecondaryButton>
                <SecondaryButton
                    onClick={() => setView("default")}
                    className="bg-[#4DAFFF] text-[#FFFFFF]"
                >
                    <FaceIDIcon />
                    Reveal
                </SecondaryButton>
            </div>
        </div>
    );
}

export function Key({ setView }: { setView: SetView }) {
    return (
        <div>
            <div className="px-2">
                <Header
                    icon={<RecoveryPhraseIcon />}
                    title="Private Key"
                    description="Your Private Key is the key used to back up your wallet. Keep it
			  secret and secure at all times."
                />
                <ul className="mt-6 space-y-4 border-t border-[#F5F5F5] pt-6">
                    <li className="flex items-center gap-3 text-[15px] font-semibold text-[#999999] md:font-medium">
                        <ShieldIcon />
                        Keep your private key safe
                    </li>
                    <li className="flex items-center gap-3 text-[15px] font-semibold text-[#999999] md:font-medium">
                        <PassIcon />
                        Don’t share it with anyone else
                    </li>
                    <li className="flex items-center gap-3 text-[15px] font-semibold text-[#999999] md:font-medium">
                        <BannedIcon />
                        If you lose it, we can’t recover it
                    </li>
                </ul>
            </div>
            <div className="mt-7 flex gap-4">
                <SecondaryButton
                    onClick={() => setView("default")}
                    className="bg-[#F0F2F4] text-[#222222]"
                >
                    Cancel
                </SecondaryButton>
                <SecondaryButton
                    onClick={() => setView("default")}
                    className="bg-[#4DAFFF] text-[#FFFFFF]"
                >
                    <FaceIDIcon />
                    Reveal
                </SecondaryButton>
            </div>
        </div>
    );
}

export function RemoveWallet({ setView }: { setView: SetView }) {
    return (
        <div>
            <div className="px-2">
                <Header
                    icon={<DangerIcon />}
                    title="Are you sure?"
                    description="You haven’t backed up your wallet yet. If you remove it, you could lose access forever. We suggest tapping and backing up your wallet first with a valid recovery method."
                />
                <div className="mt-7 flex gap-4">
                    <SecondaryButton
                        onClick={() => setView("default")}
                        className="bg-[#F0F2F4] text-[#222222]"
                    >
                        Cancel
                    </SecondaryButton>
                    <SecondaryButton
                        onClick={() => setView("default")}
                        className="bg-[#FF3F40] text-[#FFFFFF]"
                    >
                        Continue
                    </SecondaryButton>
                </div>
            </div>
        </div>
    );
}

export function DefaultView({ setView }: { setView: SetView }) {
    return (
        <>
            <header className="mb-4 flex h-[72px] items-center border-b border-[#F7F7F7] pl-2">
                <h2 className="text-[19px] font-semibold text-[#222222] md:font-medium">
                    Options
                </h2>
            </header>
            <div className="space-y-3">
                <Button
                    onClick={() => {
                        setView("key");
                    }}
                >
                    <LockIcon />
                    View Private Key
                </Button>
                <Button
                    onClick={() => {
                        setView("phrase");
                    }}
                >
                    <PhraseIcon />
                    View Recovery Phase
                </Button>
                <button
                    className="focus-visible:shadow-focus-ring-button flex h-12 w-full items-center gap-[15px] rounded-[16px] bg-[#FFF0F0] px-4 text-[17px] font-semibold text-[#FF3F40] transition-transform focus:scale-95 active:scale-95 md:font-medium"
                    onClick={() => {
                        setView("remove");
                    }}
                >
                    <WarningIcon />
                    Remove Wallet
                </button>
            </div>
        </>
    );
}

export function RecoveryPhraseIcon() {
    return (
        <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M16.4517 37C15.0283 36.9773 13.5916 36.9488 12.2178 36.9183C9.16956 36.8506 7.64544 36.8167 6.41564 36.1889C5.31269 35.6258 4.35358 34.6681 3.78881 33.566C3.15908 32.3372 3.12349 30.8373 3.0523 27.8376C3.02068 26.5048 3 25.1888 3 24.0259C3 22.8629 3.02068 21.5469 3.0523 20.2142C3.12349 17.2144 3.15908 15.7145 3.78881 14.4857C4.35358 13.3836 5.31269 12.4259 6.41564 11.8628C7.64544 11.235 9.16959 11.2011 12.2179 11.1334C15.4835 11.0609 19.1045 11 22.0566 11C25.6932 11 30.345 11.0924 34.0971 11.1852C35.0534 11.2088 35.5316 11.2206 35.9699 11.2967C38.4232 11.7225 40.436 13.7225 40.8775 16.173C40.9564 16.6107 40.9709 17.078 41 18.0126V18.0126V18.5916"
                stroke="#999999"
                strokeWidth="2.75"
                strokeLinecap="round"
            />
            <path
                d="M10 24.0001H19"
                stroke="#999999"
                strokeWidth="2.75"
                strokeLinecap="round"
            />
            <path
                d="M10 30H16"
                stroke="#999999"
                strokeWidth="2.75"
                strokeLinecap="round"
            />
            <path
                d="M36.8607 32.1238C36.8607 34.2665 35.1086 36.0036 32.9472 36.0036C30.7859 36.0036 29.0337 34.2665 29.0337 32.1238C29.0337 29.981 30.7859 28.2439 32.9472 28.2439C35.1086 28.2439 36.8607 29.981 36.8607 32.1238Z"
                stroke="#999999"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M21.009 33.4638C20.6293 32.6114 20.6293 31.636 21.009 30.7836C23.0327 26.241 27.6168 23.0708 32.9478 23.0708C38.2788 23.0708 42.8629 26.2411 44.8866 30.7837C45.2664 31.6361 45.2664 32.6115 44.8866 33.4639C42.8629 38.0065 38.2788 41.1767 32.9478 41.1767C27.6168 41.1767 23.0327 38.0064 21.009 33.4638Z"
                stroke="#999999"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function ShieldIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.08654 6.41197C3.13639 5.95634 3.5287 5.62685 3.98583 5.59345C6.79146 5.38847 9.00727 4.30249 11.0607 2.59943C11.4593 2.26879 12.0405 2.26879 12.4391 2.59944C14.4925 4.30249 16.7083 5.38846 19.5139 5.59345C19.9711 5.62685 20.3634 5.95638 20.4132 6.41203C20.4704 6.93468 20.4998 7.46586 20.4998 8.00402C20.4998 13.9495 17.4683 19.0446 12.4223 21.1815C11.9928 21.3634 11.507 21.3634 11.0775 21.1815C6.03148 19.0446 3 13.9495 3 8.00402C3 7.46584 3.02936 6.93464 3.08654 6.41197Z"
                stroke="#A5A5A5"
                strokeWidth="2"
            />
            <path
                d="M8.49097 11.7295L10.8281 14.0359L15.5023 9.4232"
                stroke="#A5A5A5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function PassIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M1.75 12L2.75 12L1.75 12ZM12 20.25L12 21.25L12 20.25ZM5.15863 20.1131L5.19061 19.1136L5.15863 20.1131ZM22.1376 7.15748L23.1369 7.11999L22.1376 7.15748ZM2.86171 16.805C2.80378 15.2613 2.75 13.4384 2.75 12L0.75 12C0.75 13.4772 0.804975 15.3306 0.863116 16.88L2.86171 16.805ZM2.75 12C2.75 10.5616 2.80378 8.73874 2.86171 7.19498L0.863117 7.11999C0.804975 8.66944 0.75 10.5228 0.75 12L2.75 12ZM5.19061 4.88636C7.25799 4.82021 9.93991 4.75 12 4.75L12 2.75C9.90598 2.75 7.1972 2.82114 5.12666 2.88738L5.19061 4.88636ZM12 4.75C14.0601 4.75 16.742 4.82021 18.8094 4.88636L18.8733 2.88738C16.8028 2.82114 14.094 2.75 12 2.75L12 4.75ZM21.1383 7.19498C21.1962 8.73874 21.25 10.5616 21.25 12L23.25 12C23.25 10.5228 23.195 8.66944 23.1369 7.11999L21.1383 7.19498ZM21.25 12C21.25 13.4384 21.1962 15.2613 21.1383 16.805L23.1369 16.88C23.195 15.3306 23.25 13.4772 23.25 12L21.25 12ZM18.8094 19.1136C16.742 19.1798 14.0601 19.25 12 19.25L12 21.25C14.094 21.25 16.8028 21.1789 18.8733 21.1126L18.8094 19.1136ZM12 19.25C9.93991 19.25 7.25799 19.1798 5.19061 19.1136L5.12666 21.1126C7.1972 21.1789 9.90598 21.25 12 21.25L12 19.25ZM2.86171 7.19498C2.90906 5.93324 3.92285 4.92692 5.19061 4.88636L5.12666 2.88738C2.81454 2.96136 0.950076 4.80253 0.863117 7.11999L2.86171 7.19498ZM0.863116 16.88C0.950076 19.1975 2.81454 21.0386 5.12666 21.1126L5.19061 19.1136C3.92285 19.0731 2.90906 18.0668 2.86171 16.805L0.863116 16.88ZM21.1383 16.805C21.0909 18.0668 20.0772 19.0731 18.8094 19.1136L18.8733 21.1126C21.1855 21.0386 23.0499 19.1975 23.1369 16.88L21.1383 16.805ZM18.8094 4.88636C20.0772 4.92692 21.0909 5.93324 21.1383 7.19498L23.1369 7.11999C23.0499 4.80253 21.1855 2.96136 18.8733 2.88738L18.8094 4.88636Z"
                fill="#A5A5A5"
            />
            <rect
                x="5.49951"
                y="7.12207"
                width="5.85"
                height="1.95"
                rx="0.975"
                fill="#A5A5A5"
            />
            <rect
                x="5.49951"
                y="11.0234"
                width="5.85"
                height="1.95"
                rx="0.975"
                fill="#A5A5A5"
            />
            <rect
                x="5.49951"
                y="14.9248"
                width="5.85"
                height="1.95"
                rx="0.975"
                fill="#A5A5A5"
            />
            <rect
                x="12.6504"
                y="7.12207"
                width="5.85"
                height="1.95"
                rx="0.975"
                fill="#A5A5A5"
            />
            <rect
                x="12.6504"
                y="11.0234"
                width="5.85"
                height="1.95"
                rx="0.975"
                fill="#A5A5A5"
            />
            <rect
                x="12.6504"
                y="14.9248"
                width="5.85"
                height="1.95"
                rx="0.975"
                fill="#A5A5A5"
            />
        </svg>
    );
}

export function BannedIcon() {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 2.99976C7.02944 2.99976 3 7.02919 3 11.9998C3 16.9703 7.02944 20.9998 12 20.9998C16.9706 20.9998 21 16.9703 21 11.9998C21 7.02919 16.9706 2.99976 12 2.99976Z"
                stroke="#A5A5A5"
                strokeWidth="2.2"
            />
            <path
                d="M5.63599 5.63602L18.3639 18.3639"
                stroke="#A5A5A5"
                strokeWidth="2.2"
            />
        </svg>
    );
}

export function FaceIDIcon() {
    return (
        <svg
            width="20"
            height="19"
            viewBox="0 0 20 19"
            fill="none"
            className="mr-[-4px]"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M1.66382 6.44434C1.00513 6.44434 0.634033 6.07324 0.634033 5.396V3.16016C0.634033 1.11914 1.72876 0.0429688 3.77905 0.0429688H6.01489C6.69214 0.0429688 7.06323 0.404785 7.06323 1.07275C7.06323 1.74072 6.69214 2.11182 6.01489 2.11182H3.95532C3.13892 2.11182 2.70288 2.52002 2.70288 3.37354V5.396C2.70288 6.07324 2.34106 6.44434 1.66382 6.44434ZM18.1497 6.44434C17.4817 6.44434 17.1106 6.07324 17.1106 5.396V3.37354C17.1106 2.52002 16.6653 2.11182 15.8582 2.11182H13.7986C13.1213 2.11182 12.7502 1.74072 12.7502 1.07275C12.7502 0.404785 13.1213 0.0429688 13.7986 0.0429688H16.0344C18.094 0.0429688 19.1794 1.12842 19.1794 3.16016V5.396C19.1794 6.07324 18.8176 6.44434 18.1497 6.44434ZM9.16919 10.8696C8.67749 10.8696 8.37134 10.6099 8.37134 10.1738C8.37134 9.80273 8.65894 9.52441 9.03931 9.52441H9.29907C9.37329 9.52441 9.41968 9.47803 9.41968 9.39453V6.47217C9.41968 6.07324 9.68872 5.8042 10.0969 5.8042C10.4958 5.8042 10.7556 6.07324 10.7556 6.47217V9.3667C10.7556 10.3315 10.2268 10.8696 9.25269 10.8696H9.16919ZM6.46021 8.69873C5.99634 8.69873 5.65308 8.36475 5.65308 7.8916V6.62988C5.65308 6.15674 5.99634 5.81348 6.46021 5.81348C6.93335 5.81348 7.26733 6.15674 7.26733 6.62988V7.8916C7.26733 8.36475 6.93335 8.69873 6.46021 8.69873ZM13.3347 8.69873C12.8616 8.69873 12.5183 8.36475 12.5183 7.8916V6.62988C12.5183 6.15674 12.8616 5.81348 13.3347 5.81348C13.7986 5.81348 14.1326 6.15674 14.1326 6.62988V7.8916C14.1326 8.36475 13.7986 8.69873 13.3347 8.69873ZM9.86499 13.8848C8.68677 13.8848 7.50854 13.4209 6.77563 12.5767C6.64575 12.4189 6.59009 12.2705 6.59009 12.0942C6.59009 11.7139 6.87769 11.4263 7.25806 11.4263C7.48999 11.4263 7.62915 11.5376 7.79614 11.6953C8.31567 12.2241 9.10425 12.5581 9.86499 12.5581C10.6536 12.5581 11.4421 12.2056 11.9338 11.7046C12.1194 11.5005 12.2585 11.4263 12.4534 11.4263C12.8337 11.4263 13.1306 11.7139 13.1306 12.0942C13.1306 12.2983 13.0657 12.4653 12.9451 12.5859C12.1287 13.4023 10.9875 13.8848 9.86499 13.8848ZM3.77905 18.5884C1.72876 18.5884 0.634033 17.5029 0.634033 15.4712V13.2261C0.634033 12.5581 0.99585 12.187 1.66382 12.187C2.33179 12.187 2.70288 12.5581 2.70288 13.2261V15.2578C2.70288 16.1113 3.13892 16.5195 3.95532 16.5195H6.01489C6.69214 16.5195 7.06323 16.8906 7.06323 17.5493C7.06323 18.2173 6.69214 18.5884 6.01489 18.5884H3.77905ZM13.7986 18.5884C13.1213 18.5884 12.7502 18.2173 12.7502 17.5493C12.7502 16.8906 13.1213 16.5195 13.7986 16.5195H15.8582C16.6653 16.5195 17.1106 16.1113 17.1106 15.2578V13.2261C17.1106 12.5581 17.4724 12.187 18.1497 12.187C18.8083 12.187 19.1794 12.5581 19.1794 13.2261V15.4712C19.1794 17.5029 18.094 18.5884 16.0344 18.5884H13.7986Z"
                fill="white"
            />
        </svg>
    );
}

export function DangerIcon() {
    return (
        <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M22 43C32.4934 43 41 34.4934 41 24C41 13.5066 32.4934 5 22 5C11.5066 5 3 13.5066 3 24C3 34.4934 11.5066 43 22 43Z"
                stroke="#FF3F3F"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M23.55 26.5008L23.9334 14.9989C23.9698 13.9059 23.0936 13 22 13C20.9064 13 20.0302 13.9059 20.0666 14.9989L20.45 26.5008C20.4779 27.3367 21.1636 28 22 28C22.8364 28 23.5221 27.3367 23.55 26.5008Z"
                fill="#FF3F3F"
            />
            <circle cx="21.9866" cy="33.2991" r="1.9866" fill="#FF3F3F" />
        </svg>
    );
}

export function CloseIcon() {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M10.4854 1.99998L2.00007 10.4853"
                stroke="#999999"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10.4854 10.4844L2.00007 1.99908"
                stroke="#999999"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function LockIcon() {
    return (
        <svg
            // Optical alignment
            style={{ transform: "translateY(-1px)" }}
            width="20"
            height="21"
            viewBox="0 0 20 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M6.00024 9V6C6.00024 3.79086 7.79111 2 10.0002 2V2C12.2094 2 14.0002 3.79086 14.0002 6V9"
                stroke="#8F8F8F"
                strokeWidth="2.33319"
            />
            <path
                d="M6.68423 9H13.3163V7H6.68423V9ZM16.0002 11.684V16.316H18.0002V11.684H16.0002ZM13.3163 19H6.68423V21H13.3163V19ZM4.00024 16.316V11.684H2.00024V16.316H4.00024ZM6.68423 19C5.20191 19 4.00024 17.7983 4.00024 16.316H2.00024C2.00024 18.9029 4.09734 21 6.68423 21V19ZM16.0002 16.316C16.0002 17.7983 14.7986 19 13.3163 19V21C15.9032 21 18.0002 18.9029 18.0002 16.316H16.0002ZM13.3163 9C14.7986 9 16.0002 10.2017 16.0002 11.684H18.0002C18.0002 9.09709 15.9032 7 13.3163 7V9ZM6.68423 7C4.09734 7 2.00024 9.09709 2.00024 11.684H4.00024C4.00024 10.2017 5.20191 9 6.68423 9V7Z"
                fill="#8F8F8F"
            />
        </svg>
    );
}

export function WarningIcon() {
    return (
        <svg
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M11.6324 11.2514L11.8827 7.49726C11.9232 6.88978 11.4414 6.37476 10.8325 6.37476C10.2237 6.37476 9.74185 6.88978 9.78235 7.49726L10.0326 11.2514C10.0607 11.6725 10.4105 11.9998 10.8325 11.9998C11.2546 11.9998 11.6043 11.6725 11.6324 11.2514Z"
                fill="#FF3F3F"
            />
            <circle cx="10.8328" cy="14.0623" r="0.9375" fill="#FF3F3F" />
            <path
                d="M8.71062 3.09582C9.7307 1.5843 11.9348 1.5843 12.9549 3.09582C14.1585 4.87924 15.6235 7.09937 16.6453 8.81189C17.6058 10.4217 18.6773 12.4256 19.5531 14.1178C20.416 15.7849 19.2611 17.7558 17.3855 17.8327C15.3163 17.9175 12.8085 17.9994 10.8328 17.9994C8.85699 17.9994 6.34926 17.9175 4.28004 17.8327C2.40438 17.7558 1.24949 15.7849 2.11241 14.1178C2.98825 12.4256 4.05975 10.4217 5.02026 8.81189C6.04203 7.09937 7.50705 4.87924 8.71062 3.09582Z"
                stroke="#FF3F3F"
                strokeWidth="2"
            />
        </svg>
    );
}

export function PhraseIcon() {
    return (
        <svg
            width="24"
            height="20"
            viewBox="0 0 24 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M1.75049 10L2.75049 10L1.75049 10ZM12.0005 18.25L12.0005 19.25L12.0005 18.25ZM5.15912 18.1131L5.1911 17.1136L5.15912 18.1131ZM22.1381 5.15748L23.1374 5.11999L22.1381 5.15748ZM2.8622 14.805C2.80427 13.2613 2.75049 11.4384 2.75049 10L0.750488 10C0.750488 11.4772 0.805463 13.3306 0.863604 14.88L2.8622 14.805ZM2.75049 10C2.75049 8.56162 2.80427 6.73874 2.8622 5.19498L0.863605 5.11999C0.805463 6.66944 0.750488 8.5228 0.750488 10L2.75049 10ZM5.1911 2.88636C7.25848 2.82021 9.9404 2.75 12.0005 2.75L12.0005 0.75C9.90647 0.75 7.19769 0.821136 5.12715 0.887381L5.1911 2.88636ZM12.0005 2.75C14.0606 2.75 16.7425 2.82021 18.8099 2.88636L18.8738 0.887382C16.8033 0.821136 14.0945 0.75 12.0005 0.75L12.0005 2.75ZM21.1388 5.19498C21.1967 6.73874 21.2505 8.56162 21.2505 10L23.2505 10C23.2505 8.5228 23.1955 6.66944 23.1374 5.11999L21.1388 5.19498ZM21.2505 10C21.2505 11.4384 21.1967 13.2613 21.1388 14.805L23.1374 14.88C23.1955 13.3306 23.2505 11.4772 23.2505 10L21.2505 10ZM18.8099 17.1136C16.7425 17.1798 14.0606 17.25 12.0005 17.25L12.0005 19.25C14.0945 19.25 16.8033 19.1789 18.8738 19.1126L18.8099 17.1136ZM12.0005 17.25C9.9404 17.25 7.25848 17.1798 5.1911 17.1136L5.12715 19.1126C7.19769 19.1789 9.90647 19.25 12.0005 19.25L12.0005 17.25ZM2.8622 5.19498C2.90954 3.93324 3.92334 2.92692 5.1911 2.88636L5.12715 0.887381C2.81502 0.961356 0.950565 2.80253 0.863605 5.11999L2.8622 5.19498ZM0.863604 14.88C0.950564 17.1975 2.81502 19.0386 5.12715 19.1126L5.1911 17.1136C3.92334 17.0731 2.90954 16.0668 2.8622 14.805L0.863604 14.88ZM21.1388 14.805C21.0914 16.0668 20.0776 17.0731 18.8099 17.1136L18.8738 19.1126C21.186 19.0386 23.0504 17.1975 23.1374 14.88L21.1388 14.805ZM18.8099 2.88636C20.0776 2.92692 21.0914 3.93324 21.1388 5.19498L23.1374 5.11999C23.0504 2.80253 21.186 0.961356 18.8738 0.887382L18.8099 2.88636Z"
                fill="#8F8F8F"
            ></path>
            <rect
                x="5.5"
                y="5.12207"
                width="5.85"
                height="1.95"
                rx="0.975"
                fill="#8F8F8F"
            ></rect>
            <rect
                x="5.5"
                y="9.02344"
                width="5.85"
                height="1.95"
                rx="0.975"
                fill="#8F8F8F"
            ></rect>
            <rect
                x="5.5"
                y="12.9248"
                width="5.85"
                height="1.95"
                rx="0.975"
                fill="#8F8F8F"
            ></rect>
            <rect
                x="12.6509"
                y="5.12207"
                width="5.85"
                height="1.95"
                rx="0.975"
                fill="#8F8F8F"
            ></rect>
            <rect
                x="12.6509"
                y="9.02344"
                width="5.85"
                height="1.95"
                rx="0.975"
                fill="#8F8F8F"
            ></rect>
            <rect
                x="12.6509"
                y="12.9248"
                width="5.85"
                height="1.95"
                rx="0.975"
                fill="#8F8F8F"
            ></rect>
        </svg>
    );
}

export function CrossIcon() {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M10.4854 1.99998L2.00007 10.4853"
                stroke="#999999"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>
            <path
                d="M10.4854 10.4844L2.00007 1.99908"
                stroke="#999999"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></path>
        </svg>
    );
}