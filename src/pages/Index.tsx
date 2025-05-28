
import { useState } from 'react';
import { ResumeUploader } from '@/components/ResumeUploader';
import { AnalysisResults } from '@/components/AnalysisResults';
import { Header } from '@/components/Header';
import { FileText, Brain, Target } from 'lucide-react';

const Index = () => {
  const [resumeText, setResumeText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleResumeUpload = (text: string) => {
    setResumeText(text);
    setAnalysis(null);
  };

  const handleAnalysisComplete = (result: any) => {
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Target className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Resume Auditor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get instant, AI-driven feedback on your resume. Upload your PDF and receive 
            detailed insights to land your dream job.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!resumeText ? (
            <ResumeUploader onUpload={handleResumeUpload} />
          ) : (
            <div className="space-y-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Resume Uploaded</span>
                  </div>
                  <button
                    onClick={() => {
                      setResumeText('');
                      setAnalysis(null);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Upload Different Resume
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {resumeText.substring(0, 300)}...
                  </p>
                </div>
              </div>

              <AnalysisResults 
                resumeText={resumeText}
                isAnalyzing={isAnalyzing}
                analysis={analysis}
                onAnalyze={handleAnalyze}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </div>
          )}
        </div>

        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload Resume</h3>
              <p className="text-gray-600 text-sm">Upload your resume in PDF format</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600 text-sm">Our AI analyzes your resume content</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Feedback</h3>
              <p className="text-gray-600 text-sm">Receive detailed improvement suggestions</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
