import React, { useState, useMemo } from 'react';
import { Check, Copy, Info, AlertTriangle, Lightbulb, ShieldAlert } from 'lucide-react';

interface MarkdownViewerProps {
  content?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
        return (
          <code key={pIdx} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-emerald-400">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 3) {
        return (
          <strong key={pIdx} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderedElements = useMemo(() => {
    if (!content) {
      return [<div key="empty" className="text-zinc-500 text-xs italic">Конспект к уроку отсутствует.</div>];
    }

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeBlockIndex = 0;

    const renderCodeBlock = (key: string, codeText: string, idx: number) => (
      <div key={key} className="my-4 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden font-mono text-xs">
        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-[11px] text-zinc-400">
          <span>code</span>
          <button
            onClick={() => handleCopy(codeText, idx)}
            aria-label="Скопировать блок кода"
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            {copiedIndex === idx ? (
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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (inCodeBlock) {
          const codeText = codeBuffer.join('\n');
          const currentIndex = codeBlockIndex++;
          elements.push(renderCodeBlock(`code-${i}`, codeText, currentIndex));
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

      // Multiline Callout alert blocks
      if (line.match(/^>\s*\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]/i)) {
        const typeMatch = line.match(/^>\s*\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]/i);
        const alertType = typeMatch ? typeMatch[1].toUpperCase() : 'NOTE';
        const calloutLines: string[] = [];

        const initialText = line.replace(/^>\s*\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]\s*/i, '');
        if (initialText.trim()) {
          calloutLines.push(initialText);
        }

        while (i + 1 < lines.length && lines[i + 1].startsWith('>')) {
          i++;
          calloutLines.push(lines[i].replace(/^>\s*/, ''));
        }

        const calloutContent = calloutLines.length > 0 ? calloutLines : [''];

        let containerClass = 'bg-blue-950/30 border-blue-800/40 text-blue-300';
        let IconComponent = Info;
        let iconClass = 'text-blue-400';

        if (alertType === 'TIP') {
          containerClass = 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300';
          IconComponent = Lightbulb;
          iconClass = 'text-emerald-400';
        } else if (alertType === 'WARNING' || alertType === 'CAUTION') {
          containerClass = 'bg-amber-950/30 border-amber-800/40 text-amber-300';
          IconComponent = AlertTriangle;
          iconClass = 'text-amber-400';
        } else if (alertType === 'IMPORTANT') {
          containerClass = 'bg-purple-950/30 border-purple-800/40 text-purple-300';
          IconComponent = ShieldAlert;
          iconClass = 'text-purple-400';
        }

        elements.push(
          <div key={`alert-${i}`} className={`my-3 p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${containerClass}`}>
            <IconComponent className={`w-4 h-4 shrink-0 mt-0.5 ${iconClass}`} />
            <div className="space-y-1 leading-relaxed">
              {calloutContent.map((cLine, cIdx) => (
                <div key={cIdx}>{renderFormattedText(cLine)}</div>
              ))}
            </div>
          </div>
        );
        continue;
      }

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-base font-bold text-white mt-5 mb-2">
            {renderFormattedText(line.replace('### ', ''))}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-lg font-bold text-white mt-6 mb-3 pb-1 border-b border-zinc-800">
            {renderFormattedText(line.replace('## ', ''))}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${i}`} className="text-xl font-extrabold text-white mt-6 mb-3">
            {renderFormattedText(line.replace('# ', ''))}
          </h1>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={`li-${i}`} className="text-xs text-zinc-300 ml-4 list-disc mb-1 leading-relaxed">
            {renderFormattedText(line.replace('- ', ''))}
          </li>
        );
      } else if (line.trim().length > 0) {
        elements.push(
          <p key={`p-${i}`} className="text-xs sm:text-sm text-zinc-300 mb-3 leading-relaxed">
            {renderFormattedText(line)}
          </p>
        );
      }
    }

    // Flush unclosed code fences
    if (inCodeBlock && codeBuffer.length > 0) {
      const codeText = codeBuffer.join('\n');
      const currentIndex = codeBlockIndex++;
      elements.push(renderCodeBlock(`code-unclosed`, codeText, currentIndex));
    }

    return elements;
  }, [content, copiedIndex]);

  return <div className="space-y-1">{renderedElements}</div>;
};
