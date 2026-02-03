"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

export default function TestVideoGeneration() {
  const [courseId, setCourseId] = useState("e1bb153a-619a-495c-bc86-0facbe4c25b2");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [testingElevenLabs, setTestingElevenLabs] = useState(false);
  const [elevenLabsTest, setElevenLabsTest] = useState<any>(null);
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [accountCheck, setAccountCheck] = useState<any>(null);

  const handleGenerateVideo = async () => {
    if (!courseId.trim()) {
      toast.error("Please enter a course ID");
      return;
    }

    setIsGenerating(true);
    setResult(null);
    
    const loadingToast = toast.loading("Generating video content... This may take several minutes due to rate limiting.");

    try {
      // Call the generate-video-content API directly
      const response = await axios.post("/api/generate-video-content", {
        chapter: {
          chapterId: 'intro-cybersecurity',
          chapterTitle: 'What is Cybersecurity?',
          subContent: [
            'Defining cybersecurity and its goal',
            'Why cybersecurity is essential today', 
            'Understanding who is at risk'
          ]
        },
        courseId: courseId.trim()
      });

      console.log("Video generation result:", response.data);
      setResult(response.data);
      toast.success("Video generation completed successfully!", { id: loadingToast });
      
    } catch (error: any) {
      console.error("Video generation failed:", error);
      const errorMessage = error.response?.data?.error || error.message || "Video generation failed";
      toast.error(`Error: ${errorMessage}`, { id: loadingToast });
      setResult({ error: errorMessage });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestElevenLabs = async () => {
    setTestingElevenLabs(true);
    setElevenLabsTest(null);
    
    const testToast = toast.loading("Testing ElevenLabs API connection...");
    
    try {
      const response = await axios.post("/api/test-fonada"); // Keeping same endpoint for now
      console.log("ElevenLabs test result:", response.data);
      setElevenLabsTest({ success: true, data: response.data });
      toast.success("ElevenLabs API is working!", { id: testToast });
    } catch (error: any) {
      console.error("ElevenLabs test failed:", error);
      const errorData = error.response?.data || { error: error.message };
      setElevenLabsTest({ success: false, error: errorData });
      toast.error(`ElevenLabs API test failed: ${errorData.message || error.message}`, { id: testToast });
    } finally {
      setTestingElevenLabs(false);
    }
  };

  const handleCheckAccount = async () => {
    setCheckingAccount(true);
    setAccountCheck(null);
    
    const checkToast = toast.loading("Checking Fonada account status...");
    
    try {
      const response = await axios.post("/api/check-fonada-account");
      console.log("Account check result:", response.data);
      setAccountCheck({ success: true, data: response.data });
      toast.success("Account check completed!", { id: checkToast });
    } catch (error: any) {
      console.error("Account check failed:", error);
      const errorData = error.response?.data || { error: error.message };
      setAccountCheck({ success: false, error: errorData });
      toast.error(`Account check failed: ${errorData.message || error.message}`, { id: checkToast });
    } finally {
      setCheckingAccount(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Video Generation</CardTitle>
          <p className="text-muted-foreground">
            Direct video content generation for existing courses (bypasses Gemini API)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Button 
              onClick={handleCheckAccount}
              disabled={checkingAccount}
              variant="secondary"
              className="min-w-37.5"
            >
              {checkingAccount ? "Checking..." : "Check Account"}
            </Button>
            <Button 
              onClick={handleTestElevenLabs}
              disabled={testingElevenLabs}
              variant="outline"
              className="min-w-37.5"
            >
              {testingElevenLabs ? "Testing..." : "Test ElevenLabs API"}
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              👈 Now using ElevenLabs TTS instead of Fonada
            </div>
          </div>
          
          <div className="flex gap-4">
            <Input
              placeholder="Enter Course ID"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleGenerateVideo}
              disabled={isGenerating}
              className="min-w-37.5"
            >
              {isGenerating ? "Generating..." : "Generate Video"}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p><strong>Current settings:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>2 second delays between TTS requests (much faster than Fonada)</li>
              <li>1 minute wait on rate limit errors</li>
              <li>Single retry attempt for failed requests</li>
              <li>✅ SWITCHED to ElevenLabs - no more concurrent limit issues!</li>
            </ul>
          </div>

          {accountCheck && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className={accountCheck.success ? "text-green-600" : "text-red-600"}>
                  Account Status {accountCheck.success ? "✅ Retrieved" : "❌ Failed"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-48">
                  {JSON.stringify(accountCheck, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {elevenLabsTest && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className={elevenLabsTest.success ? "text-green-600" : "text-red-600"}>
                  ElevenLabs API Test {elevenLabsTest.success ? "✅ Passed" : "❌ Failed"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-48">
                  {JSON.stringify(elevenLabsTest, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className={result.error ? "text-red-600" : "text-green-600"}>
                  {result.error ? "Error Result" : "Success Result"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
          
          {isGenerating && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">
                    Generating video content... Please wait (this typically takes 5-10 minutes due to conservative rate limiting)
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}