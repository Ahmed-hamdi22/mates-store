'use client';

import {useRef, useState} from 'react';
import {ArrowRight, ChevronLeft, ChevronRight, ImageIcon} from 'lucide-react';
import Image from 'next/image';

export type HeroSlide = {
  title: string;
  description: string;
  cta: string;
  href: string;
  tone: 'soft' | 'forest' | 'sage';
  imageSrc?: string;
  imageAlt?: string;
};

type HeroSliderProps = {
  slides: HeroSlide[];
  locale: string;
  previousLabel: string;
  nextLabel: string;
  carouselLabel: string;
  slidesLabel: string;
  slideLabels: string[];
  imagePendingLabel: string;
};

export function HeroSlider({
  slides,
  locale,
  previousLabel,
  nextLabel,
  carouselLabel,
  slidesLabel,
  slideLabels,
  imagePendingLabel
}: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const rtl = locale === 'ar';

  const previous = () => setCurrent((index) => (index - 1 + slides.length) % slides.length);
  const next = () => setCurrent((index) => (index + 1) % slides.length);

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 pt-4 sm:px-6 sm:pt-6 lg:px-10" aria-roledescription={carouselLabel} aria-label="Mates Store">
      <div
        className="relative overflow-hidden rounded-2xl border border-border shadow-sm"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const delta = event.changedTouches[0]?.clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(delta) < 50) return;
          if ((delta < 0) !== rtl) next();
          else previous();
        }}
      >
        <div className="relative min-h-[590px] sm:min-h-[650px] lg:min-h-[610px]">
          {slides.map((slide, index) => {
            const active = index === current;
            return (
              <article
                key={slide.title}
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${slides.length}`}
                aria-hidden={!active}
                inert={!active}
                className={`hero-stage hero-stage--${slide.tone} absolute inset-0 grid grid-rows-[auto_1fr] transition-opacity duration-500 motion-reduce:transition-none lg:grid-cols-[0.95fr_1.05fr] lg:grid-rows-1 ${active ? 'z-10 opacity-100' : 'z-0 opacity-0'}`}
              >
                <div className="relative z-10 flex flex-col justify-center px-7 pb-10 pt-12 sm:px-12 sm:pt-16 lg:px-16 lg:pb-20 lg:pt-14">
                  <span className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.22em] opacity-70 sm:text-xs">
                    Mates Store
                  </span>
                  <h1 className="max-w-[10ch] font-heading text-[clamp(3.25rem,7vw,6.5rem)] font-extrabold leading-[0.95] tracking-[-0.065em] rtl:tracking-normal">
                    <span
                      dir={/^[A-Za-z]/.test(slide.title) ? 'ltr' : undefined}
                      className={rtl && /^[A-Za-z]/.test(slide.title) ? 'inline-block text-right' : 'inline-block'}
                    >
                      {slide.title}
                    </span>
                  </h1>
                  <p className="mt-6 max-w-sm text-base leading-relaxed opacity-80 sm:text-lg">
                    {slide.description}
                  </p>
                  <a
                    href={slide.href}
                    className="hero-cta mt-8 inline-flex min-h-12 w-fit items-center gap-2 rounded-md px-5 text-sm font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current motion-reduce:transform-none"
                  >
                    {slide.cta}
                    <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
                  </a>
                </div>
                <div className="relative min-h-52 overflow-hidden lg:min-h-0">
                  {slide.imageSrc ? (
                    <Image
                      src={slide.imageSrc}
                      alt={slide.imageAlt ?? ''}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1023px) 100vw, 52vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="hero-image-placeholder absolute inset-4 flex items-center justify-center rounded-xl border border-current/15 sm:inset-8 lg:inset-y-12 lg:inset-x-6">
                      <div className="hero-image-placeholder__shape" aria-hidden="true" />
                      <div className="relative flex flex-col items-center gap-3 rounded-lg border border-current/15 bg-background/70 px-5 py-4 text-center text-xs font-medium backdrop-blur-sm dark:bg-background/70">
                        <ImageIcon aria-hidden="true" className="size-5" />
                        <span>{imagePendingLabel}</span>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between bg-background/90 px-5 py-2 text-foreground backdrop-blur-sm sm:px-10 lg:bg-transparent lg:px-16 lg:pb-8 lg:pt-4 dark:lg:bg-background/20">
          <div className="flex items-center gap-3" aria-label={slidesLabel}>
            <span className="text-xs font-semibold tabular-nums">{String(current + 1).padStart(2, '0')}</span>
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={slideLabels[index]}
                aria-current={current === index ? 'true' : undefined}
                className="flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              >
                <span className={`block h-1 rounded-full transition-all motion-reduce:transition-none ${current === index ? 'w-6 bg-current' : 'w-2 bg-current/35'}`} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={previous} aria-label={previousLabel} className="flex size-11 items-center justify-center rounded-md border border-current/30 bg-background/70 transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">
              {rtl ? <ChevronRight aria-hidden="true" className="size-5" /> : <ChevronLeft aria-hidden="true" className="size-5" />}
            </button>
            <button type="button" onClick={next} aria-label={nextLabel} className="flex size-11 items-center justify-center rounded-md border border-current/30 bg-background/70 transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">
              {rtl ? <ChevronLeft aria-hidden="true" className="size-5" /> : <ChevronRight aria-hidden="true" className="size-5" />}
            </button>
          </div>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">{slideLabels[current]}</span>
    </section>
  );
}
