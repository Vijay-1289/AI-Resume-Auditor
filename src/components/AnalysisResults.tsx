
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  FileText,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResultsProps {
  resumeText: string;
  isAnalyzing: boolean;
  analysis: any;
  onAnalyze: () => void;
  onAnalysisComplete: (result: any) => void;
}

export const AnalysisResults = ({
  resumeText,
  isAnalyzing,
  analysis,
  onAnalyze,
  onAnalysisComplete
}: AnalysisResultsProps) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  const analyzeResume = async () => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert resume reviewer and career coach. Analyze the provided resume and return a JSON response with the following structure:
              {
                "overallScore": number (0-100),
                "categories": {
                  "format": {"score": number (0-100), "feedback": "string"},
                  "content": {"score": number (0-100), "feedback": "string"},
                  "keywords": {"score": number (0-100), "feedback": "string"},
                  "experience": {"score": number (0-100), "feedback": "string"}
                },
                "strengths": ["string array of 3-5 strengths"],
                "improvements": ["string array of 3-5 specific improvements"],
                "recommendations": ["string array of 3-5 actionable recommendations"]
              }
              
              Provide specific, actionable feedback. Focus on ATS compatibility, content quality, formatting, and keyword optimization.`
            },
            {
              role: 'user',
              content: `Please analyze this resume:\n\n${resumeText}`
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const analysisResult = JSON.parse(data.choices[0].message.content);
      
      onAnalysisComplete(analysisResult);
      
      toast({
        title: "Analysis Complete!",
        description: "Your resume has been analyzed successfully.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Please check your API key and try again.",
        variant: "destructive",
      });
    }
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey);
      setShowApiKeyInput(false);
      toast({
        title: "API Key Saved",
        description: "You can now analyze your resume.",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (showApiKeyInput) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>OpenAI API Key Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            To analyze your resume with AI, please enter your OpenAI API key. 
            Your key will be stored locally and never shared.
          </p>
          <input
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleApiKeySubmit} className="w-full">
            Save API Key & Continue
          </Button>
          <p className="text-xs text-gray-500">
            Don't have an API key? Get one at{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              OpenAI Platform
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis && !isAnalyzing) {
    return (
      <div className="text-center">
        <Button 
          onClick={() => {
            onAnalyze();
            analyzeResume();
          }}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Brain className="w-5 h-5 mr-2" />
          Analyze Resume with AI
        </Button>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Your Resume...</h3>
          <p className="text-gray-600">Our AI is reviewing your resume content, formatting, and ATS compatibility.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Overall Resume Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore}
            </div>
            <div className="flex-1">
              <Progress value={analysis.overallScore} className="h-3" />
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(analysis.overallScore)} ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore >= 80 ? 'Excellent' : analysis.overallScore >= 60 ? 'Good' : 'Needs Work'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(analysis.categories).map(([category, data]: [string, any]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg capitalize flex items-center justify-between">
                <span>{category}</span>
                <span className={`text-xl font-bold ${getScoreColor(data.score)}`}>
                  {data.score}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={data.score} className="h-2 mb-3" />
              <p className="text-sm text-gray-600">{data.feedback}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>Strengths</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {analysis.strengths.map((strength: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{strength}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <span>Areas for Improvement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {analysis.improvements.map((improvement: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm">{improvement}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Actionable Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {analysis.recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-900">{recommendation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="text-center">
        <Button 
          onClick={() => {
            onAnalyze();
            analyzeResume();
          }}
          variant="outline"
          className="mr-4"
        >
          Re-analyze Resume
        </Button>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-green-600 hover:bg-green-700"
        >
          Analyze Another Resume
        </Button>
      </div>
    </div>
  );
};
