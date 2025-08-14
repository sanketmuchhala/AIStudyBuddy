import React from 'react';
import { Lightbulb, AlertTriangle, Info } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: {
    type: 'schedule_adjustment' | 'technique_change' | 'break_modification' | 'goal_revision';
    title: string;
    description: string;
    reasoning: string;
    impact: 'high' | 'medium' | 'low';
    actionRequired: boolean;
  };
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const getIcon = () => {
    switch (recommendation.impact) {
      case 'high':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'medium':
        return <Lightbulb className="h-3 w-3 text-yellow-500" />;
      default:
        return <Info className="h-3 w-3 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (recommendation.impact) {
      case 'high':
        return 'border-red-200 dark:border-red-800';
      case 'medium':
        return 'border-yellow-200 dark:border-yellow-800';
      default:
        return 'border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className={`p-2 border-l-3 ${getBorderColor()} bg-gray-50 dark:bg-gray-800 rounded-r-lg`}>
      <div className="flex items-start space-x-1">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white text-xs truncate">
            {recommendation.title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {recommendation.description}
          </p>
          {recommendation.actionRequired && (
            <span className="inline-block mt-1 text-xs px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full">
              Action Required
            </span>
          )}
        </div>
      </div>
    </div>
  );
}