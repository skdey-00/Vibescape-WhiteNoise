export const SpatialGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-full h-screen flex items-center justify-center">
    <div className="w-[600px] h-[600px] rounded-full bg-white/5 backdrop-blur-xl border border-white/10 relative">
      {children}
      <div className="absolute w-4 h-4 bg-white rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
)
