import React, { Component, ChangeEvent } from 'react';
import localStorageManager from '../../lib/utils/localStorageManager';

interface SkillsStepProps {
  skillsInput: string;
  skills: string[];
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface SkillsStepState {
  suggestedSkills: string[];
  selectedSkills: Set<string>;
}

export default class SkillsStep extends Component<SkillsStepProps, SkillsStepState> {
  constructor(props: SkillsStepProps) {
    super(props);
    this.state = {
      suggestedSkills: [],
      selectedSkills: new Set()
    };
  }

  componentDidMount() {
    // Load projects from localStorage
    const projects = localStorageManager.getStepData<any[]>('githubProjects');
    
    if (projects && projects.length > 0) {
      // Extract skills from projects
      const projectSkills = localStorageManager.extractSkillsFromProjects(projects);
      
      // Filter out skills that are already selected
      const newSuggestions = projectSkills.filter(skill => 
        !this.props.skills.includes(skill)
      );
      
      this.setState({ suggestedSkills: newSuggestions });
    }
    
    // Load saved skills from localStorage if the current skills are empty
    if (this.props.skills.length === 0) {
      const savedSkills = localStorageManager.getStepData<string[]>('skills');
      if (savedSkills && savedSkills.length > 0) {
        // We need to format them back to a comma-separated string for the input field
        const skillsString = savedSkills.join(', ');
        // Simulate an input change event to update the parent state
        const mockEvent = {
          target: {
            name: 'skills',
            value: skillsString
          }
        } as ChangeEvent<HTMLInputElement>;
        this.props.onChange(mockEvent);
      }
    }

    // Initialize selectedSkills with current skills
    const selectedSkillsSet = new Set(this.props.skills.map(skill => skill.toLowerCase()));
    this.setState({ selectedSkills: selectedSkillsSet });

    // Save current step data to localStorage
    localStorageManager.saveStepData('skills', this.props.skills);
  }

  componentDidUpdate(prevProps: SkillsStepProps) {
    // Update localStorage when skills change
    if (prevProps.skills !== this.props.skills) {
      localStorageManager.saveStepData('skills', this.props.skills);
      
      // Update selectedSkills set when props.skills changes
      const selectedSkillsSet = new Set(this.props.skills.map(skill => skill.toLowerCase()));
      this.setState({ selectedSkills: selectedSkillsSet });
    }
  }

  isValid = (): boolean => {
    return this.props.skills.length > 0;
  };

  handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (this.isValid()) {
      // Save skills to localStorage
      localStorageManager.saveStepData('skills', this.props.skills);
      this.props.onNext();
    }
  };
  
  addSuggestedSkill = (skill: string) => {
    this.handleAddSkill(skill);
  };

  handleAddSkill = (skill: string) => {
    // Check if skill already exists in the input
    if (!this.isSkillAlreadySelected(skill)) {
      // Add skill to the input with a comma if there are already skills
      const updatedInput = this.props.skillsInput 
      ? `${this.props.skillsInput}, ${skill}`
      : skill;
    
      // Create a synthetic event to pass to the onChange handler
      const syntheticEvent = {
      target: {
          name: 'skillsInput',
          value: updatedInput
      }
    } as ChangeEvent<HTMLInputElement>;
    
      this.props.onChange(syntheticEvent);
    
      // Add to selected skills set
      this.setState(prevState => {
        const newSelectedSkills = new Set(prevState.selectedSkills);
        newSelectedSkills.add(skill.toLowerCase());
        return { selectedSkills: newSelectedSkills };
      });
    }
  }
  
  isSkillAlreadySelected = (skill: string): boolean => {
    // Check if skill is already in the selected skills
    return this.state.selectedSkills.has(skill.toLowerCase()) || 
           this.props.skills.some(s => s.toLowerCase() === skill.toLowerCase()) ||
           this.props.skillsInput.toLowerCase().includes(skill.toLowerCase());
  }

