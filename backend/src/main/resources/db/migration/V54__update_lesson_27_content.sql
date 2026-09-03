-- MrDevCourses: Migration V54 - Update Lesson 27 Full Content
-- Lesson 27: AI-ассистент: chat-интерфейс, контекстное окно, streaming-ответы

DO $$
DECLARE
    target_course_id BIGINT;
BEGIN
    SELECT id INTO target_course_id FROM courses WHERE slug = 'mrdeveloper' LIMIT 1;
    IF target_course_id IS NULL THEN
        SELECT id INTO target_course_id FROM courses WHERE slug = 'vibecoding-zero-to-one' LIMIT 1;
    END IF;
    IF target_course_id IS NULL THEN
        SELECT id INTO target_course_id FROM courses ORDER BY id ASC LIMIT 1;
    END IF;

    IF target_course_id IS NOT NULL THEN
        UPDATE lessons 
        SET title = 'AI-ассистент: chat-интерфейс, контекстное окно, streaming-ответы',
            content = '# Урок 27: Стриминг ответов нейросети через Server-Sent Events (SSE)

Вспомни, как работает ChatGPT или Claude: когда ты задаёшь вопрос, текст ответа не появляется внезапно через 15 секунд ожидания. Буквы и слова вылетают на экран прямо на глазах, символ за символом, со скоростью человеческой речи. Это создаёт живое ощущение настоящего диалога и кардинально улучшает восприятие скорости.

Сегодня мы реализуем посимвольный стриминг текста (Streaming SSE) из нашего Spring Boot бэкенда в React 19 интерфейс.

## 1. Как устроен протокол Server-Sent Events (SSE)

В веб-разработке есть 3 способа передачи данных от сервера к клиенту:
1. **Обычный HTTP запрос (Polling)**: Клиент спросил -> Сервер подумал 10 секунд -> Отдал ответ -> Закрыл соединение. Пользователь всё это время смотрит на крутящийся спиннер.
2. **WebSockets**: Двусторонний полнодуплексный канал. Мощно, но избыточно сложно для простого вывода текста из нейросети: требует отдельных протоколов, сложной балансировки и поддержки handshake.
3. **Server-Sent Events (SSE)**: Идеальный выбор для AI. Это обычный, однонаправленный HTTP GET запрос, но со специальным заголовком `Content-Type: text/event-stream`. Сервер не закрывает соединение после первого байта, а шлёт данные порциями (чанками) по мере их поступления от языковой модели.

```
┌────────────────────┐          GET /api/v1/ai/stream?prompt=...          ┌────────────────────┐
│   React Frontend   │ ─────────────────────────────────────────────────> │ Spring Boot Server │
└────────────────────┘                                                    └─────────┬──────────┘
          ▲                                                                         │
          │ 1. data: {"chunk": "Привет, "}                                          │ Получает порцию
          ├─────────────────────────────────────────────────────────────────────────┤ токенов от LLM
          │ 2. data: {"chunk": "я ассистент "}                                      │ каждые 30мс
          ├─────────────────────────────────────────────────────────────────────────┤
          │ 3. data: {"chunk": "Pensee!\n\n"}                                       │
          ├─────────────────────────────────────────────────────────────────────────┤
          │ 4. data: [DONE]                                                         ▼
          └────────────────────────────────────────────────────────────────  Соединение закрыто
```

## 2. Реализация Streaming-контроллера в Spring Boot (`AiStreamController.java`)

В Spring Boot для реактивных потоков используется объект `Flux` из библиотеки Project Reactor:

```java
package com.moneytracker.ai.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.Duration;

@RestController
@RequestMapping("/v1/ai")
public class AiStreamController {

    /**
     * Эндпоинт со значением produces = MediaType.TEXT_EVENT_STREAM_VALUE
     * Браузер автоматически открывает потоковое чтение соединения
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamAiAnswer(@RequestParam("prompt") String prompt) {
        
        // В реальном приложении здесь подключается стриминг из WebClient Claude
        // Для учебной демонстрации стримим токены с задержкой 40 миллисекунд
        String[] mockTokens = (
            "Привет! Я изучил состояние твоих задач и счетов в Pensee.\n\n" +
            "Вот короткая сводка на сегодня:\n" +
            "1. В CRM Kanban сейчас 3 активные сделки в стадии ''Переговоры''.\n" +
            "2. Расходы за неделю составили 34 500 ₸, это на 12% меньше среднего бюджета.\n" +
            "3. Самая приоритетная задача: подготовить проект к финальной защите курса!"
        ).split("(?<=\\s)|(?<=\\n)");

        return Flux.fromArray(mockTokens)
                   .delayElements(Duration.ofMillis(40))
                   .map(token -> "data: " + token + "\n\n");
    }
}
```

