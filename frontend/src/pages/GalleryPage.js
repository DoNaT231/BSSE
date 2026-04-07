import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";

const PREVIEW_COUNT = 5;

const MONTH_ORDER = {
  januar: 1,
  februari: 2,
  marcius: 3,
  aprilis: 4,
  majus: 5,
  junius: 6,
  julius: 7,
  augusztus: 8,
  szeptember: 9,
  oktober: 10,
  november: 11,
  december: 12,
};

function normalizeLabel(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function encodePath(path) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function getGroupKey(parts) {
  if (parts.length < 2) return parts[0] ?? "Egyeb";

  const secondPartIsFile = /\.[a-z0-9]+$/i.test(parts[1] ?? "");
  if (/^\d{4}$/.test(parts[0]) && !secondPartIsFile) {
    return `${parts[0]}/${parts[1]}`;
  }

  if (/^\d{4}$/.test(parts[0])) {
    return parts[0];
  }

  return parts.slice(0, 2).join("/");
}

function getGroupSortKey(groupKey) {
  const [first, second] = groupKey.split("/");
  if (!/^\d{4}$/.test(first ?? "")) return { year: 0, month: 0 };

  const monthName = normalizeLabel(second ?? "");
  return {
    year: Number(first),
    month: MONTH_ORDER[monthName] ?? 0,
  };
}

function formatGroupTitle(groupKey) {
  const [year, month] = groupKey.split("/");
  if (!month) return groupKey;
  const monthLabel = month.replace(/^\d{2}-/, "");
  return `${year} ${monthLabel}`;
}

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadManifest() {
      try {
        setIsLoading(true);
        const res = await fetch("/gallery-manifest.json");
        if (!res.ok) throw new Error("Nem sikerult betolteni a galeriat.");

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Hibas galeria adatformatum.");

        if (isMounted) {
          setImages(data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Hiba tortent a galeria betoltesekor.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadManifest();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedImage) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  const groupedEvents = useMemo(() => {
    const groups = new Map();

    images.forEach((relativePath) => {
      const cleanPath = String(relativePath).replace(/^\/+/, "");
      const parts = cleanPath.split("/").filter(Boolean);
      if (parts.length === 0) return;

      const groupKey = getGroupKey(parts);
      const existing = groups.get(groupKey) ?? [];
      existing.push(cleanPath);
      groups.set(groupKey, existing);
    });

    const eventList = Array.from(groups.entries()).map(([groupKey, groupImages]) => ({
      key: groupKey,
      title: formatGroupTitle(groupKey),
      images: groupImages.sort(),
      sort: getGroupSortKey(groupKey),
    }));

    return eventList.sort((a, b) => {
      if (a.sort.year !== b.sort.year) return b.sort.year - a.sort.year;
      if (a.sort.month !== b.sort.month) return b.sort.month - a.sort.month;
      return a.title.localeCompare(b.title, "hu");
    });
  }, [images]);

  return (
    <div className="page-root">
      <Header />

      <main className="page-main overflow-visible">
        <section className="relative">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-[-120px] left-[-80px] h-[280px] w-[280px] rounded-full bg-sky-200/40 blur-3xl" />
            <div className="absolute top-[220px] right-[-80px] h-[280px] w-[280px] rounded-full bg-cyan-200/40 blur-3xl" />
            <div className="absolute bottom-[-120px] left-1/2 h-[240px] w-[240px] -translate-x-1/2 rounded-full bg-blue-100/50 blur-3xl" />
          </div>

          <div className="page-container">
            <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="max-w-2xl">
                <div className="type-kicker">Galéria</div>
                <h1 className="mt-5 type-page-title">
                  BSSE esemenyek
                  <span className="type-page-title-accent">pillanatkepei</span>
                </h1>
                <p className="type-lead">
                  Eseményenként rendezve jelennek meg a képek. Az utolso csempe + jellel
                  nyithato ki az adott blokk osszes fotoja.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Események
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">{groupedEvents.length}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kepek</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">{images.length}</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-sky-300/30 via-cyan-200/20 to-blue-200/30 blur-2xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-3 shadow-[0_30px_80px_-25px_rgba(15,23,42,0.28)]">
                  <img
                    src="/images/tournament_SMASH.jpg"
                    alt="BSSE galeria"
                    className="h-[240px] w-full rounded-[1.4rem] object-cover sm:h-[300px]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-10">
            {isLoading && <p className="text-slate-600">Galeria betoltese...</p>}
            {error && <p className="font-semibold text-red-600">{error}</p>}

            {!isLoading &&
              !error &&
              groupedEvents.map((event) => {
                const isOpen = Boolean(expanded[event.key]);
                const previewImages = event.images.slice(0, PREVIEW_COUNT);
                const hiddenCount = Math.max(event.images.length - PREVIEW_COUNT, 0);
                const visibleImages = isOpen ? event.images : previewImages;

                return (
                  <article
                    key={event.key}
                    className="rounded-[2rem] border border-slate-200 bg-white/95 p-4 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.22)] sm:p-5 lg:p-6"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h2 className="text-2xl font-bold text-slate-900">{event.title}</h2>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-500">{event.images.length} kep</span>
                        {hiddenCount > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpanded((prev) => ({
                                ...prev,
                                [event.key]: !isOpen,
                              }))
                            }
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            {isOpen ? "Összecsukás" : "Összes mutatás"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                      {visibleImages.map((imagePath) => {
                        const thumbSrc = `/images-optimized/small/${encodePath(imagePath)}`;
                        const largeSrc = `/images-optimized/large/${encodePath(imagePath)}`;
                        return (
                          <button
                            key={imagePath}
                            type="button"
                            onClick={() =>
                              setSelectedImage({
                                src: largeSrc,
                                title: event.title,
                              })
                            }
                            className="group block overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                          >
                            <img
                              src={thumbSrc}
                              alt={event.title}
                              loading="lazy"
                              className="h-28 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          </button>
                        );
                      })}

                      {!isOpen && hiddenCount > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((prev) => ({
                              ...prev,
                              [event.key]: true,
                            }))
                          }
                          className="flex h-28 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-3xl font-bold text-slate-600 hover:bg-slate-100"
                          aria-label={`${event.title} osszes kep megjelenitese`}
                        >
                          +{hiddenCount}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 p-4"
          onClick={() => setSelectedImage(null)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-3 py-1 text-xl font-bold text-white hover:bg-black/80"
              aria-label="Kep bezarasa"
            >
              x
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.title}
              className="max-h-[85vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
