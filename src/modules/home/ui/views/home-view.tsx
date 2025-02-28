import { CategoriesSection } from "../sections/categories-section";

interface HomeViewProp {
  categoryId?: string;
}

export const HomeView = ({ categoryId }: HomeViewProp) => {
  return (
    <div className="max-w-[2400px] mx-auto  mb-1 px-4 pt-2.5  flex flex-col gap-y-6">
      <CategoriesSection categoryId={categoryId} />
    </div>
  );
};
