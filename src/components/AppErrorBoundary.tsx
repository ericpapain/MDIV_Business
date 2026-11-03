// src/components/AppErrorBoundary.tsx
// Bouclier global anti-écran noir pour intercepter toute erreur inattendue de rendu
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-foreground flex items-center justify-center p-6">
          <div className="bg-card/90 border border-border/80 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
              <AlertCircle size={30} />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold font-serif text-foreground">
                Affichage momentanément interrompu
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Une mise à jour ou un élément a provoqué une erreur de chargement.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <Button
                type="button"
                onClick={this.handleReset}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} /> Recharger la page
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full rounded-xl text-xs py-2.5 border-border hover:bg-muted flex items-center justify-center gap-2"
              >
                <Home size={14} /> Accueil
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

