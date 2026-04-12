import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL || ""}/pdf.worker.min.mjs`;

/**
 * PDF logó első oldalának kirajzolása canvasra (lábléc / partner sor).
 */
export default function PartnerPdfLogo({
  pdfUrl,
  label,
  maxHeightPx = 36,
  maxWidthPx = 140,
}) {
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const loadingTask = getDocument({ url: pdfUrl });

    loadingTask.promise
      .then((pdf) => {
        if (cancelled) return null;
        return pdf.getPage(1);
      })
      .then((page) => {
        if (!page || cancelled) return undefined;

        const base = page.getViewport({ scale: 1 });
        const scale = Math.min(
          maxWidthPx / base.width,
          maxHeightPx / base.height,
          2.5,
        );
        const viewport = page.getViewport({ scale });

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          if (!cancelled) setFailed(true);
          return undefined;
        }

        const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
        const w = Math.floor(viewport.width);
        const h = Math.floor(viewport.height);

        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });

        return renderTask.promise;
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      loadingTask.destroy();
    };
  }, [pdfUrl, maxHeightPx, maxWidthPx]);

  if (failed) {
    return (
      <span className="text-center text-[0.65rem] font-semibold leading-tight text-lightBlue">
        {label}
      </span>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className="block max-h-9 w-auto max-w-[140px] object-contain"
    />
  );
}
