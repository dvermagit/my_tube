import { HydrateClient, trpc } from "@/trpc/server";
import { PageClient } from "./client";
import { Suspense } from "react";
import { ErrorBoundary, ErrorBoundaryContext } from "react-error-boundary";
export default async function Home() {
  void trpc.hello.prefetch({ text: "dhruv" });
  return (
    <div>
      <HydrateClient>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<p>Loading... </p>}>
            <PageClient />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </div>
  );
}
