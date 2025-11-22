import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/30",
        "before:absolute before:inset-0",
        "before:-translate-x-full",
        "before:animate-[shimmer_1.5s_infinite]",
        "before:bg-gradient-to-r",
        "before:from-transparent before:via-muted/40 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

function AnimeCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("group relative aspect-[2/3] overflow-hidden rounded-xl", className)}>
      <Skeleton className="w-full h-full rounded-xl" />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-muted/50" />
        <Skeleton className="h-3 w-1/2 bg-muted/40" />
      </div>
      
      <div className="absolute top-2 right-2 space-y-1">
        <Skeleton className="h-5 w-16 bg-muted/50" />
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="relative w-full h-[60vh]">
      <Skeleton className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      
      <div className="absolute bottom-8 left-8 right-8 space-y-4">
        <Skeleton className="h-12 w-2/3 max-w-2xl bg-muted/50" />
        <Skeleton className="h-6 w-1/2 max-w-xl bg-muted/40" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-12 w-32 bg-muted/50" />
          <Skeleton className="h-12 w-32 bg-muted/40" />
        </div>
      </div>
    </div>
  );
}

function SectionHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-1 bg-primary/50" />
        <Skeleton className="h-7 w-48 bg-muted/50" />
      </div>
      <Skeleton className="h-5 w-20 bg-muted/40" />
    </div>
  );
}

function HorizontalScrollSkeleton() {
  return (
    <section>
      <SectionHeaderSkeleton />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]">
            <AnimeCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}

function RankedListItemSkeleton() {
  return (
    <div className="flex gap-3 p-2 rounded-lg">
      <Skeleton className="flex-shrink-0 w-8 h-8 rounded" />
      <Skeleton className="flex-shrink-0 w-12 h-16 rounded-md" />
      <div className="flex-1 space-y-2 flex flex-col justify-center">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="flex-shrink-0 w-12 h-6 rounded" />
    </div>
  );
}

function DetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative w-full h-[50vh]">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex gap-6 items-end">
            <Skeleton className="hidden md:block w-40 h-56 rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-10 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-6">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  AnimeCardSkeleton, 
  HeroSkeleton,
  SectionHeaderSkeleton,
  HorizontalScrollSkeleton,
  RankedListItemSkeleton,
  DetailPageSkeleton
}
