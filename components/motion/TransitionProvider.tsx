"use client";

import {
    createContext,
    type CSSProperties,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type TransitionContextValue = {
    navigate: (href: string) => void;
    phase: "idle" | "leaving" | "entering";
};

type GridLayout = {
    columns: number;
    rows: number;
    cellSize: number;
    width: number;
    height: number;
};

type Tile = {
    row: number;
    column: number;
    tone: number;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

const toneLevels = [64, 70, 76, 68];

function createGridLayout(): GridLayout {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const targetCellSize = width < 768 ? 156 : 220;
    const columns = Math.max(4, Math.ceil(width / targetCellSize));
    const rows = Math.max(4, Math.ceil(height / targetCellSize));
    const cellSize = Math.ceil(Math.max(width / columns, height / rows));

    return {
        columns,
        rows,
        cellSize,
        width: columns * cellSize,
        height: rows * cellSize,
    };
}

function createTiles(layout: GridLayout): Tile[] {
    return Array.from({ length: layout.columns * layout.rows }, (_, index) => {
        const row = Math.floor(index / layout.columns);
        const column = index % layout.columns;

        return {
            row,
            column,
            tone: toneLevels[(row + column) % toneLevels.length],
        };
    });
}

function createCollapseOrder(tiles: Tile[]) {
    return tiles
        .map((_, index) => ({
            index,
            distance: Math.random(),
        }))
        .sort((left, right) => left.distance - right.distance)
        .map((item) => item.index);
}

function createTileBackground(tone: number, phase: "idle" | "leaving" | "entering") {
    const phaseTone = phase === "entering"
        ? Math.min(tone + 6, 86)
        : phase === "leaving"
            ? Math.max(tone - 6, 56)
            : tone;
    const primary = `color-mix(in srgb, var(--brand) ${phaseTone}%, var(--bg-strong))`;
    const secondary = phase === "entering"
        ? "color-mix(in srgb, var(--text-inverse) 12%, transparent)"
        : "color-mix(in srgb, var(--brand-hover) 16%, transparent)";

    return `linear-gradient(135deg, ${primary}, ${secondary})`;
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [phase, setPhase] = useState<"idle" | "leaving" | "entering">("idle");
    const [layout, setLayout] = useState<GridLayout | null>(null);
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [tileOrder, setTileOrder] = useState<number[]>([]);
    const [tileDelays, setTileDelays] = useState<number[]>([]);
    const [tileScales, setTileScales] = useState<number[]>([]);
    const [tileGrowScales, setTileGrowScales] = useState<number[]>([]);
    const lastPath = useRef(pathname);
    const navTimeout = useRef<number | null>(null);
    const settleTimeout = useRef<number | null>(null);

    useEffect(() => {
        const updateLayout = () => {
            const nextLayout = createGridLayout();
            const nextTiles = createTiles(nextLayout);
            setLayout(nextLayout);
            setTiles(nextTiles);
            setTileOrder(createCollapseOrder(nextTiles));
            setTileDelays(nextTiles.map(() => Math.floor(Math.random() * 40)));
            setTileScales(nextTiles.map(() => 0.08 + Math.random() * 0.04));
            setTileGrowScales(nextTiles.map(() => 1.04 + Math.random() * 0.12));
        };

        updateLayout();
        window.addEventListener("resize", updateLayout);

        return () => {
            window.removeEventListener("resize", updateLayout);
        };
    }, []);

    const navigate = useCallback(
        (href: string) => {
            if (href === lastPath.current || phase !== "idle" || tiles.length === 0) {
                return;
            }

            const collapseOrder = createCollapseOrder(tiles);
            setTileOrder(collapseOrder);
            setTileDelays(tiles.map(() => Math.floor(Math.random() * 40)));
            setTileScales(tiles.map(() => 0.08 + Math.random() * 0.04));
            setTileGrowScales(tiles.map(() => 1.04 + Math.random() * 0.12));
            setPhase("leaving");
            navTimeout.current = window.setTimeout(() => {
                router.push(href);
            }, 260);
        },
        [phase, router, tiles]
    );

    useEffect(() => {
        if (pathname !== lastPath.current) {
            lastPath.current = pathname;
            const enteringTimer = window.setTimeout(() => {
                setPhase("entering");
            }, 0);
            settleTimeout.current = window.setTimeout(() => {
                setPhase("idle");
            }, 420);

            return () => {
                window.clearTimeout(enteringTimer);
            };
        }

        return () => {
            if (navTimeout.current) {
                window.clearTimeout(navTimeout.current);
            }
            if (settleTimeout.current) {
                window.clearTimeout(settleTimeout.current);
            }
        };
    }, [pathname]);

    useEffect(() => {
        return () => {
            if (navTimeout.current) {
                window.clearTimeout(navTimeout.current);
            }
            if (settleTimeout.current) {
                window.clearTimeout(settleTimeout.current);
            }
        };
    }, []);

    useEffect(() => {
        if (phase !== "idle") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [phase]);

    const value = useMemo(
        () => ({
            navigate,
            phase,
        }),
        [phase, navigate]
    );

    return (
        <TransitionContext.Provider value={value}>
            <div
                className={`c--route-transition${phase === "idle" ? "" : phase === "leaving" ? " is-leaving" : " is-entering"
                    }`}
                aria-hidden="true"
            >
                <div className="c--route-transition__backdrop" />
                {layout ? (
                    <div
                        className="c--route-transition__grid"
                        style={{
                            width: `${layout.width}px`,
                            height: `${layout.height}px`,
                        }}
                    >
                        {tileOrder.map((tileIndex, orderIndex) => {
                            const tile = tiles[tileIndex];
                            const delayOffset = orderIndex * 6 + tileDelays[tileIndex];

                            return (
                                <span
                                    key={`${tile.row}-${tile.column}-${tileIndex}`}
                                    className="c--route-transition__tile"
                                    style={{
                                        ["--tile-index" as never]: orderIndex,
                                        ["--tile-scale" as never]: tileScales[tileIndex],
                                        ["--tile-grow-scale" as never]: tileGrowScales[tileIndex],
                                        gridRowStart: tile.row + 1,
                                        gridColumnStart: tile.column + 1,
                                        transitionDelay: `${delayOffset}ms`,
                                        background: createTileBackground(tile.tone, phase),
                                    } as CSSProperties}
                                />
                            );
                        })}
                    </div>
                ) : null}
            </div>
            {children}
        </TransitionContext.Provider>
    );
}

export function useTransitionNavigate() {
    const context = useContext(TransitionContext);

    if (!context) {
        throw new Error("useTransitionNavigate must be used inside TransitionProvider");
    }

    return context;
}