## 3. Чтение потока на фронтенде через Fetch API и ReadableStream

Многие думают, что для SSE в браузере нужен специальный объект `EventSource`. Но `EventSource` не умеет отправлять кастомные заголовки авторизации (например, JWT Bearer).

Современный способ — использование стандартного `fetch` в связке с `response.body.getReader()`:

```typescript
export async function fetchAiStreamingResponse(
  userPrompt: string,
  onChunk: (chunkText: string) => void,
  onFinish: () => void
) {
  try {
    const response = await fetch(
      `/api/v1/ai/stream?prompt=${encodeURIComponent(userPrompt)}`,
      {
        method: ''GET'',
        headers: {
          ''Accept'': ''text/event-stream'',
        },
        credentials: ''include'', // Передаем куки авторизации
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error(''Response body is not readable'');

    const decoder = new TextDecoder(''utf-8'');
    let buffer = '''';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Декодируем порцию байтов в строку
      buffer += decoder.decode(value, { stream: true });

      // Разбираем строки SSE протокола (начинаются с "data: ")
      const lines = buffer.split(''\n\n'');
      buffer = lines.pop() || ''''; // Сохраняем неполную строку в буфер

      for (const line of lines) {
        if (line.startsWith(''data: '')) {
          const rawData = line.replace(''data: '', '''');
          if (rawData === ''[DONE]'') {
            onFinish();
            return;
          }
          onChunk(rawData);
        }
      }
    }

    onFinish();
  } catch (error) {
    console.error(''Streaming failed:'', error);
    onFinish();
  }
}
```

## 4. UI Чат-компонент с автоматической прокруткой (`widgets/ai-chat/AiChat.tsx`)

Вставь вызов функции в компонент чата и используй `useRef` для плавной автопрокрутки вниз при появлении каждого нового слова:

```tsx
import React, { useState, useRef, useEffect } from ''react'';
import { Send, Bot, User } from ''lucide-react'';
import { fetchAiStreamingResponse } from ''./api/streamService'';

export const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([
    { role: ''assistant'', text: ''Привет! Я твой персональный AI в Pensee. Чем помочь сегодня?'' }
  ]);
  const [input, setInput] = useState('''');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоматическая прокрутка к последней строке
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: ''smooth'' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userText = input;
    setInput('''');
    setIsGenerating(true);

    // Добавляем сообщение пользователя и пустую заглушку для ответа ассистента
    setMessages((prev) => [
      ...prev,
      { role: ''user'', text: userText },
      { role: ''assistant'', text: '''' }
    ]);

    // Запускаем стриминг
    await fetchAiStreamingResponse(
      userText,
      (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            text: updated[lastIndex].text + chunk
          };
          return updated;
        });
      },
      () => setIsGenerating(false)
    );
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#141418] border border-white/10 rounded-md overflow-hidden">
      {/* Список сообщений */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === ''user'' ? ''justify-end'' : ''justify-start''}`}>
            {m.role === ''assistant'' && <Bot className="w-5 h-5 text-zinc-400 mt-1" />}
            <div className={`p-3 rounded-lg max-w-[80%] text-sm ${
              m.role === ''user'' ? ''bg-white text-black font-medium'' : ''bg-[#0e0e11] text-zinc-200 border border-white/5''
            }`}>
              {m.text || <span className="animate-pulse">Думаю...</span>}
            </div>
            {m.role === ''user'' && <User className="w-5 h-5 text-zinc-400 mt-1" />}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div className="p-3 border-t border-white/10 bg-[#0e0e11] flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === ''Enter'' && handleSend()}
          placeholder="Спроси о финансах или задачах..."
          disabled={isGenerating}
          className="flex-1 bg-[#141418] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
        />
        <button
          onClick={handleSend}
          disabled={isGenerating}
          className="px-4 py-2 bg-white text-black font-bold rounded text-xs hover:bg-zinc-200 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
```

## Чек-лист урока

- [ ] Изучены принципы протокола Server-Sent Events (SSE)
- [ ] Реализован эндпоинт `TEXT_EVENT_STREAM_VALUE` на реактивном `Flux` в Spring Boot
- [ ] Написана фронтенд-функция чтения потока через `ReadableStream`
- [ ] Реализован интерфейс чата с плавной автопрокруткой `scrollIntoView`
- [ ] Проверен эффект живого вывода текста слово за словом без лагов'
        WHERE course_id = target_course_id AND day_number = 27;
    END IF;
END $$;
