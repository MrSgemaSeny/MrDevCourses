import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../model/authContext';

type Mode = 'login' | 'register';

interface FormErrors {
  email?: string;
  name?: string;
  password?: string;
  general?: string;
}

export const EmailAuthForm: React.FC = () => {
  const { loginWithEmail, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
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
        await loginWithEmail(email, password);
      } else {
        await register(email, name.trim(), password);
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

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
          {errors.general}
        </div>
      )}

      <div>
        <label className="block text-xs text-[#a1a1aa] mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          className={`w-full px-3 py-2.5 rounded-sm bg-[#0a0a0c] border text-xs text-[#fafafa] placeholder-[#52525b]
            outline-none transition-colors
            ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-[#52525b]'}`}
        />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
      </div>

      {mode === 'register' && (
        <div>
          <label className="block text-xs text-[#a1a1aa] mb-1.5">Имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Иван Петров"
            autoComplete="name"
            className={`w-full px-3 py-2.5 rounded-sm bg-[#0a0a0c] border text-xs text-[#fafafa] placeholder-[#52525b]
              outline-none transition-colors
              ${errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-[#52525b]'}`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
        </div>
      )}

      <div>
        <label className="block text-xs text-[#a1a1aa] mb-1.5">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'register' ? 'Минимум 8 символов' : '••••••••'}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          className={`w-full px-3 py-2.5 rounded-sm bg-[#0a0a0c] border text-xs text-[#fafafa] placeholder-[#52525b]
            outline-none transition-colors
            ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-[#52525b]'}`}
        />
        {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 rounded-sm bg-[#27272a] hover:bg-[#3f3f46] border border-[#3f3f46]
          text-xs text-[#fafafa] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? mode === 'login'
            ? 'Входим...'
            : 'Регистрируемся...'
          : mode === 'login'
          ? 'Войти'
          : 'Создать аккаунт'}
      </button>

      <p className="text-center text-xs text-[#71717a]">
        {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
        <button
          type="button"
          onClick={toggleMode}
          className="text-[#a1a1aa] hover:text-[#fafafa] underline-offset-2 hover:underline transition-colors"
        >
          {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </p>
    </form>
  );
};
