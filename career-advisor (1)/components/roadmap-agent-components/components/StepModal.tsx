import React from 'react';
import type { StepDetails } from '../types/roadmap';
import { X, Clock, Target, BookOpen, Code, AlertTriangle, CheckCircle } from 'lucide-react';

interface StepModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepDetails: StepDetails | null;
  isLoading: boolean;
}

const StepModal: React.FC<StepModalProps> = ({ isOpen, onClose, stepDetails, isLoading }) => {
  if (!isOpen) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'course': return '🎓';
      case 'book': return '📚';
      case 'video': return '🎥';
      case 'documentation': return '📄';
      case 'practice': return '💻';
      case 'project': return '🚀';
      default: return '📖';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {stepDetails?.step.title || 'Loading...'}
            </h2>
            <p className="text-gray-600">{stepDetails?.step.description}</p>
            {stepDetails?.step.duration && (
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Duration: {stepDetails.step.duration}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Loading detailed information...</span>
            </div>
          ) : stepDetails ? (
            <div className="space-y-8">
              {/* Skills Section */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Skills to Master
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {stepDetails.skillDetails.map((skill, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(skill.difficulty)}`}>
                          {skill.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{skill.description}</p>
                      
                      <div className="mb-3">
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Clock className="w-4 h-4 mr-1" />
                          Time to learn: {skill.timeToLearn}
                        </div>
                      </div>

                      {/* Learning Path */}
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-800 mb-2 text-sm">Learning Path:</h5>
                        <ol className="text-sm text-gray-600 space-y-1">
                          {skill.learningPath.map((step, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-blue-600 mr-2 font-medium">{idx + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Practice Projects */}
                      {skill.practiceProjects.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
                            <Code className="w-4 h-4 mr-1" />
                            Practice Projects:
                          </h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {skill.practiceProjects.map((project, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-green-600 mr-2">•</span>
                                {project}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Resources */}
                      {skill.resources.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            Resources:
                          </h5>
                          <div className="space-y-2">
                            {skill.resources.map((resource, idx) => (
                              <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                                <div className="flex items-start">
                                  <span className="mr-2">{getResourceIcon(resource.type)}</span>
                                  <div>
                                    <span className="font-medium text-gray-800">{resource.title}</span>
                                    <p className="text-gray-600 text-xs mt-1">{resource.description}</p>
                                    {resource.url && (
                                      <a 
                                        href={resource.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-xs"
                                      >
                                        View Resource →
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Tips Section */}
              {stepDetails.tips.length > 0 && (
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Pro Tips
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {stepDetails.tips.map((tip, index) => (
                        <li key={index} className="flex items-start text-green-800">
                          <span className="text-green-600 mr-2">💡</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Common Mistakes */}
              {stepDetails.commonMistakes.length > 0 && (
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    Common Mistakes to Avoid
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {stepDetails.commonMistakes.map((mistake, index) => (
                        <li key={index} className="flex items-start text-red-800">
                          <span className="text-red-600 mr-2">⚠️</span>
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Success Metrics */}
              {stepDetails.successMetrics.length > 0 && (
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    How to Know You've Mastered This Step
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {stepDetails.successMetrics.map((metric, index) => (
                        <li key={index} className="flex items-start text-blue-800">
                          <span className="text-blue-600 mr-2">✅</span>
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Milestones */}
              {stepDetails.step.milestones && stepDetails.step.milestones.length > 0 && (
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Milestones</h3>
                  <div className="space-y-2">
                    {stepDetails.step.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </div>
                        <span className="text-gray-800">{milestone}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Failed to load step details. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepModal;