'use client';

import React from 'react';
import { X } from 'lucide-react';

interface SkillsSectionProps {
  skills: string[];
  skillInput: string;
  availableSkills: string[];
  onSkillAdd: (skill: string) => void;
  onSkillRemove: (skill: string) => void;
  onSkillInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSkillInputKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  skillInput,
  availableSkills,
  onSkillAdd,
  onSkillRemove,
  onSkillInputChange,
  onSkillInputKeyPress,
}) => {
  return (
    <div>
      <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
        Skills
      </label>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => onSkillRemove(skill)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          id="skills"
          value={skillInput}
          onChange={onSkillInputChange}
          onKeyPress={onSkillInputKeyPress}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
          placeholder="Type a skill and press Enter"
        />
        <div className="text-xs text-gray-500">
          Popular skills: {availableSkills.slice(0, 10).join(', ')}...
        </div>
      </div>
    </div>
  );
};


