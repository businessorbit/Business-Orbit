'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FormFields } from './auth/FormFields';
import { OAuthButtons } from './auth/OAuthButtons';
import { FileUploadSection } from './auth/FileUploadSection';
import { User, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthFormProps {
  mode?: 'signin' | 'signup';
  setMode?: (mode: 'signin' | 'signup') => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode = 'signin', setMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    description: '',
    profession: '',
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();



  const availableSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'PHP',
    'Ruby', 'Go', 'Swift', 'Kotlin', 'TypeScript', 'Angular', 'Vue.js',
    'Django', 'Flask', 'Express', 'Laravel', 'Spring', 'ASP.NET',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Azure', 'GCP',
    'Docker', 'Kubernetes', 'Git', 'CI/CD', 'Agile', 'Scrum', 'DevOps',
    'UI/UX Design', 'Graphic Design', 'Product Management', 'Marketing',
    'Sales', 'Customer Support', 'Data Analysis', 'Machine Learning',
    'Artificial Intelligence', 'Blockchain', 'Cybersecurity'
  ];

  const professionOptions = [
    'Senior Data Analyst',
    'DevOps Engineer',
    'Chief Technology Officer',
    'Blockchain Architect',
    'Data Scientist',
    'Director of Architect',
    'Director of Operations',
    'Devops Consultant',
    'Full Stack Developer',
    'Senior Product Manager',
    'CTO',
    'Enterprise Architect',
    'VP of Engineering',
    'Business Analyst',
    'Cybersecurity Director',
    'Principal Scientist',
    'AI Ethics Specialist',
    'UX Designer',
    'Blockchain Consultant',
    'Senior Consultant',
    'Software Engineer',
    'AI Researcher',
    'Principal Engineer',
    'Chief Architect',
    'Chief officer',
    'Lead UX Designer',
    'CFO',
    'Scrum Master',
    'VP of Marketing',
    'Product Designer',
    'Quantum Computing Lead',
    'Cloud Architect',
    'Chief Innovation Officer',
    'Director of AI Research',
    'Principal Researcher',
    'Director of Research',
    'Project Director'
  ];
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !selectedSkills.includes(newSkill.trim())) {
      setSelectedSkills([...selectedSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBanner(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePhoto = () => {
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
  };

  const handleRemoveBanner = () => {
    setBanner(null);
    setBannerPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'signin') {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        return;
      } else if (result.error === 'EMAIL_NOT_REGISTERED') {
        toast.error('Email not registered. Please create a new account.', {
          duration: 5000
        });
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('password', formData.password);
      submitData.append('confirmPassword', formData.confirmPassword);
      submitData.append('description', formData.description);
      submitData.append('profession', formData.profession);
      submitData.append('skills', JSON.stringify(selectedSkills));

      if (profilePhoto) {
        submitData.append('profilePhoto', profilePhoto);
      }
      if (banner) {
        submitData.append('banner', banner);
      }

      const result = await signup(submitData);
      if (result.success) {
        return;
      }
    }
    
    setLoading(false);
  };

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  const isSignIn = mode === 'signin';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isSignIn ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-gray-600">
          {isSignIn ? 'Sign in to your account' : 'Join Business Orbit and start connecting'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormFields
          mode={mode}
          formData={formData}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          onFieldChange={handleChange}
          onTogglePassword={() => setShowPassword(!showPassword)}
          onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        {/* Profession field - only for signup */}
        {!isSignIn && (
          <div>
            <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
              Profession
            </label>
            <div className="relative">
              <select
                id="profession"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 appearance-none bg-white cursor-pointer text-black"
                style={{
                  colorScheme: 'light',
                  backgroundColor: 'white',
                  color: 'black'
                }}
              >
                <option value="">Select your profession</option>
                {professionOptions.map((profession) => (
                  <option key={profession} value={profession}>
                    {profession}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Skills section - only for signup */}
        {!isSignIn && (
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
              Skills
            </label>
            <div className="space-y-3">
              {/* Add skill input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  id="newSkill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleSkillKeyPress}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  placeholder="Add a skill"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
              
              {/* Selected skills display */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Available skills suggestions */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Popular skills:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.slice(0, 10).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        if (!selectedSkills.includes(skill)) {
                          setSelectedSkills([...selectedSkills, skill]);
                        }
                      }}
                      disabled={selectedSkills.includes(skill)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors duration-200 ${
                        selectedSkills.includes(skill)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Description field - only for signup */}
        {!isSignIn && (
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Profile Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
        )}

        {/* File upload section - only for signup */}
        {!isSignIn && (
          <FileUploadSection
            profilePhoto={profilePhoto}
            banner={banner}
            profilePhotoPreview={profilePhotoPreview}
            bannerPreview={bannerPreview}
            onProfilePhotoChange={handleProfilePhotoChange}
            onBannerChange={handleBannerChange}
            onRemoveProfilePhoto={handleRemoveProfilePhoto}
            onRemoveBanner={handleRemoveBanner}
          />
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? 'Please wait...' : (isSignIn ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      {/* OAuth buttons - only for signin */}
      {isSignIn && <OAuthButtons onOAuthLogin={handleOAuthLogin} />}

    </div>
  );
};

export default AuthForm;


