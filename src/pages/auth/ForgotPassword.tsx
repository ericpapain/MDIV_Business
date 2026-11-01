import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getApiUrl } from '@/lib/apiConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { language } = useLanguage();
  const isEn = language === 'en';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(isEn ? 'Please enter your email.' : 'Veuillez saisir votre adresse email.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('auth/forgot_password.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur réseau');
      }

      setSuccess(data.message || (isEn ? 'Reset link sent!' : 'Lien envoyé !'));
      setEmail(''); // On vide le champ
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 text-slate-900 flex flex-col justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
          <KeyRound size={14} className="text-amber-500" />
          <span>{isEn ? 'Security' : 'Sécurité'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {isEn ? 'Forgot Password?' : 'Mot de passe oublié ?'}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          {isEn
            ? "Enter your email address and we'll send you a link to reset your password."
            : "Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
          
          {success && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-sm text-emerald-800">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">{isEn ? 'Email sent!' : 'Email envoyé !'}</p>
                <p className="text-xs opacity-90">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-red-700 font-medium">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!success && (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="email" className="text-xs font-bold text-slate-700 mb-1.5 block">
                  {isEn ? 'Email address' : 'Adresse email'}
                </Label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    className="pl-10 h-11 bg-slate-50/80 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    placeholder="contact@entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isEn ? 'Sending...' : 'Envoi en cours...'}</span>
                  </>
                ) : (
                  <span>{isEn ? 'Send reset link' : 'Envoyer le lien de réinitialisation'}</span>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link 
              to="/services-ia/diagnostic/login" 
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft size={14} />
              <span>{isEn ? 'Back to login' : 'Retour à la connexion'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
