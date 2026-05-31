import Image from "next/image";
import Link from "next/link";

type StudioBrandProps = {
  href: string;
  label: string;
};

export function StudioBrand({ href, label }: StudioBrandProps) {
  return (
    <Link className="brand" href={href} aria-label={label}>
      <Image
        className="brand-logo"
        src="/brand/kiropoko-logo-header.webp"
        alt=""
        width={640}
        height={461}
        priority
        sizes="(max-width: 800px) 142px, 176px"
      />
    </Link>
  );
}
