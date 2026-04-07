import "./InfiniteGallery.css";

/**
 * InfiniteGallery
 * ----------------
 * Végtelenül scrollozó képgaléria (vízszintes).
 *
 * FONTOS:
 * - A layout + méretek Tailwindben vannak
 * - Az animáció + mask kizárólag erre a komponensre scoped CSS
 */
const images = [
  "/images/kep1.jpg",
  "/images/kep2.jpg",
  "/images/kep3.jpg",
  "/images/kep4.jpg",
  "/images/kep5.jpg",
  "/images/kep6.jpg",
  "/images/kep7.jpg",
  "/images/kep8.jpg",
  "/images/kep9.jpg",
];

export default function InfiniteGallery() {
  return (
    <div
      className="
        w-full
        overflow-hidden
        py-[20px]
        box-border
        bg-gradient-to-b from-lightBlue to-white
      "
    >
      {/* ⬇️ CSAK EZ kap maszkot */}
      <div className="overflow-hidden gallery-mask">
        <div className="flex gallery-track w-max">
          {[...images, ...images].map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`img-${idx}`}
              className="
                w-[240px]
                h-[380px]
                object-cover
                mx-[16px]
                rounded-[17px]
                shadow-[0_4px_10px_rgba(0,0,0,0.2)]
                shrink-0
              "
            />
          ))}
        </div>
      </div>
    </div>
  );
}
