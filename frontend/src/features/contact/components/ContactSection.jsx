import ContactForm from "./ContactForm";
import ContactInfoCard from "./ContactInfoCard";
import { CONTACT_INFO_CARDS } from "../utils/contact.constants";

export default function ContactSection() {
  return (
    <section
      id="kapcsolat"
      className="relative bg-gradient-to-b from-[#25AEE4] via-[#22A8DC] to-white px-5 py-24 text-[#101820]"
    >
      <div className="pointer-events-none absolute -left-28 -top-24 h-80 w-80 rounded-full bg-white/15" />
      <div className="pointer-events-none absolute -right-28 bottom-12 h-72 w-72 rounded-full bg-white/20" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <span className="mb-4 inline-block text-xs font-black uppercase tracking-[0.28em] text-white">
            Kapcsolat
          </span>

          <h2 className="max-w-xl text-4xl font-black leading-tight text-[#101820] md:text-5xl">
            Kérdésed van a Smash bajnoksággal kapcsolatban?
          </h2>

          <p className="mt-6 max-w-xl text-base font-semibold leading-8 text-[#101820]/75 md:text-lg">
            Írj nekünk bátran, ha érdekel a pályafoglalás, a versenyjelentkezés,
            a csütörtöki bajnokság vagy bármilyen strandsportos program.
          </p>

          <div className="mt-8 grid gap-4">
            {CONTACT_INFO_CARDS.map((card) => (
              <ContactInfoCard
                key={card.title}
                title={card.title}
                text={card.text}
                icon={card.icon}
              />
            ))}
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}