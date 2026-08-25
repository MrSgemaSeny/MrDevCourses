import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from '../App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-3xl font-bold text-white mb-3">MrDevCourses</h1>
            <p className="text-gray-400 max-w-md mb-6">
              Обучающая платформа для разработчиков. 1 день — 1 урок.
            </p>
            <div className="flex gap-4">
              <a
                href="/courses"
                className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white font-medium rounded-md transition-colors"
              >
                Каталог курсов
              </a>
              <a
                href="/auth"
                className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-gray-200 border border-[#30363d] rounded-md transition-colors"
              >
                Войти
              </a>
            </div>
          </div>
        ),
      },
      {
        path: 'auth',
        element: (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="w-full max-w-sm p-6 bg-[#161b22] border border-[#30363d] rounded-lg">
              <h2 className="text-xl font-bold text-white text-center mb-6">Вход в MrDevCourses</h2>
              <a
                href="/api/oauth2/authorization/google"
                className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-white text-gray-900 font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Войти через Google
              </a>
            </div>
          </div>
        ),
      },
      {
        path: 'courses',
        element: (
          <div className="max-w-5xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-white mb-6">Каталог курсов</h2>
            <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-lg text-gray-400">
              Курсы загружаются...
            </div>
          </div>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
