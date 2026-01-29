import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../services/auth";
import { useToast } from "../../components/Common/Toast";
import { Button } from "../../components/Common/Button";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setIsSent(true);
      showToast("success", "Reset link sent!");
    } catch (error) {
      showToast("error", "Check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white mb-2">
            Check your mail
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
            We've sent a recovery link to{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {email}
            </span>
            .
          </p>
          <Link
            to="/login"
            className="text-primary-600 font-bold flex items-center justify-center gap-2 hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
        {/* FIXED HEADER: Icon and Text side-by-side */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter dark:text-white leading-none">
              Forgot Password?
            </h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Security Recovery
            </p>
          </div>
        </div>

        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
          No worries, it happens. Enter your email and we'll send you a reset
          link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white outline-none focus:ring-2 ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-500/20 transition-all"
          >
            {loading ? "Sending link..." : "Send Reset Link"}
          </Button>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors pt-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </form>
      </div>
    </div>
  );
};
