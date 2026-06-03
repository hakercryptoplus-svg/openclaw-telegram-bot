import { useGetBotStatus, getGetBotStatusQueryKey } from "@workspace/api-client-react";
import { formatUptime, formatDate } from "@/lib/format";
import { Activity, Clock, Cpu, Server, TerminalSquare, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Home() {
  const queryClient = useQueryClient();
  const { data: status, isLoading, isError, isFetching } = useGetBotStatus({ query: { queryKey: getGetBotStatusQueryKey(), refetchInterval: 10000 } });

  const isOnline = status?.status?.toLowerCase() === 'online';

  const handleManualRefresh = () => {
    queryClient.invalidateQueries({ queryKey: getGetBotStatusQueryKey() });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-card border border-border flex items-center justify-center">
              <TerminalSquare className="w-6 h-6 text-primary" data-testid="icon-terminal" />
            </div>
            <div>
              <h1 className="text-xl font-mono font-bold tracking-tight" data-testid="text-bot-name">
                {isLoading ? <div className="h-6 w-32 bg-muted animate-pulse"></div> : (status?.botName || '@Agent_x_claw_bot')}
              </h1>
              <p className="text-sm text-muted-foreground font-mono" data-testid="text-bot-status-subtitle">
                System Status Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleManualRefresh}
              disabled={isFetching}
              className="p-2 border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 flex items-center justify-center"
              data-testid="button-refresh"
              title="Manual Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-primary' : ''}`} />
            </button>
            <div className="flex items-center gap-2 font-mono text-sm px-3 py-1.5 bg-card border border-border">
              {isLoading ? (
                <div className="w-3 h-3 rounded-full bg-muted animate-pulse" />
              ) : (
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-primary animate-pulse' : 'bg-destructive'}`} data-testid={`indicator-${isOnline ? 'online' : 'offline'}`} />
              )}
              <span className={isLoading ? "text-muted-foreground" : (isOnline ? "text-primary" : "text-destructive")} data-testid="text-status">
                {isLoading ? "LOADING..." : (isOnline ? "SYSTEM.ONLINE" : "SYSTEM.OFFLINE")}
              </span>
            </div>
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive font-mono text-sm" data-testid="alert-error">
            Failed to fetch system metrics. Ensure the API server is reachable.
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-card border border-border p-6 flex flex-col justify-between" data-testid="card-model">
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <Cpu className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-mono">Core Model</span>
            </div>
            <div className="font-mono text-2xl truncate">
              {isLoading ? (
                <div className="h-8 w-48 bg-muted animate-pulse"></div>
              ) : (
                status?.model || 'Unknown'
              )}
            </div>
          </div>

          <div className="bg-card border border-border p-6 flex flex-col justify-between" data-testid="card-uptime">
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <Activity className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-mono">System Uptime</span>
            </div>
            <div className="font-mono text-2xl">
              {isLoading ? (
                <div className="h-8 w-32 bg-muted animate-pulse"></div>
              ) : (
                formatUptime(status?.uptimeSeconds)
              )}
            </div>
          </div>

          <div className="bg-card border border-border p-6 flex flex-col justify-between md:col-span-2" data-testid="card-started">
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <Clock className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-mono">Initialization Time</span>
            </div>
            <div className="font-mono text-xl md:text-2xl">
              {isLoading ? (
                <div className="h-8 w-64 bg-muted animate-pulse"></div>
              ) : (
                formatDate(status?.startedAt)
              )}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="pt-8 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <Server className="w-3 h-3" />
            <span>Connection verified</span>
          </div>
          <div>Auto-refresh: 10s</div>
        </div>

      </div>
    </div>
  );
}
