import React from "react";
import { MessageCircle, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 to-blue-100 text-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-violet-800">
          Group Discussion
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a href="#features" className="hover:text-violet-600">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-violet-600">
                How it Works
              </a>
            </li>
            <li>
              <a href="#testimonials" className="hover:text-violet-600">
                Testimonials
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 text-violet-800">
          Elevate Your Discussions
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join GroundTalk, the premier platform for meaningful conversations and
          idea sharing.
        </p>
        <button
          onClick={() => navigate("/topic")}
          className="bg-violet-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-violet-700 transition duration-300"
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center text-violet-800">
          Why Choose GroundTalk?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<MessageCircle size={40} />}
            title="Engaging Discussions"
            description="Participate in thought-provoking conversations on various topics."
          />
          <FeatureCard
            icon={<Users size={40} />}
            title="Community Building"
            description="Connect with like-minded individuals and grow your network."
          />
          <FeatureCard
            icon={<Zap size={40} />}
            title="Real-time Interactions"
            description="Experience seamless, real-time discussions with instant updates."
          />
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-violet-800">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-8">
            <Step
              number={1}
              title="Sign Up"
              description="Create your account in seconds"
            />
            <Step
              number={2}
              title="Join Discussions"
              description="Find topics that interest you"
            />
            <Step
              number={3}
              title="Share Ideas"
              description="Contribute to meaningful conversations"
            />
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section id="testimonials" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center text-violet-800">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TestimonialCard
            quote="GroundTalk has revolutionized how I engage in online discussions. It's a game-changer!"
            author="Sarah L."
          />
          <TestimonialCard
            quote="The quality of conversations on this platform is unmatched. I've learned so much!"
            author="Michael R."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-violet-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 GroundTalk. All rights reserved.</p>
          <div className="mt-4">
            <a href="#" className="hover:underline mx-2">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline mx-2">
              Terms of Service
            </a>
            <a href="#" className="hover:underline mx-2">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center">
    <div className="text-violet-600 mb-4 flex justify-center">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Step: React.FC<{
  number: number;
  title: string;
  description: string;
}> = ({ number, title, description }) => (
  <div className="text-center">
    <div className="bg-violet-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const TestimonialCard: React.FC<{ quote: string; author: string }> = ({
  quote,
  author,
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <p className="text-gray-600 italic mb-4">"{quote}"</p>
    <p className="font-semibold text-right">- {author}</p>
  </div>
);

export default LandingPage;
