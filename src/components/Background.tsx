export const Background = ({ customBg }: { customBg: string | null }) => (
  <div className="absolute inset-0 bg-red-950 overflow-hidden pointer-events-none">
    {/* Mazu Statue Background */}
    <div 
      className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-90"
      style={{
        backgroundImage: `url('${customBg || '/mazu-bg.jpg'}')`,
      }}
    />
    
    {/* Spiritual Overlay Effects */}
    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/60 to-transparent" />
    <div className="absolute bottom-0 left-0 w-full h-72 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
  </div>
);
