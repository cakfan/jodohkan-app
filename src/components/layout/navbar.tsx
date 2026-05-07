import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function Navbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 text-sm md:text-base">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      {/* <div className="flex flex-1 items-center justify-between">
        <h1 className="font-semibold tracking-tight">Pethuk Jodoh</h1>
      </div> */}
    </header>
  );
}
