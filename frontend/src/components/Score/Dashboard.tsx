"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  MessageCircle,
  Mic,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import GDEvaluation from "./GDEvaluation";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user data from localStorage when component mounts
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.user_id) {
          setUserId(parsedUser.user_id);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-white">
                Interactive GD
              </div>
            </div>
            {/* <nav className="hidden md:flex items-center gap-6">
              <a
                href="#dashboard"
                className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
              >
                Dashboard
              </a>
              <a
                href="#practice"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Practice
              </a>
              <a
                href="#history"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                History
              </a>
            </nav> */}
            <div className="flex items-center gap-4">
              <div className="absolute top-4 right-4 flex items-center space-x-3">
                <img
                  src={
                    JSON.parse(localStorage.getItem("user") || "{}")?.photo_url
                  }
                  alt="User profile"
                  className="w-10 h-10 rounded-full border-2 border-yellow-500"
                />
                <span className="font-semibold text-white">
                  {JSON.parse(localStorage.getItem("user") || "{}")?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">
                  Welcome back,{" "}
                  {JSON.parse(localStorage.getItem("user") || "{}")?.name}!
                </h1>
                <p className="text-gray-400 mt-1">
                  Your GD skills are improving. Keep practicing!
                </p>
              </div>
              <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-md transition-colors">
                Start New GD Session
              </button>
            </div>

            {userId && <GDEvaluation userId={userId} />}

            {/* Tabs */}
            <div className="w-full">
              <div className="grid grid-cols-3 w-full max-w-md bg-gray-900/50 rounded-md overflow-hidden">
                {["overview", "recent", "feedback"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-yellow-500 text-black"
                        : "bg-transparent text-white hover:bg-gray-800"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Overview Tab Content */}
              {activeTab === "overview" && (
                <div className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Overall Score Card */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
                      <div className="p-4 pb-2">
                        <h3 className="text-lg font-medium flex items-center">
                          <Star className="mr-2 h-5 w-5 text-yellow-500" />
                          Overall Score
                        </h3>
                      </div>
                      <div className="p-4 pt-0">
                        <div className="text-4xl font-bold text-yellow-500">
                          78
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          Top 22% of all users
                        </p>
                        <div className="mt-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress to next level</span>
                            <span>78%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: "78%" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sessions Completed */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
                      <div className="p-4 pb-2">
                        <h3 className="text-lg font-medium flex items-center">
                          <MessageCircle className="mr-2 h-5 w-5 text-yellow-500" />
                          Sessions
                        </h3>
                      </div>
                      <div className="p-4 pt-0">
                        <div className="text-4xl font-bold">12</div>
                        <p className="text-sm text-gray-400 mt-1">
                          GD sessions completed
                        </p>
                        <div className="flex items-center mt-4 text-green-500 text-sm">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>+3 this week</span>
                        </div>
                      </div>
                    </div>

                    {/* Speaking Time */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
                      <div className="p-4 pb-2">
                        <h3 className="text-lg font-medium flex items-center">
                          <Mic className="mr-2 h-5 w-5 text-yellow-500" />
                          Speaking Time
                        </h3>
                      </div>
                      <div className="p-4 pt-0">
                        <div className="text-4xl font-bold">24%</div>
                        <p className="text-sm text-gray-400 mt-1">
                          Average in sessions
                        </p>
                        <div className="mt-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Ideal range</span>
                            <span>20-30%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full relative">
                            <div className="absolute h-full w-[60%] bg-gray-700 rounded-full"></div>
                            <div className="absolute h-full w-[24%] bg-yellow-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interruptions */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
                      <div className="p-4 pb-2">
                        <h3 className="text-lg font-medium flex items-center">
                          <Users className="mr-2 h-5 w-5 text-yellow-500" />
                          Interactions
                        </h3>
                      </div>
                      <div className="p-4 pt-0">
                        <div className="text-4xl font-bold">18</div>
                        <p className="text-sm text-gray-400 mt-1">
                          References to others' points
                        </p>
                        <div className="flex items-center mt-4 text-green-500 text-sm">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>Improving trend</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skill Breakdown */}
                  <div className="mt-6 bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
                    <div className="p-4">
                      <h3 className="text-lg font-bold">Skill Breakdown</h3>
                      <p className="text-gray-400 text-sm">
                        Your performance across key GD skills
                      </p>
                    </div>
                    <div className="p-4 pt-0">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">
                              Communication Clarity
                            </span>
                            <span className="text-sm font-medium">82%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: "82%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Listening Skills</span>
                            <span className="text-sm font-medium">75%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: "75%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Critical Thinking</span>
                            <span className="text-sm font-medium">68%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: "68%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Leadership</span>
                            <span className="text-sm font-medium">60%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: "60%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Conflict Resolution</span>
                            <span className="text-sm font-medium">72%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: "72%" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent GDs Tab Content */}
              {activeTab === "recent" && (
                <div className="mt-6">
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      {
                        title: "Impact of AI on Job Market",
                        date: "Mar 8, 2025",
                        duration: "18 min",
                        score: 82,
                        participants: 6,
                      },
                      {
                        title: "Climate Change Solutions",
                        date: "Mar 5, 2025",
                        duration: "22 min",
                        score: 75,
                        participants: 5,
                      },
                      {
                        title: "Future of Remote Work",
                        date: "Feb 28, 2025",
                        duration: "20 min",
                        score: 79,
                        participants: 7,
                      },
                      {
                        title: "Cryptocurrency Regulations",
                        date: "Feb 22, 2025",
                        duration: "25 min",
                        score: 68,
                        participants: 6,
                      },
                    ].map((gd, index) => (
                      <div
                        key={index}
                        className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden"
                      >
                        <div className="p-4 pb-2">
                          <div className="flex justify-between">
                            <h3 className="font-bold">{gd.title}</h3>
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-md">
                              Score: {gd.score}
                            </span>
                          </div>
                          <div className="text-gray-400 text-sm flex items-center gap-4 mt-1">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" /> {gd.date}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" /> {gd.duration}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />{" "}
                              {gd.participants} participants
                            </span>
                          </div>
                        </div>
                        <div className="px-4 pb-4 pt-2">
                          <button className="text-yellow-500 hover:text-yellow-400 transition-colors flex items-center text-sm">
                            View Details{" "}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Tab Content */}
              {activeTab === "feedback" && (
                <div className="mt-6">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
                    <div className="p-4">
                      <h3 className="text-lg font-bold">Improvement Areas</h3>
                      <p className="text-gray-400 text-sm">
                        Based on your recent GD performances
                      </p>
                    </div>
                    <div className="p-4 pt-0">
                      <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                          <h3 className="text-lg font-medium flex items-center">
                            <Mic className="mr-2 h-5 w-5 text-yellow-500" />
                            Speaking Time Distribution
                          </h3>
                          <p className="mt-2 text-gray-400">
                            You tend to speak for longer stretches. Try to be
                            more concise and give others a chance to contribute.
                            Aim for 2-3 impactful points rather than lengthy
                            explanations.
                          </p>
                          <div className="mt-3">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20 rounded-md">
                              Actionable Tip
                            </span>
                            <p className="mt-2 text-sm">
                              Practice summarizing your thoughts in 30 seconds
                              or less before speaking in your next GD.
                            </p>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                          <h3 className="text-lg font-medium flex items-center">
                            <Users className="mr-2 h-5 w-5 text-yellow-500" />
                            Building on Others' Ideas
                          </h3>
                          <p className="mt-2 text-gray-400">
                            You introduce good points but rarely reference or
                            build upon what others have said. This can make your
                            contributions seem disconnected from the group
                            discussion.
                          </p>
                          <div className="mt-3">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20 rounded-md">
                              Actionable Tip
                            </span>
                            <p className="mt-2 text-sm">
                              Start at least one contribution with "Building on
                              [name]'s point about..." in your next session.
                            </p>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                          <h3 className="text-lg font-medium flex items-center">
                            <BookOpen className="mr-2 h-5 w-5 text-yellow-500" />
                            Supporting Arguments with Data
                          </h3>
                          <p className="mt-2 text-gray-400">
                            Your arguments would be more persuasive with
                            specific examples or data points. Currently, many of
                            your points rely on general statements.
                          </p>
                          <div className="mt-3">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20 rounded-md">
                              Actionable Tip
                            </span>
                            <p className="mt-2 text-sm">
                              Prepare 2-3 relevant statistics or case studies
                              before your next GD session.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
                    <div className="p-4">
                      <h3 className="text-lg font-bold">
                        Strengths to Leverage
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Areas where you're performing well
                      </p>
                    </div>
                    <div className="p-4 pt-0">
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                          <h3 className="text-lg font-medium text-yellow-500">
                            Clear Articulation
                          </h3>
                          <p className="mt-2 text-gray-400">
                            You express your thoughts clearly and use
                            appropriate vocabulary. Your points are
                            well-structured and easy to follow.
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                          <h3 className="text-lg font-medium text-yellow-500">
                            Conflict Management
                          </h3>
                          <p className="mt-2 text-gray-400">
                            You handle disagreements well and maintain a
                            respectful tone even during heated discussions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2025 Interactive GD. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="#help"
                className="text-sm text-gray-400 hover:text-white"
              >
                Help
              </a>
              <a
                href="#settings"
                className="text-sm text-gray-400 hover:text-white"
              >
                Settings
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
