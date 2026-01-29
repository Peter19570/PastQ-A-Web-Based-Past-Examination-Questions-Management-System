import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth";
import { useToast } from "../../components/Common/Toast";
import { Button } from "../../components/Common/Button";
import { ShieldCheck, Lock } from "lucide-react";

export const ResetPasswordConfirm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ password: "", token: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.confirmPasswordReset(id!, formData);
      showToast("success", "Password updated successfully!");
      navigate("/login");
    } catch (error) {
      showToast("error", "The link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center mb-6">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white mb-2">
          Secure Your Account
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
          Almost there! Enter the token from your email and your new password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Verification Token
            </label>
            <input
              type="text"
              required
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white outline-none focus:border-primary-500 text-sm font-mono"
              placeholder="Paste token here"
              value={formData.token}
              onChange={(e) =>
                setFormData({ ...formData, token: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                className="w-full p-3 pl-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white outline-none focus:border-primary-500 text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>
          <Button
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl mt-4"
          >
            {loading ? "Updating..." : "Confirm New Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};
