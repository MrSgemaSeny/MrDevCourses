import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/entities/user/api/userApi';
import { useAuth } from '@/features/auth';
import type { UpdateUserProfilePayload } from '@/entities/user/model/types';
import {
  User as UserIcon,
  Send,
  Github,
  Clock,
  FolderGit2,
  BookOpen,
  CheckCircle2,
  Award,
  Sparkles,
  Save,
  Check,
  Calendar,
  Mail,
  Shield,
  Target,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const GOAL_PRESETS = [
  'Запустить свой первый AI SaaS продукт',
  'Стать уверенным Full-Stack инженером',
  'Освоить вайбкодинг и TDD разработку',
  'Создать работающий стартап за 5 дней',
  'Автоматизировать свои рабочие процессы',
];

const formatStudyTime = (minutes?: number): string => {
  if (!minutes || minutes <= 0) return '0 мин.';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes} мин.`;
  if (remainingMinutes === 0) return `${hours} ч.`;
  return `${hours} ч. ${remainingMinutes} мин.`;
};

export const ProfilePage: React.FC = () => {
  const { checkAuth } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['user-profile'],
    queryFn: userApi.getProfile,
  });

  const [formData, setFormData] = useState<UpdateUserProfilePayload>({
    name: '',
    avatarUrl: '',
    telegramUsername: '',
    githubUsername: '',
    bio: '',
    goal: '',
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        avatarUrl: profile.avatarUrl || '',
        telegramUsername: profile.telegramUsername || '',
        githubUsername: profile.githubUsername || '',
        bio: profile.bio || '',
        goal: profile.goal || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateUserProfilePayload) => userApi.updateProfile(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['user-profile'], updated);
      checkAuth();
      setSaveSuccess(true);
      setErrorMessage(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || 'Не удалось сохранить профиль');
    },
  });

  const [isLinkingTelegram, setIsLinkingTelegram] = useState(false);

  const handleConnectTelegram = async () => {
    try {
      setIsLinkingTelegram(true);
      const { linkUrl } = await userApi.getTelegramLinkToken();
      window.open(linkUrl, '_blank');
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Не удалось сгенерировать ссылку привязки Telegram');
    } finally {
      setIsLinkingTelegram(false);
    }
  };

  const handleUnlinkTelegram = async () => {
    try {
      await userApi.unlinkTelegram();
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Не удалось отвязать Telegram');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    updateMutation.mutate(formData);
  };

  const handleGoalPresetClick = (preset: string) => {
    setFormData((prev) => ({
      ...prev,
      goal: prev.goal === preset ? '' : preset,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/5 border-t-white rounded-full animate-spin" />
          <span className="text-xs text-zinc-500 font-mono">Загрузка профиля...</span>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Ошибка загрузки профиля</h2>
        <p className="text-xs text-zinc-400 mt-1">Пожалуйста, обновите страницу или войдите снова.</p>
      </div>
    );
  }

  const displayName = formData.name || profile.email.split('@')[0];
  const memberSince = new Date(profile.createdAt).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-zinc-100">
      {/* Page Title & Breadcrumb Header */}
      <div className="mb-8 space-y-1">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono uppercase tracking-wider font-bold">
          <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
          <span>Личный кабинет</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Профиль и настройки аккаунта
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
          Управляйте контактами для связи с ментором, ссылками на GitHub и отслеживайте свой прогресс обучения.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card & Learning Stats (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Identity Card */}
          <div className="p-6 rounded-sm bg-[#0e0e11] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] space-y-5">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 rounded-full border-2 border-white/10 object-cover shadow-lg shadow-black/60"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-white/10 flex items-center justify-center text-2xl text-white font-bold shadow-lg shadow-black/60">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#18181b] border border-white/10 text-zinc-400">
                  <Shield className="w-3.5 h-3.5" />
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">{displayName}</h2>
                <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="truncate max-w-[220px]">{profile.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {profile.role === 'ADMIN' && (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-white/5 border border-white/10 text-zinc-300 font-semibold">
                    ADMIN
                  </span>
                )}
                <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-zinc-600" />
                  С {memberSince}
                </span>
              </div>
            </div>

            {/* Quick Links Preview */}
            <div className="pt-4 border-t border-white/5 space-y-2">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Привязанные каналы</div>
              <div className="space-y-1.5 text-xs">
                {formData.telegramUsername ? (
                  <a
                    href={`https://t.me/${formData.telegramUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded bg-[#0a0a0c] border border-white/5 hover:border-white/15 text-zinc-300 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-mono">@{formData.telegramUsername.replace('@', '')}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </a>
                ) : (
                  <div className="p-2 rounded bg-[#0a0a0c] border border-dashed border-white/10 text-zinc-500 text-[11px]">
                    Telegram не указан
                  </div>
                )}

                {formData.githubUsername ? (
                  <a
                    href={`https://github.com/${formData.githubUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded bg-[#0a0a0c] border border-white/5 hover:border-white/15 text-zinc-300 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Github className="w-3.5 h-3.5 text-zinc-300" />
                      <span className="font-mono">@{formData.githubUsername.replace('@', '')}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </a>
                ) : (
                  <div className="p-2 rounded bg-[#0a0a0c] border border-dashed border-white/10 text-zinc-500 text-[11px]">
                    GitHub не указан
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Learning Progress Metrics Grid */}
          <div className="p-5 rounded-sm bg-[#0e0e11] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] space-y-4">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>Статистика обучения</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded bg-[#0a0a0c] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="text-[10px] font-mono uppercase">Время обучения</span>
                </div>
                <div className="text-base font-bold font-mono text-white">
                  {formatStudyTime(profile.timeSpentMinutes)}
                </div>
              </div>

              <div className="p-3 rounded bg-[#0a0a0c] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <FolderGit2 className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="text-[10px] font-mono uppercase">Сделано проектов</span>
                </div>
                <div className="text-base font-bold font-mono text-white">
                  {profile.completedProjectsCount || 0}
                </div>
              </div>

              <div className="p-3 rounded bg-[#0a0a0c] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[10px] font-mono uppercase">Пройдено уроков</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {profile.completedLessonsCount || 0}
                </div>
              </div>

              <div className="p-3 rounded bg-[#0a0a0c] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[10px] font-mono uppercase">Курсы</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {profile.enrolledCoursesCount || 0}
                </div>
              </div>

              <div className="col-span-2 p-3 rounded bg-[#0a0a0c] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-300">Сертификаты выпускника</span>
                </div>
                <span className="text-sm font-bold font-mono text-white">
                  {profile.certificatesCount || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Profile Edit Form (8 cols) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-sm bg-[#0e0e11] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] space-y-8">
            {/* Form Header Alerts */}
            {saveSuccess && (
              <div className="p-4 rounded bg-zinc-900 border border-white/10 text-white text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-white shrink-0" />
                <span>Профиль успешно сохранен и обновлен!</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded bg-zinc-900 border border-white/10 text-zinc-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section 1: Basic Identity */}
            <div className="space-y-4 pb-6 border-b border-white/10">
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  1. Основные данные
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-medium text-zinc-300 block">
                    Имя / Псевдоним
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Например, Азамат Калиев"
                    className="w-full px-3.5 py-2.5 rounded-sm bg-[#0a0a0c] border border-white/10 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contact Channels & Integrations */}
            <div className="space-y-4 pb-6 border-b border-white/10">
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  2. Каналы связи и репозитории
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="telegramUsername" className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                    <span>Telegram Никнейм</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-zinc-500 font-mono">@</span>
                    <input
                      id="telegramUsername"
                      type="text"
                      value={formData.telegramUsername || ''}
                      onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                      placeholder="username"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-sm bg-[#0a0a0c] border border-white/10 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-white/30 font-mono transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Укажите никнейм и отправьте боту @MrDevelopersbot любое сообщение
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="githubUsername" className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                    <span>GitHub Username</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-zinc-500 font-mono">@</span>
                    <input
                      id="githubUsername"
                      type="text"
                      value={formData.githubUsername || ''}
                      onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                      placeholder="github_user"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-sm bg-[#0a0a0c] border border-white/10 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-white/30 font-mono transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Telegram Bot Live Link Box */}
              <div className="p-4 rounded bg-[#0a0a0c] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-bold text-white">Telegram-уведомления</span>
                    {profile.telegramChatId ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-white border border-white/20">
                        ПОДКЛЮЧЕН
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-zinc-500 border border-white/5">
                        НЕ ПРИВЯЗАН
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Мгновенные алерты о проверке ДЗ, открытии новых уроков и сообщения от ментора.
                  </p>
                </div>

                {profile.telegramChatId ? (
                  <button
                    type="button"
                    onClick={handleUnlinkTelegram}
                    className="px-3 py-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                  >
                    Отвязать
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectTelegram}
                    disabled={isLinkingTelegram}
                    className="px-3.5 py-1.5 rounded-sm bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isLinkingTelegram ? 'Генерация...' : 'Подключить бота'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Section 3: Goal & Motivation */}
            <div className="space-y-4 pb-6 border-b border-white/10">
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-zinc-400" />
                  <span>3. Главная цель и фокус обучения</span>
                </h2>
              </div>

              <div className="space-y-2.5">
                <input
                  id="goal"
                  type="text"
                  value={formData.goal || ''}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  placeholder="Ваша цель (например: Запустить сервис для автоматизации отчетов)"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#0a0a0c] border border-white/10 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                />

                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    {GOAL_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleGoalPresetClick(preset)}
                        className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer text-left ${
                          formData.goal === preset
                            ? 'bg-white text-black font-semibold'
                            : 'bg-[#0a0a0c] border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Bio / About */}
            <div className="space-y-4 pb-6 border-b border-white/10">
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>4. О себе</span>
                </h2>
              </div>

              <textarea
                id="bio"
                rows={3}
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Пишу код на React / Java, интересуюсь AI-агентами и микросервисной архитектурой..."
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0a0a0c] border border-white/10 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-white/30 leading-relaxed transition-colors resize-none"
              />
            </div>

            {/* Submit Bar */}
            <div className="pt-2 flex items-center justify-end gap-4">
              

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-6 py-2.5 rounded-sm bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-lg shadow-black/40"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <span>Сохранение...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-black" />
                    <span>Сохранить изменения</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};