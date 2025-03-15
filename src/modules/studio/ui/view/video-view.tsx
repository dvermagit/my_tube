import { FormSection } from "../section/form-section";

interface PageProps {
  videoId: string;
}

// function isValidUUID(id: string) {
//   return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
//     id
//   );
// }

export const VideoView = ({ videoId }: PageProps) => {
  // if (!videoId || !isValidUUID(videoId)) {
  //   return <p>Error: Invalid Video ID</p>; // Handle invalid/missing ID gracefully
  // }
  return (
    <div className="px-4 pt-2.5 max-w-screen-lg">
      <FormSection videoId={videoId} />
    </div>
  );
};
