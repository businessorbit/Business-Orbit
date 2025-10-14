'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FormFields } from './auth/FormFields';
import { OAuthButtons } from './auth/OAuthButtons';
import { SkillsSection } from './auth/SkillsSection';
import { FileUploadSection } from './auth/FileUploadSection';
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
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillInput(e.target.value);
  };

  const handleSkillInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSkillAdd(skillInput);
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
      submitData.append('skills', JSON.stringify(skills));

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

        {/* Description field - only for signup */}
        {!isSignIn && (
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
              placeholder="Tell us about yourself"
            />
          </div>
        )}

        {/* Skills section - only for signup */}
        {!isSignIn && (
          <SkillsSection
            skills={skills}
            skillInput={skillInput}
            availableSkills={availableSkills}
            onSkillAdd={handleSkillAdd}
            onSkillRemove={handleSkillRemove}
            onSkillInputChange={handleSkillInputChange}
            onSkillInputKeyPress={handleSkillInputKeyPress}
          />
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

      {/* OAuth buttons */}
      <OAuthButtons onOAuthLogin={handleOAuthLogin} />

      {/* Mode toggle */}
      {setMode && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={() => setMode(isSignIn ? 'signup' : 'signin')}
            className="text-black hover:underline font-medium text-sm mt-1"
          >
            {isSignIn ? 'Sign up here' : 'Sign in here'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthForm;


