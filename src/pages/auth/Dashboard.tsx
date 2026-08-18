import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { LogOut, Activity, BarChart, Calendar, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Dashboard = () => {
  const { company, token, logout } = useAuth();
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        const response = await fetch('/api/user/diagnostics.php', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || 'Erreur réseau');
        
        setDiagnostics(data.diagnostics);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchDiagnostics();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Espace Entreprise */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="text-blue-600" /> Espace Entreprise
            </h1>
            <p className="text-gray-500 mt-1">
              Connecté en tant que <strong>{company?.name}</strong> ({company?.email})
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button variant="outline" onClick={logout} className="text-red-500 border-red-200 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" /> Déconnexion
            </Button>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vos diagnostics IA</h2>
          <Link to="/services-ia/diagnostic" className="ia-btn-primary py-2 px-4 text-sm flex items-center gap-2">
            Nouveau Diagnostic <ArrowRight size={16} />
          </Link>
        </div>

        {/* Liste des Diagnostics */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 animate-pulse">Chargement de votre historique...</div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        ) : diagnostics.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun diagnostic réalisé</h3>
            <p className="text-gray-500 mb-6">Commencez dès maintenant pour évaluer votre maturité IA.</p>
            <Link to="/services-ia/diagnostic">
              <Button>Lancer l'analyse</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {diagnostics.map((diag) => (
              <div key={diag.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase">
                      {diag.diagnostic_type}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(diag.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Score de Maturité</span>
                    <div className="text-4xl font-black text-gray-900 dark:text-white flex items-end gap-1">
                      {diag.score} <span className="text-base font-normal text-gray-400">/100</span>
                    </div>
                  </div>

                  {diag.report && diag.report.synthesis && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                      {diag.report.synthesis}
                    </p>
                  )}
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center w-full justify-center">
                      <BarChart className="w-4 h-4 mr-2" /> Voir le rapport complet
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
