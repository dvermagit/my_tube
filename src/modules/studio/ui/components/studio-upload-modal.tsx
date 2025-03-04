// "use client ";
// import { Button } from "@/components/ui/button";
// import { trpc } from "@/trpc/client";
// import { Loader2Icon, PlusIcon } from "lucide-react";

// export const StudioUploadModal = () => {
//   const utils = trpc.useUtils();
//   const create = trpc.videos.create.useMutation({
//     onSuccess: () => {
//       utils.studio.getMany.invalidate();
//     },
//   });
//   return (
//     <Button
//       variant="secondary"
//       onClick={() => create.mutate()}
//       disabled={create.isPending}
//     >
//       {create.isPending ? (
//         <Loader2Icon className="animate-spin" />
//       ) : (
//         <PlusIcon />
//       )}
//       Create
//     </Button>
//   );
// };

"use client"; // Ensure this is a client component
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation"; // For redirecting after creation
import { toast } from "sonner"; // For showing success/error messages

export const StudioUploadModal = () => {
  const router = useRouter();
  const create = trpc.videos.create.useMutation({
    onSuccess: (data) => {
      // Redirect to the video edit page after creation
      router.push(`/studio/${data.video.id}/edit`);
      toast.success("Video created successfully!"); // Show success message
    },
    onError: (error) => {
      toast.error("Failed to create video. Please try again."); // Show error message
    },
  });

  return (
    <Button
      variant="secondary"
      onClick={() => create.mutate()} // Pass an empty object since `title` is optional
      disabled={create.isPending} // Disable the button while the mutation is pending
    >
      {create.isPending ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <PlusIcon className="mr-2 h-4 w-4" />
      )}
      Create
    </Button>
  );
};
