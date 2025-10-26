import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import { Search, Filter, ArrowRight, Briefcase, DollarSign, Clock, Users } from 'lucide-react';

const Missions: NextPage = () => {
  // Mock missions data
  const missions = [
    {
      id: 1,
      title: 'Financial Strategy Development for Tech Startup',
      company: 'InnovateTech',
      description: 'Develop a comprehensive financial strategy for a growing tech startup, including funding options, cash flow management, and growth projections.',
      skills: ['Financial Analysis', 'Strategic Planning', 'Startup Experience'],
      compensation: '$5,000 - $8,000',
      duration: '2-3 weeks',
      teamSize: '2-3 people',
      humanValueAdd: 'Strategic decision-making, industry expertise, stakeholder communication'
    },
    {
      id: 2,
      title: 'Investment Portfolio Optimization',
      company: 'Global Investments Inc.',
      description: 'Optimize a diversified investment portfolio using AI analysis tools while providing human expertise on market trends and risk assessment.',
      skills: ['Portfolio Management', 'Risk Assessment', 'Market Analysis'],
      compensation: '$3,000 - $5,000',
      duration: '1-2 weeks',
      teamSize: '1-2 people',
      humanValueAdd: 'Qualitative risk assessment, ethical considerations, client relationship management'
    },
    {
      id: 3,
      title: 'AI-Enhanced Financial Reporting System',
      company: 'Enterprise Solutions',
      description: 'Design and implement a financial reporting system that leverages AI for data processing while maintaining human oversight for accuracy and compliance.',
      skills: ['Financial Reporting', 'System Design', 'Compliance Knowledge'],
      compensation: '$7,000 - $10,000',
      duration: '4-6 weeks',
      teamSize: '3-4 people',
      humanValueAdd: 'Compliance expertise, data interpretation, strategic insights from reports'
    }
  ];

  return (
    <Layout>
      <Head>
        <title>Strategic Missions | AllIance</title>
        <meta name="description" content="Find opportunities that value human-AI collaboration" />
      </Head>

      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Strategic Missions</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search missions..."
              className="focus:ring-human focus:border-human block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <button className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{mission.title}</h3>
                  <p className="mt-1 text-sm text-human">{mission.company}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-human-light text-human-dark">
                  New
                </span>
              </div>
              
              <p className="mt-3 text-sm text-gray-500">{mission.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {mission.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  <span>{mission.compensation}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  <span>{mission.duration}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  <span>{mission.teamSize}</span>
                </div>
              </div>
              
              <div className="mt-5 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-500">Human Value Add:</h4>
                <p className="mt-1 text-sm text-gray-700">{mission.humanValueAdd}</p>
              </div>
              
              <div className="mt-5 flex justify-end">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-human hover:bg-human-dark">
                  Apply for Mission
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Missions; 