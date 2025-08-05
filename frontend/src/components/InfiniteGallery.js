import "./InfiniteGallery.css";

const images = [
  "/images/kep1.jpg",
  "/images/kep2.jpg",
  "/images/kep3.jpg",
  "/images/kep4.jpg",
  "/images/kep5.jpg",
  "/images/kep6.jpg",
  "/images/kep7.jpg",
  "/images/kep8.jpg",
  "/images/kep9.jpg"
];

export default function InfiniteGallery() {
  return (
    <div className="gallery-container">
      <div className="gallery-track">
        {[...images, ...images].map((src, idx) => (
          <img key={idx} src={src} alt={`img-${idx}`} className="gallery-image" />
        ))}
      </div>
    </div>
  );
}