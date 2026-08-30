import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Check, X, Loader2 } from 'lucide-react';
import { UserRole } from '@/shared/types';

interface RoleToggleProps {
  userId: number;
  userEmail: string;
  currentRole: UserRole;
  isCurrentAdmin?: boolean;
  onRoleChange: (newRole: UserRole) => Promise<void>;
  disabled?: boolean;
}

export const RoleToggle: React.FC<RoleToggleProps> = ({
  userId,
  userEmail,
  currentRole,
  isCurrentAdmin = false,
  onRoleChange,
  disabled = false,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const targetRole: UserRole = currentRole === 'ADMIN' ? 'STUDENT' : 'ADMIN';
  const isAdmin = currentRole === 'ADMIN';

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      await onRoleChange(targetRole);
      setShowConfirm(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Ошибка смены роли';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Role Badge / Toggle Button */}
      <button
        type="button"
        disabled={disabled || (isCurrentAdmin && isAdmin)}
        onClick={() => {
          if (isCurrentAdmin && isAdmin) return;
          setErrorMsg(null);
          setShowConfirm(true);
        }}
        title={
          isCurrentAdmin && isAdmin
            ? 'Нельзя понизить собственную роль администратора'
            : `Нажмите для смены на ${targetRole}`
        }
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all border ${
          isAdmin
            ? 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/50'
            : 'bg-zinc-800/80 text-zinc-300 border-white/10 hover:bg-zinc-700/80'
        } ${isCurrentAdmin && isAdmin ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isAdmin ? (
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Shield className="w-3.5 h-3.5 text-zinc-400" />
        )}
        <span>{currentRole}</span>
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-xl p-5 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-zinc-100 mb-1">
                  Подтверждение смены роли RBAC
                </h3>
                <p className="text-xs text-zinc-400">
                  Вы действительно хотите изменить роль пользователя{' '}
                  <span className="font-mono text-zinc-200 font-medium">{userEmail}</span> с{' '}
                  <span className="font-semibold text-amber-400">{currentRole}</span> на{' '}
                  <span className="font-semibold text-zinc-100">{targetRole}</span>?
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleConfirm}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-zinc-950 text-xs font-semibold transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Подтвердить</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
