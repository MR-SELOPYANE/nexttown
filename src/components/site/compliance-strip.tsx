export function ComplianceStrip() {
  return (
    <div className="bg-white/[0.02] border-y border-white/5 py-4">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Security standards
          </span>
          <span className="text-xs text-foreground/80">POPIA Compliant</span>
          <span className="text-xs text-foreground/80">256-bit Encryption</span>
          <span className="text-xs text-foreground/80">SAPS-verified drivers</span>
          <span className="text-xs text-foreground/80">PCI-DSS payments</span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          Regulated by the National Department of Transport
        </div>
      </div>
    </div>
  );
}
