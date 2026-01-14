import React from "react";
import InfiniteGallery from "../../../components/InfiniteGallery";

/**
 * GallerySection
 * --------------
 * Galéria blokk – csak wrapper + spacing.
 */
export default function GallerySection() {
  return (
    <section className="w-full ">
      <InfiniteGallery />
    </section>
  );
}
