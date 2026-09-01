import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../model/authContext';
import { GoogleLoginButton } from './GoogleLoginButton';

export type AuthMode = 'login' | 'register';

interface EmailAuthFormProps {
  mode?: AuthMode;
  onToggleMode?: () => void;
}

interface FormErrors {
  email?: string;
  name?: string;
  password?: string;
  general?: string;
}

export const EmailAuthForm: React.FC<EmailAuthFormProps> = ({
  mode: controlledMode,
}) => {
  const { loginWithEmail, register } = useAuth();
  const navigate = useNavigate();

  const [internalMode] = useState<AuthMode>('login');
  const mode = controlledMode || internalMode;

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Введите корректный email';
    }
    if (mode === 'register') {
      if (!name || name.trim().length < 2) {
        newErrors.name = 'Имя должно содержать минимум 2 символа';
      }
    }
    if (!password || password.length < 8) {
      newErrors.password = 'Пароль — минимум 8 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password, rememberMe);
      } else {
        await register(email, name.trim(), password, rememberMe);
      }
      navigate('/courses');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : mode === 'login'
          ? 'Неверный email или пароль'
          : 'Ошибка регистрации. Попробуйте снова.';
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
          {errors.general}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs text-zinc-300 font-medium">
          {mode === 'login' ? 'Email или имя пользователя' : 'Email'}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          className={`w-full px-3 py-2 rounded-sm bg-[#0a0a0c] border text-xs text-white placeholder-zinc-600
            outline-none transition-colors
            ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-zinc-500'}`}
        />
        {errors.email && <p className="mt-1 text-[11px] text-red-400">{errors.email}</p>}
      </div>

      {mode === 'register' && (
        <div className="space-y-1.5">
          <label className="block text-xs text-zinc-300 font-medium">Ваше имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Иван Петров"
            autoComplete="name"
            className={`w-full px-3 py-2 rounded-sm bg-[#0a0a0c] border text-xs text-white placeholder-zinc-600
              outline-none transition-colors
              ${errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-zinc-500'}`}
          />
          {errors.name && <p className="mt-1 text-[11px] text-red-400">{errors.name}</p>}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs text-zinc-300 font-medium">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'register' ? 'Минимум 8 символов' : '••••••••'}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          className={`w-full px-3 py-2 rounded-sm bg-[#0a0a0c] border text-xs text-white placeholder-zinc-600
            outline-none transition-colors
            ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-zinc-500'}`}
        />
        {errors.password && <p className="mt-1 text-[11px] text-red-400">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between py-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-3.5 h-3.5 rounded-xs bg-[#0a0a0c] border border-white/20 text-white accent-white focus:ring-0 cursor-pointer"
          />
          <span className="text-[11px] text-zinc-400 hover:text-zinc-300 transition-colors">
            Запомнить меня на 30 дней
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-sm transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? mode === 'login'
            ? 'Входим...'
            : 'Создание аккаунта...'
          : mode === 'login'
          ? 'Войти'
          : 'Создать аккаунт'}
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4 pt-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative px-3 bg-[#0e0e11] text-[11px] text-zinc-500 font-mono">
          или
        </span>
      </div>

      {/* Google Login Button */}
      <GoogleLoginButton text="Войти через Google" />
    </form>
  );
};
