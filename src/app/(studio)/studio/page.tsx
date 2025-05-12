import { DEFAULT_LIMIT } from "@/constants";
import { StudioView } from "@/modules/studio/ui/view/studio-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { dehydrate } from "@tanstack/react-query";

const Page = async () => {
  void (await trpc.studio.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  } as any));
  // const queryClient = await trpc.studio.getMany.prefetchQuery({
  //   limit: DEFAULT_LIMIT, // This should match the input schema of the `getMany` procedure
  // });

  return (
    <HydrateClient>
      <StudioView />
    </HydrateClient>
  );
};

export default Page;
