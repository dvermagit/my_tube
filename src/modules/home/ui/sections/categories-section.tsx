"use client"; //fetching categories code
import { FilterCarousel } from "@/components/filter-carousel";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CategorySectionProps {
  categoryId?: string;
}

export const CategoriesSection = ({ categoryId }: CategorySectionProps) => {
  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
        <ErrorBoundary fallback={<p>Something went wrong..</p>}>
          <CategoriesSectionSuspense />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};
export const CategoriesSectionSuspense = ({
  categoryId,
}: CategorySectionProps) => {
  const [categories] = trpc.categories.getMany.useSuspenseQuery();
  const data = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
  return <FilterCarousel value={categoryId} data={data} />;
};
