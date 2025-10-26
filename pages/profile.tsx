import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import { Award, Briefcase, Star, Zap } from 'lucide-react';

const Profile: NextPage = () => {
  // Mock user data
  const user = {
    name: 'Sarah Johnson',
    title: 'Strategic Finance Consultant',
    bio: 'Finance professional with 10+ years of experience, specializing in AI-enhanced financial analysis and strategic planning.',
    avatar: '/placeholder-avatar.jpg',
    metrics: {
      aiPartnerships: 5,
      projectsCompleted: 12,
      impactScore: 92,
      humanValueAdd: 87
    },
    skills: [
      'Financial Analysis',
      'Strategic Planning',
      'AI Prompt Engineering',
      'Data Visualization',
      'Risk Assessment',
      'Human-AI Collaboration'
    ],
    achievements: [
      {
        title: 'Reduced analysis time by 75%',
        description: 'Developed AI-human workflow for quarterly financial reviews'
      },
      {
        title: 'Increased forecast accuracy by 32%',
        description: 'Created hybrid approach combining AI predictions with human expertise'
      },
      {
        title: 'AI Collaboration Certified',
        description: 'Advanced certification in financial AI tools and workflows'
      }
    ],
    recentProjects: [
      {
        title: 'Q3 Financial Strategy',
        client: 'TechCorp Inc.',
        description: 'Led AI-enhanced financial planning process',
        impact: 'Identified $2.3M in cost savings opportunities'
      },
      {
        title: 'Investment Portfolio Analysis',
        client: 'Global Ventures',
        description: 'Developed hybrid risk assessment model',
        impact: 'Improved return on investment by 18%'
      }
    ]
  };

  return (
    <Layout>
      <Head>
        <title>{user.name} | AllIance Profile</title>
        <meta name="description" content={`${user.name} - ${user.title}`} />
      </Head>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Profile header */}
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-human-light to-ai-light">
          <div className="flex items-center">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white">
              <img
                className="h-full w-full object-cover"
                src={user.avatar}
                alt={user.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/150';
                }}
              />
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm font-medium text-gray-500">{user.title}</p>
              <div className="mt-2 flex">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-human-light text-human-dark">
                  Human-AI Collaborator
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio section */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Bio</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{user.bio}</p>
        </div>

        {/* Metrics section */}
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6">
              <div className="text-center">
                <dt className="text-sm font-medium text-gray-500 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-human mr-1" />
                  AI Partnerships
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-human">{user.metrics.aiPartnerships}</dd>
              </div>
              <div className="text-center mt-4 sm:mt-0">
                <dt className="text-sm font-medium text-gray-500 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-human mr-1" />
                  Projects Completed
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-human">{user.metrics.projectsCompleted}</dd>
              </div>
              <div className="text-center mt-4 sm:mt-0">
                <dt className="text-sm font-medium text-gray-500 flex items-center justify-center">
                  <Star className="h-5 w-5 text-human mr-1" />
                  Impact Score
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-human">{user.metrics.impactScore}</dd>
              </div>
              <div className="text-center mt-4 sm:mt-0">
                <dt className="text-sm font-medium text-gray-500 flex items-center justify-center">
                  <Award className="h-5 w-5 text-human mr-1" />
                  Human Value Add
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-human">{user.metrics.humanValueAdd}</dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Skills section */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.skills.map((skill, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Achievements section */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Achievements</h3>
          <div className="mt-4 space-y-4">
            {user.achievements.map((achievement, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-human">{achievement.title}</h4>
                <p className="mt-1 text-sm text-gray-500">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects section */}
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Projects</h3>
          <div className="mt-4 space-y-4">
            {user.recentProjects.map((project, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-human">{project.title}</h4>
                <p className="text-sm text-gray-700">Client: {project.client}</p>
                <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                <p className="mt-1 text-sm font-medium text-human-dark">{project.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile; 