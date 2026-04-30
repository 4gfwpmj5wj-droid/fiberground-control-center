export function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" className="text-cyan-500" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2.5" className="text-blue-500" />
      <circle cx="12" cy="12" r="2" fill="currentColor" className="text-white" />
    </svg>
  );
}
