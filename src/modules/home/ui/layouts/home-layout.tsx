import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { HomeNavbar } from "../components/home-navbar";
import { HomeSidebar } from "../components/home-sidebar";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="w-full">
        <HomeNavbar />

        <div className="flex ">
          <HomeSidebar />
          <main className="flex-1 overflow-y-auto pt-[4rem]">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
