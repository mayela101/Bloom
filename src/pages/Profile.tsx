import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Heart, LogOut, Pencil } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/userProfile';
import styles from './Profile.module.css';

export function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading, updateDisplayName, updateWeeklyGoal, updateReminders } = useProfile();

  // Local state for form
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(4);
  const [reminders, setReminders] = useState(true);
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync local state with profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile. display_name || '');
      setWeeklyGoal(profile.weekly_goal || 4);
      setReminders(profile.reminder_enabled ??  true);
    }
  }, [profile]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message:  string) => {
    setErrorMessage(message);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const handleSaveDisplayName = async () => {
    setSaving(true);
    try {
      await updateDisplayName(displayName. trim());
      setIsEditingName(false);
      showSuccess('Display name updated!  🦋');
    } catch (error) {
      showError('Failed to update display name');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setDisplayName(profile?.display_name || '');
    setIsEditingName(false);
  };

  const handleWeeklyGoalChange = async (goal: number) => {
    setWeeklyGoal(goal);
    try {
      await updateWeeklyGoal(goal);
      showSuccess('Weekly goal updated! ');
    } catch (error) {
      showError('Failed to update weekly goal');
    }
  };

  const handleRemindersChange = async () => {
    const newValue = ! reminders;
    setReminders(newValue);
    try {
      await updateReminders(newValue);
      showSuccess(newValue ? 'Reminders enabled!' : 'Reminders disabled');
    } catch (error) {
      showError('Failed to update reminders');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            <User size={40} className={styles.avatarIcon} />
          </div>
          <p>Loading... </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles. header}>
        <div className={styles. avatar}>
          <User size={40} className={styles.avatarIcon} />
        </div>
        <h1 className={styles.title}>
          {profile?.display_name || 'Your Profile'}
        </h1>
        <p className={styles.subtitle}>{user?.email}</p>
      </div>

      {successMessage && <div className={styles. successMessage}>{successMessage}</div>}
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

      {/* Settings */}
      <div className={styles.settingsList}>
        {/* Set Display Name*/}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <Pencil className={styles.settingIcon} size={24} />
            <div>
              <h3 className={styles.settingTitle}>Display Name</h3>
            </div>
          </div>

          {isEditingName ? (
            <div className={styles.displayNameSection}>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name..."
                className={styles.displayNameInput}
                autoFocus
              />
              <div className={styles.displayNameActions}>
                <button
                  onClick={handleSaveDisplayName}
                  disabled={saving || ! displayName.trim()}
                  className={styles.saveButton}
                >
                  {saving ? 'Saving...' :  'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className={styles. cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.displayNameRow}>
              {profile?.display_name ?  (
                <span className={styles.displayNameValue}>{profile.display_name}</span>
              ) : (
                <span className={styles.displayNamePlaceholder}>Not set</span>
              )}
              <button
                onClick={() => setIsEditingName(true)}
                className={styles.editButton}
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Weekly Goal */}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <Heart className={styles.settingIcon} size={24} />
            <div>
              <h3 className={styles.settingTitle}>Weekly Goal</h3>
              <p className={styles.settingDescription}>Entries per week to grow a butterfly</p>
            </div>
          </div>
          <div className={styles.goalButtons}>
            {[1, 2, 3, 4, 5, 6, 7]. map(num => (
              <button
                key={num}
                onClick={() => handleWeeklyGoalChange(num)}
                className={`${styles.goalButton} ${weeklyGoal === num ? styles.goalButtonActive : ''}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Reminders Toggle */}
        <div className={styles. settingCard}>
          <div className={styles.toggleSetting}>
            <div className={styles.toggleInfo}>
              <Bell className={styles.settingIcon} size={24} />
              <div>
                <h3 className={styles.settingTitle}>Daily Reminders</h3>
                <p className={styles. settingDescription}>Get gentle nudges to journal</p>
              </div>
            </div>
            <button
              onClick={handleRemindersChange}
              className={`${styles.toggle} ${reminders ?  styles.toggleOn : styles.toggleOff}`}
            >
              <div className={`${styles.toggleKnob} ${reminders ? styles.toggleKnobOn :  styles.toggleKnobOff}`} />
            </button>
          </div>
        </div>


        {/* Privacy */}
        <div className={styles.settingCard}>
          <div className={styles.privacyContent}>
            <Shield className={styles.settingIcon} size={24} />
            <div>
              <h3 className={styles.settingTitle}>Your Privacy</h3>
              <p className={styles.settingDescription}>
                All your entries are stored securely.  Flutter only reads your entries to provide helpful prompts, and are never shared.
              </p>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button onClick={handleSignOut} className={styles.signOutButton}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>


    </div>
  );
}