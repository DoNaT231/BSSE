import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import SiteFooter from "../components/SiteFooter";

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

/** A régi manifest (2024/Meccsek_...) fájlszáma alapján: 163+ másik esemény (augusztus). */
const LEGACY_2024_MEccsek_AUGUSZTUS_FROM_ID = 163;

function extract2024MeccsekPhotoId(fileName) {
  const m = String(fileName).match(/Meccsek-(\d+)\.[^.]+$/i);
  return m ? parseInt(m[1], 10) : NaN;
}

/** Régi kétlépcsős manifest vagy új 2024/07-julius | 2024/08-augusztus mappa. */
function get2024MeccsekMonthSlug(parts) {
  if (parts[0] !== "2024" || parts.length < 2) return null;

  if (parts.length >= 3 && /^Meccsek_/i.test(parts[2] ?? "")) {
    const folder = parts[1];
    if (folder === "07-julius" || folder === "08-augusztus") return folder;
  }

  const file = parts[1];
  if (!/\.[a-z0-9]+$/i.test(file ?? "") || !String(file).startsWith("Meccsek_")) {
    return null;
  }

  const id = extract2024MeccsekPhotoId(file);
  if (!Number.isFinite(id)) return "07-julius";

  return id >= LEGACY_2024_MEccsek_AUGUSZTUS_FROM_ID ? "08-augusztus" : "07-julius";
}

function webpRelative2024MeccsekFile(fileName, monthSlug) {
  const rest = String(fileName).slice("Meccsek_".length);
  const day = rest.split("_")[0];
  if (!day || !rest) return null;
  const monthFolder = monthSlug === "07-julius" ? "2024 július" : "2024 augusztus";
  return `${monthFolder}/${day}/Meccsek/${rest}`;
}

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

/**
 * A gallery-manifest.json útvonalai nem egyeznek 1:1 a public/webp mappa szerkezetével.
 * Visszaadja a webp/{small|large} alatti relatív útvonalat, vagy null ha nem ismert.
 */
function manifestPathToWebpRelative(manifestPath) {
  const clean = String(manifestPath).replace(/^\/+/, "");
  const parts = clean.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const year = parts[0];
  const second = parts[1];
  const third = parts[2];

  if (year === "2023" && second === "07-julius" && third) {
    const idx = third.indexOf("__");
    if (idx === -1) return null;
    const folderPart = third.slice(0, idx);
    let filePart = third.slice(idx + 2);
    if (
      filePart &&
      !filePart.startsWith("_") &&
      /^DSC/i.test(filePart)
    ) {
      filePart = `_${filePart}`;
    }
    return `${folderPart}/${filePart}`;
  }

  if (year === "2024" && second === "08-augusztus" && parts.length >= 5) {
    const day = parts[2];
    const category = parts[3];
    const file = parts[parts.length - 1];
    const webpFile = file.startsWith("Meccsek_") ? file.slice("Meccsek_".length) : file;
    return `2024 augusztus/${day}/${category}/${webpFile}`;
  }

  if (year === "2024" && parts.length === 3 && (second === "07-julius" || second === "08-augusztus") && third?.startsWith("Meccsek_")) {
    return webpRelative2024MeccsekFile(third, second);
  }

  if (year === "2024" && parts.length === 2 && second.startsWith("Meccsek_")) {
    const slug = get2024MeccsekMonthSlug(parts);
    if (!slug) return null;
    return webpRelative2024MeccsekFile(second, slug);
  }

  if (year === "2025" && second === "07-julius" && third?.startsWith("Meccsek_")) {
    const rest = third.slice("Meccsek_".length);
    return `2025 július/Szombat/Meccsek/${rest}`;
  }

  if (year === "2025" && second === "08-augusztus" && third) {
    return `2025 augusztus/Vasárnap/Meccsek, pillanatképek/${third}`;
  }

  return null;
}

function webpImageSrc(manifestPath, size) {
  const rel = manifestPathToWebpRelative(manifestPath);
  if (!rel) {
    const clean = String(manifestPath).replace(/^\/+/, "");
    return `/images/${encodePath(clean)}`;
  }
  return `/webp/${size}/${encodePath(rel)}`;
}

function getImageSourceCandidates(manifestPath, size) {
  const clean = String(manifestPath).replace(/^\/+/, "");
  const encodedManifestPath = encodePath(clean);
  const mappedRelative = manifestPathToWebpRelative(clean);

  const candidates = [
    `/webp/${size}/${encodedManifestPath}`,
    mappedRelative ? `/webp/${size}/${encodePath(mappedRelative)}` : null,
  ].filter(Boolean);

  // Régi 2024/Meccsek_...: a fájlok gyakran csak egyik hónap mappájában vannak; próbáljuk a másikat is.
  if (/^2024\/Meccsek_/i.test(clean) && mappedRelative) {
    const file = clean.split("/")[1];
    const julyRel = webpRelative2024MeccsekFile(file, "07-julius");
    const augRel = webpRelative2024MeccsekFile(file, "08-augusztus");
    const altRel = mappedRelative === julyRel ? augRel : julyRel;
    if (altRel) {
      candidates.push(`/webp/${size}/${encodePath(altRel)}`);
    }
  }

  candidates.push(
    `/images-optimized/${size}/${encodedManifestPath}`,
    `/images/${encodedManifestPath}`,
  );

  return [...new Set(candidates)];
}

