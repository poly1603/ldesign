/**
 * Authentication language items
 */

export default {
  login: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account',
    username: 'Username',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    submit: 'Sign In',
    noAccount: "Don't have an account?",
    createAccount: 'Create account',
    or: 'or',
    loginWith: 'Sign in with {provider}',
    success: 'Login successful!',
    error: 'Login failed. Please check your username and password'
  },
  
  register: {
    title: 'Create New Account',
    subtitle: 'Join our community',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    agreeTerms: 'I agree to the Terms of Service and Privacy Policy',
    submit: 'Sign Up',
    hasAccount: 'Already have an account?',
    goToLogin: 'Sign in',
    success: 'Registration successful! Please sign in',
    error: 'Registration failed. Please try again later'
  },
  
  logout: {
    confirm: 'Are you sure you want to log out?',
    success: 'Successfully logged out',
    error: 'Logout failed'
  },
  
  profile: {
    title: 'Profile',
    basicInfo: 'Basic Information',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    updateProfile: 'Update Profile',
    updatePassword: 'Update Password',
    uploadAvatar: 'Upload Avatar',
    success: 'Profile updated successfully',
    passwordSuccess: 'Password changed successfully',
    error: 'Update failed. Please try again later'
  },
  
  errors: {
    invalidCredentials: 'Invalid username or password',
    userNotFound: 'User not found',
    emailExists: 'Email already registered',
    usernameExists: 'Username already exists',
    weakPassword: 'Password is too weak',
    passwordMismatch: 'Passwords do not match',
    sessionExpired: 'Session expired. Please sign in again',
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden'
  }
}