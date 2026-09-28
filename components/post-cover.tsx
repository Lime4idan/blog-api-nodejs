type PostCoverProps = {
  title: string;
  coverUrl?: string | null;
  color?: string;
  priority?: boolean;
};

export function PostCover({ title, coverUrl, color = "#7765a5" }: PostCoverProps) {
  if (coverUrl) {
    return <Image className="post-cover-image" src={coverUrl} alt="" width={1600} height={1000} sizes="(max-width: 700px) 100vw, 70vw" />;
  }

  return (
    <div className="post-cover-placeholder" style={{ "--cover-color": color } as React.CSSProperties}>
      <span className="cover-grid" aria-hidden="true" />
      <span className="cover-symbol" aria-hidden="true">✦</span>
      <span className="cover-title">{title}</span>
      <span className="cover-stamp">arquivo pessoal</span>
    </div>
  );
}
import Image from "next/image";