function getGroupKey(parts) {
  if (parts.length < 2) return parts[0] ?? "Egyeb";

  const secondPartIsFile = /\.[a-z0-9]+$/i.test(parts[1] ?? "");
  if (/^\d{4}$/.test(parts[0]) && !secondPartIsFile) {
    return `${parts[0]}/${parts[1]}`;
  }

  if (/^\d{4}$/.test(parts[0])) {
    const slug = get2024MeccsekMonthSlug(parts);
    if (slug) return `2024/${slug}`;
    return parts[0];
  }

  return parts.slice(0, 2).join("/");
}

function getGroupSortKey(groupKey) {
  const [first, second] = groupKey.split("/");
  if (!/^\d{4}$/.test(first ?? "")) return { year: 0, month: 0 };

  const monthSlug = normalizeLabel((second ?? "").replace(/^\d{2}-/, ""));
  return {
    year: Number(first),
    month: MONTH_ORDER[monthSlug] ?? 0,
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
  const [thumbSourceIndex, setThumbSourceIndex] = useState({});
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
    <div className="page-root flex min-h-screen min-w-0 flex-col">
      <Header />

      <main className="page-main min-w-0 flex-1 overflow-visible">
        <section className="relative overflow-x-clip">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-[-120px] left-[-80px] h-[280px] w-[280px] rounded-full bg-lightBlue/25 blur-3xl" />
            <div className="absolute top-[220px] right-[-80px] h-[280px] w-[280px] rounded-full bg-cyan-200/40 blur-3xl" />
            <div className="absolute bottom-[-120px] left-1/2 h-[240px] w-[240px] -translate-x-1/2 rounded-full bg-lightBlue/20 blur-3xl" />
          </div>

          <div className="page-container">
            <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="max-w-2xl">
                <div className="type-kicker">Galéria</div>
                <h1 className="mt-5 type-page-title">
                  SMASH esemenyek
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
                    <p className="mt-1 text-2xl font-extrabold text-brandDark">{groupedEvents.length}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kepek</p>
                    <p className="mt-1 text-2xl font-extrabold text-brandDark">{images.length}</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-lightBlue/25 via-primaryLight/80 to-lightBlue/15 blur-2xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-3 shadow-[0_30px_80px_-25px_rgba(35,31,32,0.28)]">
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
                    className="rounded-[2rem] border border-slate-200 bg-white/95 p-4 shadow-[0_20px_60px_-30px_rgba(35,31,32,0.22)] sm:p-5 lg:p-6"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h2 className="text-2xl font-bold text-brandDark">{event.title}</h2>
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

                    <div className="relative min-w-0 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                      <div
                        className="flex min-h-[13rem] flex-nowrap items-center gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth pb-1 pt-0.5 [scrollbar-color:rgba(148,163,184,0.85)_transparent] [scrollbar-width:thin] snap-x snap-proximity [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80 [&::-webkit-scrollbar-track]:bg-transparent"
                        role="list"
                        aria-label={`${event.title} kepek sora`}
                      >
                        {visibleImages.map((imagePath) => {
                          const thumbCandidates = getImageSourceCandidates(
                            imagePath,
                            "small"
                          );
                          const largeCandidates = getImageSourceCandidates(
                            imagePath,
                            "large"
                          );
                          const currentThumbIndex = thumbSourceIndex[imagePath] ?? 0;
                          const thumbSrc =
                            thumbCandidates[
                              Math.min(currentThumbIndex, thumbCandidates.length - 1)
                            ];
                          return (
                            <button
                              key={imagePath}
                              type="button"
                              role="listitem"
                              onClick={() =>
                                setSelectedImage({
                                  candidates: largeCandidates,
                                  index: 0,
                                  title: event.title,
                                })
                              }
                              className="group inline-flex h-52 max-h-52 shrink-0 snap-start overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-0 transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-lightBlue"
                            >
                              <img
                                src={thumbSrc}
                                alt=""
                                loading="lazy"
                                onError={() => {
                                  if (currentThumbIndex >= thumbCandidates.length - 1)
                                    return;
                                  setThumbSourceIndex((prev) => ({
                                    ...prev,
                                    [imagePath]: currentThumbIndex + 1,
                                  }));
                                }}
                                className="h-52 w-auto object-contain"
                              />
                            </button>
                          );
                        })}

                        {!isOpen && hiddenCount > 0 && (
                          <button
                            type="button"
                            role="listitem"
                            onClick={() =>
                              setExpanded((prev) => ({
                                ...prev,
                                [event.key]: true,
                              }))
                            }
                            className="inline-flex h-52 min-w-[4.75rem] shrink-0 snap-start items-center justify-center rounded-xl border border-dashed border-slate-300/90 bg-white/90 px-3 text-2xl font-bold tracking-tight text-slate-600 shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-lightBlue"
                            aria-label={`${event.title} osszes kep megjelenitese`}
                          >
                            +{hiddenCount}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

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
              src={
                selectedImage.candidates[
                  Math.min(
                    selectedImage.index,
                    selectedImage.candidates.length - 1
                  )
                ]
              }
              alt={selectedImage.title}
              onError={() => {
                setSelectedImage((prev) => {
                  if (!prev) return prev;
                  if (prev.index >= prev.candidates.length - 1) return prev;
                  return { ...prev, index: prev.index + 1 };
                });
              }}
              className="mx-auto max-h-[min(90vh,100dvh)] max-w-full rounded-2xl bg-black/20 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