  render() {
    const { skillsInput, skills, onChange, onPrev } = this.props;
    const { suggestedSkills } = this.state;

    // Most common software engineering intern skills
    const commonSkills = [
      "JavaScript", "Python", "Java", "React", "Git",
      "SQL", "Data Structures", "Algorithms", "Problem Solving", "HTML/CSS",
      "Node.js", "TypeScript", "Docker", "REST APIs", "Object-Oriented Programming",
      "AWS", "Testing", "Agile/Scrum", "Communication", "Teamwork"
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
            Skills & Expertise
          </h3>
          <p className="text-gray-400 mt-2">
            List your technical and soft skills
          </p>
        </div>

        <div className="bg-gray-900/60 rounded-xl p-6 backdrop-blur-sm border border-gray-800/50 shadow-xl shadow-black/5">
          <div className="space-y-4">
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-300 mb-2">
                Skills <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-2">(Separate with commas)</span>
              </label>
              <input
                type="text"
                name="skills"
                id="skills"
                value={skillsInput}
                onChange={onChange}
                required
                className="w-full bg-black/80 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent transition-all duration-300"
                placeholder="e.g. JavaScript, React, Node.js, Problem Solving"
              />
              
              <div className="text-xs text-gray-500 mt-2 pl-1">
                Add programming languages, frameworks, tools, and soft skills that you possess
              </div>
            </div>

            {/* Suggested Skills Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-300">Suggested Skills</h3>
              <div className="flex flex-wrap gap-2">
                {/* Common skills */}
                {commonSkills
                  .filter(skill => !this.isSkillAlreadySelected(skill))
                  .map((skill, index) => (
                    <button
                      key={`common-${index}`}
                      type="button"
                      onClick={() => this.handleAddSkill(skill)}
                      className="bg-black/80 text-gray-300 border border-gray-700/30 px-3 py-1 rounded-full text-sm hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      + {skill}
                    </button>
                  ))
                }
                
                {/* GitHub project skills */}
                {suggestedSkills
                  .filter(skill => !this.isSkillAlreadySelected(skill) && 
                                  !commonSkills.some(cs => cs.toLowerCase() === skill.toLowerCase()))
                  .map((skill, index) => (
                    <button
                      key={`github-${index}`}
                      type="button"
                      onClick={() => this.addSuggestedSkill(skill)}
                      className="bg-black/80 text-gray-300 border border-gray-700/30 px-3 py-1 rounded-full text-sm hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      + {skill}
                    </button>
                  ))
                }
              </div>
              
              {/* Show message when no suggestions available */}
              {commonSkills.filter(skill => !this.isSkillAlreadySelected(skill)).length === 0 && 
               suggestedSkills.filter(skill => !this.isSkillAlreadySelected(skill) && 
                                             !commonSkills.some(cs => cs.toLowerCase() === skill.toLowerCase())).length === 0 && (
                <p className="text-sm text-gray-500 italic mt-2">No more suggestions available</p>
            )}
            </div>

            {skills && skills.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-300 mb-2">Your skills:</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-800/70 text-gray-300 border border-gray-700/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-black/90 rounded-xl p-6 border border-gray-800/50">
          <h4 className="text-gray-300 font-medium mb-2">Pro Tips for Skills Section</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Include both technical skills (programming languages, tools) and soft skills (communication, teamwork)</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Be specific with technical skills (e.g., "React.js" instead of just "JavaScript")</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Add relevant skills that match your GitHub projects to show consistency</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-between pt-6">
          <button
            onClick={onPrev}
            className="px-6 py-3 rounded-lg font-medium text-white border border-gray-600 hover:bg-gray-800 transition-all duration-300"
          >
            Back
          </button>
          <button
            onClick={this.handleNext}
            disabled={!this.isValid()}
            className={`
              px-6 py-3 rounded-lg font-medium text-white
              transition-all duration-300 shadow-lg
              ${!this.isValid() 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 hover:shadow-lg hover:shadow-black/20'
              }
            `}
          >
            Continue to Contact Information
          </button>
        </div>
      </div>
    );
  }
} 