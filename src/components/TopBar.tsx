export const TopBar = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4">
    {children}
  </div>
)
