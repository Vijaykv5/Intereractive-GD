import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GDEvaluationProps {
  userId: string;
  onEvaluationComplete?: (evaluation: any) => void;
}

interface EvaluationResult {
  topic_coverage: {
    score: number;
    analysis: string;
    key_points_covered: string[];
    missing_points: string[];
  };
  depth_of_analysis: {
    score: number;
    analysis: string;
  };
  relevance: {
    score: number;
    analysis: string;
  };
  structure: {
    score: number;
    analysis: string;
  };
  overall_score: number;
  summary: string;
  suggestions: string[];
}

const GDEvaluation: React.FC<GDEvaluationProps> = ({ userId, onEvaluationComplete }) => {
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/user/${userId}/gd-evaluation`);
        if (!response.ok) {
          throw new Error('Failed to fetch evaluation');
        }
        const data = await response.json();
        if (data.success) {
          setEvaluation(data.evaluation);
          if (onEvaluationComplete) {
            onEvaluationComplete(data.evaluation);
          }
        } else {
          setError(data.error || 'Failed to fetch evaluation');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [userId, onEvaluationComplete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-600">No evaluation results available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      {/* Overall Score */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Overall Performance</h2>
        <div className="mt-2">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100">
            <span className="text-3xl font-bold text-blue-600">
              {Math.round(evaluation.overall_score * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Topic Coverage */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Topic Coverage</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-green-500 rounded-full"
                style={{ width: `${evaluation.topic_coverage.score * 100}%` }}
              />
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Score: {Math.round(evaluation.topic_coverage.score * 100)}%
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700">Key Points Covered</h4>
            <ul className="mt-2 space-y-1">
              {evaluation.topic_coverage.key_points_covered.map((point, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Missing Points</h4>
            <ul className="mt-2 space-y-1">
              {evaluation.topic_coverage.missing_points.map((point, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Detailed Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700">Depth of Analysis</h4>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${evaluation.depth_of_analysis.score * 100}%` }}
                />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Score: {Math.round(evaluation.depth_of_analysis.score * 100)}%
              </p>
            </div>
            <p className="mt-2 text-sm text-gray-600">{evaluation.depth_of_analysis.analysis}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700">Relevance</h4>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-purple-500 rounded-full"
                  style={{ width: `${evaluation.relevance.score * 100}%` }}
                />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Score: {Math.round(evaluation.relevance.score * 100)}%
              </p>
            </div>
            <p className="mt-2 text-sm text-gray-600">{evaluation.relevance.analysis}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700">Structure</h4>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-orange-500 rounded-full"
                  style={{ width: `${evaluation.structure.score * 100}%` }}
                />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Score: {Math.round(evaluation.structure.score * 100)}%
              </p>
            </div>
            <p className="mt-2 text-sm text-gray-600">{evaluation.structure.analysis}</p>
          </div>
        </div>
      </div>

      {/* Summary and Suggestions */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Summary</h3>
        <p className="text-gray-600">{evaluation.summary}</p>

        <h3 className="text-xl font-semibold text-gray-800">Suggestions for Improvement</h3>
        <ul className="space-y-2">
          {evaluation.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2" />
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GDEvaluation; 