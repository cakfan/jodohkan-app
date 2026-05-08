import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function Navbar() {
  return (
    <header className="bg-background/80 supports-backdrop-blur:bg-background/60 sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4 text-sm backdrop-blur-sm md:text-base">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      {/* <div className="flex flex-1 items-center justify-between">
        <h1 className="font-semibold tracking-tight">Pethuk Jodoh</h1>
      </div> */}
    </header>
  );
}
