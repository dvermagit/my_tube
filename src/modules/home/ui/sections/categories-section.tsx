"use client"; //fetching categories code
import { FilterCarousel } from "@/components/filter-carousel";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CategorySectionProps {
  categoryId?: string;
}

export const CategoriesSection = ({ categoryId }: CategorySectionProps) => {
  return (
    <div>
      <Suspense fallback={<CategoriesSkeleton />}>
        <ErrorBoundary fallback={<p>Something went wrong..</p>}>
          <CategoriesSectionSuspense />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};
const CategoriesSkeleton = () => {
  return <FilterCarousel isLoading data={[]} onSelect={() => {}} />;
};
export const CategoriesSectionSuspense = ({
  categoryId,
}: CategorySectionProps) => {
  const router = useRouter();
  const [categories] = trpc.categories.getMany.useSuspenseQuery();
  const data = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("categoryId", value);
    } else {
      url.searchParams.delete("categoryId");
    }
    router.push(url.toString());
  };
  return <FilterCarousel onSelect={onSelect} value={categoryId} data={data} />;
};
