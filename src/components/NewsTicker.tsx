import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockNews } from '@/data/mockData';

const NewsTicker: React.FC = () => {
  const { t } = useLanguage();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground mb-2">{t('news.title')}</h3>
      <div className="space-y-1">
        {mockNews.slice(0, 4).map((news) => (
          <a
            key={news.id}
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-secondary/30 transition-all group"
          >
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {news.title}
              </h4>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground flex-shrink-0">
              <span>{news.source}</span>
              <span>•</span>
              <span>{formatTime(news.publishedAt)}</span>
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;
