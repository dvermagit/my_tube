// import { formatDuration } from "@/lib/utils";
// import Image from "next/image";
// import { THUMBNAIL_FALLBACK } from "../constants";

// interface VideoThumbnailProps {
//   imageUrl?: string | null;
//   title: string;
//   previewUrl?: string | null;
//   duration: number;
// }
// export const VideoThumbnail = ({
//   imageUrl,
//   title,
//   previewUrl,
//   duration,
// }: VideoThumbnailProps) => {

//   return (
//     <div className="relative group">
//       {/* Thumbnail wraapper */}
//       <div className="relative w-full overflow-hidden rounded-xl aspect-video ">
//         <Image
//           src={imageUrl || THUMBNAIL_FALLBACK}
//           alt={title}
//           fill
//           className="size-full object-cover group-hover:opacity-0"
//         />
//         <Image
//           unoptimized={!!previewUrl}
//           src={previewUrl || THUMBNAIL_FALLBACK}
//           alt={title}
//           fill
//           className="size-full object-cover opacity-0  group-hover:opacity-100"
//         />
//       </div>

//       {/* Video duration Box */}
//       <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
//         {formatDuration(duration)}
//       </div>
//     </div>
//   );
// };
import { formatDuration } from "@/lib/utils";
import Image from "next/image";
import { THUMBNAIL_FALLBACK } from "../constants";

interface VideoThumbnailProps {
  imageUrl?: string | null;
  title: string;
  previewUrl?: string | null;
  duration: number;
}

export const VideoThumbnail = ({
  imageUrl,
  title,
  previewUrl,
  duration,
}: VideoThumbnailProps) => {
  // Validate URL or relative path
  const isValidSrc = (src: string | null | undefined): src is string => {
    if (!src) return false;

    // Check if it's a valid URL
    try {
      new URL(src);
      return true;
    } catch (error) {
      // Check if it's a valid relative path
      return src.startsWith("/");
    }
  };

  // Determine the src for the main image
  const mainImageSrc = isValidSrc(imageUrl) ? imageUrl : THUMBNAIL_FALLBACK;

  // Determine the src for the preview image
  const previewImageSrc = isValidSrc(previewUrl)
    ? previewUrl
    : THUMBNAIL_FALLBACK;

  return (
    <div className="relative group">
      {/* Thumbnail wrapper */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        {/* Main Image */}
        <Image
          src={mainImageSrc}
          alt={title}
          fill
          className="size-full object-cover group-hover:opacity-0"
        />

        {/* Preview Image */}
        <Image
          unoptimized={!!previewUrl}
          src={previewImageSrc}
          alt={title}
          fill
          className="size-full object-cover opacity-0 group-hover:opacity-100"
        />
      </div>

      {/* Video duration Box */}
      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
        {formatDuration(duration)}
      </div>
    </div>
  );
};
