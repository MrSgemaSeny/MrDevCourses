import React, { useState } from 'react';
import { Check, Copy, Info, AlertTriangle, Lightbulb, ShieldAlert } from 'lucide-react';

interface MarkdownViewerProps {
  content?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!content) {
    return <div className="text-zinc-500 text-xs italic">Конспект к уроку отсутствует.</div>;
  }

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeBlockIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        const codeText = codeBuffer.join('\n');
        const currentIndex = codeBlockIndex++;
        renderedElements.push(
          <div key={`code-${i}`} className="my-4 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-[11px] text-zinc-400">
              <span>code</span>
              <button
                onClick={() => handleCopy(codeText, currentIndex)}
                className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                {copiedIndex === currentIndex ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Скопировать</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-zinc-200 leading-relaxed font-mono">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Callout alert blocks
    if (line.startsWith('> [!NOTE]')) {
      renderedElements.push(
        <div key={`alert-${i}`} className="my-3 p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-300 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>{lines[++i]?.replace(/^>\s*/, '')}</div>
        </div>
      );
      continue;
    }

    if (line.startsWith('> [!TIP]')) {
      renderedElements.push(
        <div key={`alert-${i}`} className="my-3 p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>{lines[++i]?.replace(/^>\s*/, '')}</div>
        </div>
      );
      continue;
    }

    if (line.startsWith('> [!WARNING]') || line.startsWith('> [!CAUTION]')) {
      renderedElements.push(
        <div key={`alert-${i}`} className="my-3 p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>{lines[++i]?.replace(/^>\s*/, '')}</div>
        </div>
      );
      continue;
    }

    if (line.startsWith('> [!IMPORTANT]')) {
      renderedElements.push(
        <div key={`alert-${i}`} className="my-3 p-3 rounded-lg bg-purple-950/30 border border-purple-800/40 text-purple-300 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>{lines[++i]?.replace(/^>\s*/, '')}</div>
        </div>
      );
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      renderedElements.push(<h3 key={`h3-${i}`} className="text-base font-bold text-white mt-5 mb-2">{line.replace('### ', '')}</h3>);
    } else if (line.startsWith('## ')) {
      renderedElements.push(<h2 key={`h2-${i}`} className="text-lg font-bold text-white mt-6 mb-3 pb-1 border-b border-zinc-800">{line.replace('## ', '')}</h2>);
    } else if (line.startsWith('# ')) {
      renderedElements.push(<h1 key={`h1-${i}`} className="text-xl font-extrabold text-white mt-6 mb-3">{line.replace('# ', '')}</h1>);
    } else if (line.startsWith('- ')) {
      renderedElements.push(
        <li key={`li-${i}`} className="text-xs text-zinc-300 ml-4 list-disc mb-1 leading-relaxed">
          {line.replace('- ', '')}
        </li>
      );
    } else if (line.trim().length > 0) {
      renderedElements.push(
        <p key={`p-${i}`} className="text-xs sm:text-sm text-zinc-300 mb-3 leading-relaxed">
          {line}
        </p>
      );
    }
  }

  return <div className="space-y-1">{renderedElements}</div>;
};
