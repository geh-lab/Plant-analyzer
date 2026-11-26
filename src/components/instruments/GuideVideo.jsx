import { ExternalLink } from "./InstrumentFrame";

export default function GuideVideo({ id, title, english }) {
  if (!id) return null;
  return (
    <div className="inst-guide-video">
      <iframe
        key={id}
        src={`https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0`}
        title={title + (english ? " · Guide video" : " · 가이드 영상")}
        referrerPolicy="strict-origin-when-cross-origin"
        allow="encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
      <ExternalLink href={`https://www.youtube.com/watch?v=${id}`}>
        {english ? "Watch on YouTube" : "YouTube에서 보기"}
      </ExternalLink>
    </div>
  );
}
