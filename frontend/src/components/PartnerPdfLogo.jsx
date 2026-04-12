import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL || ""}/pdf.worker.min.mjs`;

/**
 * PDF első oldalának kirajzolása canvasra.
 *
 * Rugalmasabb használat:
 * - wrapperClassName: külső doboz stílusa
 * - canvasClassName: canvas stílusa
 * - fallbackClassName: fallback szöveg stílusa
 * - width / height: opcionális fix méret
 * - maxWidthPx / maxHeightPx: opcionális maximum render méret
 * - fit: contain / cover jellegű skálázás
 */
export default function PartnerPdfLogo({
  pdfUrl,
  label,
  width,
  height,
  maxWidthPx = 140,
  maxHeightPx = 36,
  fit = "contain", // "contain" | "cover"
  wrapperClassName = "",
  canvasClassName = "",
  fallbackClassName = "",
  dprCap = 2,
  renderScaleCap = 3,
}) {
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || !pdfUrl) return undefined;

    setFailed(false);

    const loadingTask = getDocument({ url: pdfUrl });

    loadingTask.promise
      .then((pdf) => {
        if (cancelled) return null;
        return pdf.getPage(1);
      })
      .then((page) => {
        if (!page || cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });

        const targetWidth = width ?? maxWidthPx ?? baseViewport.width;
        const targetHeight = height ?? maxHeightPx ?? baseViewport.height;

        const widthScale = targetWidth / baseViewport.width;
        const heightScale = targetHeight / baseViewport.height;

        const rawScale =
          fit === "cover"
            ? Math.max(widthScale, heightScale)
            : Math.min(widthScale, heightScale);

        const scale = Math.min(rawScale, renderScaleCap);
        const viewport = page.getViewport({ scale });

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          if (!cancelled) setFailed(true);
          return;
        }

        const dpr =
          Math.min(
            typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
            dprCap
          );

        const renderedWidth = Math.floor(viewport.width);
        const renderedHeight = Math.floor(viewport.height);

        canvas.width = Math.floor(renderedWidth * dpr);
        canvas.height = Math.floor(renderedHeight * dpr);
        canvas.style.width = `${renderedWidth}px`;
        canvas.style.height = `${renderedHeight}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, renderedWidth, renderedHeight);

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
  }, [
    pdfUrl,
    width,
    height,
    maxWidthPx,
    maxHeightPx,
    fit,
    dprCap,
    renderScaleCap,
  ]);

  if (failed) {
    return (
      <div className={wrapperClassName}>
        <span
          className={
            fallbackClassName ||
            "text-center text-[0.7rem] font-semibold leading-tight text-lightBlue"
          }
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className={canvasClassName || "block h-auto max-w-full"}
      />
    </div>
  );
}