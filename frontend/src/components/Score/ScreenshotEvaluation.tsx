import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface AttentionMetrics {
  eyes_closed_count: number;
  head_turned_count: number;
}

interface AttentionScore {
  eyes_closed_ratio: number;
  head_turned_ratio: number;
}

interface FaceDetection {
  total_faces: number;
  frame_status: string;
}

interface ScreenshotSummary {
  total_screenshots: number;
  valid_screenshots: number;
  attention_metrics: AttentionMetrics;
  attention_score: AttentionScore;
}

interface EvaluationData {
  _id: string;
  user_id: string;
  screenshots: Array<{
    analysis?: {
      face_detection: FaceDetection;
      "Left Eye Status": string;
      "Right Eye Status": string;
      "Head Position": string;
    };
    error?: string;
  }>;
  summary: ScreenshotSummary;
}

const ScreenshotEvaluation: React.FC<{ userId: string }> = ({ userId }) => {
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const response = await axios.get(`/api/screenshots/evaluate/${userId}`);
        setEvaluationData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch evaluation data');
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [userId]);

  const calculateScores = () => {
    if (!evaluationData) return { eyeScore: 0, faceScore: 0, averageScore: 0 };

    const totalScreenshots = evaluationData.summary.total_screenshots;
    const eyesClosedCount = evaluationData.summary.attention_metrics.eyes_closed_count;
    const headTurnedCount = evaluationData.summary.attention_metrics.head_turned_count;

    // Calculate eye score (100 if eyes open, 0 if closed)
    const eyeScore = ((totalScreenshots - eyesClosedCount) / totalScreenshots) * 100;

    // Calculate face score (100 if straight, 0 if turned)
    const faceScore = ((totalScreenshots - headTurnedCount) / totalScreenshots) * 100;

    // Calculate average score
    const averageScore = (eyeScore + faceScore) / 2;

    return {
      eyeScore: Math.round(eyeScore),
      faceScore: Math.round(faceScore),
      averageScore: Math.round(averageScore)
    };
  };

  if (loading) return <div className="text-center py-4">Loading evaluation data...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!evaluationData) return <div className="text-center py-4">No evaluation data available</div>;

  const scores = calculateScores();

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Screenshot Evaluation Results
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Screenshot Summary</h3>
          <p className="text-gray-600 mb-2">Total Screenshots: {evaluationData.summary.total_screenshots}</p>
          <p className="text-gray-600">Valid Screenshots: {evaluationData.summary.valid_screenshots}</p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Attention Metrics</h3>
          <p className="text-gray-600 mb-2">Eyes Closed Count: {evaluationData.summary.attention_metrics.eyes_closed_count}</p>
          <p className="text-gray-600">Head Turned Count: {evaluationData.summary.attention_metrics.head_turned_count}</p>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Scores</h3>
          <p className="text-gray-600 mb-2">Eye Score: {scores.eyeScore}%</p>
          <p className="text-gray-600 mb-2">Face Score: {scores.faceScore}%</p>
          <p className="text-gray-600 font-semibold">Average Score: {scores.averageScore}%</p>
        </div>
      </div>

      {/* Face Detection Results */}
      <div className="mt-6 bg-white p-5 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Frame Analysis</h3>
        {evaluationData.screenshots.map((screenshot, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <h4 className="font-medium text-gray-700 mb-2">Screenshot {index + 1}</h4>
            {screenshot.error ? (
              <p className="text-red-500">{screenshot.error}</p>
            ) : (
              <div>
                <p className={`mb-2 ${screenshot.analysis?.face_detection.frame_status.includes("good") ? "text-green-500" : "text-red-500"}`}>
                  {screenshot.analysis?.face_detection.frame_status}
                </p>
                <p className="text-gray-600">Total Faces Detected: {screenshot.analysis?.face_detection.total_faces}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScreenshotEvaluation;
