"use client";
import Image from "next/image";
import { Globe, Layers, Users } from "lucide-react";
import Link from "next/link";
import { getCourseEnrollmentCount } from "@/lib/enrollment-service";
import { getAverageRating } from "@/lib/rating-service";
import { useCallback, useEffect, useState } from "react";
import SaveCourseButton from "./save-course-button";
import StarRating from "../ui/star-rating";

type CourseCardProps = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  lang: string;
  thumbnail_url: string;
  moduleCount: number;
};

const TINTS = ["plastic--thu", "plastic--tue", "plastic--wed", "plastic--mon", "plastic--sun"];

export default function CourseCard({
  id,
  title,
  description,
  difficulty,
  lang,
  thumbnail_url,
  moduleCount,
}: CourseCardProps) {
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const tint = TINTS[[...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TINTS.length];
  const hasCover = Boolean(thumbnail_url) && failedUrl !== thumbnail_url;

  const checkCover = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth === 0) setFailedUrl(thumbnail_url);
  }, [thumbnail_url]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [count, rating] = await Promise.all([
          getCourseEnrollmentCount(id),
          getAverageRating(id),
        ]);
        setEnrollmentCount(count);
        setRatingData(rating);
      } catch (error) {
        console.warn("Failed to fetch course data:", error);
        setEnrollmentCount(0);
        setRatingData({ average: 0, count: 0 });
      }
    };
    fetchData();
  }, [id]);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[14px] border border-rule bg-card shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
      <figure className="course-media relative h-40 w-full overflow-hidden border-b border-rule bg-paper-3">
        {hasCover ? (
          <>
            <Image
              ref={checkCover}
              src={thumbnail_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={false}
              onError={() => setFailedUrl(thumbnail_url)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-shade/35 via-transparent to-transparent" />
          </>
        ) : (
          <div className={`plastic ${tint} absolute inset-0 grid place-items-center rounded-none px-6 pb-10 pt-9`}>
            <p className="line-clamp-2 max-w-[200px] text-center font-display text-[16px] font-bold leading-tight tracking-[-0.02em] text-ink">
              {title}
            </p>
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-paper px-2.5 py-1 text-[11px] font-medium text-ink shadow-[0_1px_0_var(--color-rule)]">
          {difficulty}
        </span>

        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-[6px] bg-ink px-2 py-0.5 font-mono text-[10px] text-paper">
          <Globe className="h-3 w-3" aria-hidden />
          {(lang || "en").toUpperCase()}
        </span>

        <SaveCourseButton
          courseId={id}
          className="absolute right-2.5 top-2.5 z-20 rounded-full bg-paper shadow-[0_1px_0_var(--color-rule)] hover:bg-paper-2"
        />
      </figure>

      <div className="flex flex-1 flex-col gap-2 p-4 pt-3.5">
        <h2 className="line-clamp-2 min-h-[2.75em] font-display text-[17px] leading-snug font-bold tracking-[-0.03em] text-foreground">
          <Link
            href={`/course/${id}`}
            className="block truncate outline-offset-4 after:absolute after:inset-0 after:z-10 after:content-[''] sm:line-clamp-2 sm:whitespace-normal"
          >
            {title}
          </Link>
        </h2>
        <p className="min-h-[2.6em] text-[13px] leading-relaxed text-muted-foreground">
          {description && description.length > 96
            ? `${description.slice(0, 96).trimEnd()}…`
            : description}
        </p>

        <div className="mt-1 flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {enrollmentCount} {enrollmentCount === 1 ? "student" : "students"}
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" aria-hidden />
            {moduleCount} {moduleCount === 1 ? "module" : "modules"}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-rule pt-3">
          {ratingData.count > 0 ? (
            <StarRating rating={ratingData.average} size={14} showValue />
          ) : (
            <span className="text-[11px] text-muted-foreground">Not yet rated</span>
          )}
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-deep transition-colors group-hover:text-accent">
            Open
          </span>
        </div>
      </div>
    </article>
  );
}
