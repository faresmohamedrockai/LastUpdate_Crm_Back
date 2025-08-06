# Frontend Error Handling Guide for Duplicate Email Errors

## Problem
The frontend receives a 409 error when trying to create a user with a duplicate email, but it's not extracting the structured error message from the response.

## Current Error Response Structure
When a duplicate email error occurs, the backend now returns:

```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Account Already Exists",
  "details": "An account with this email address already exists. Please use a different email address or try logging in if this is your account.",
  "suggestion": "Use a different email or login with existing credentials"
}
```

## Frontend Solution

### 1. Proper Error Handling in React/TypeScript

```typescript
// In your UserManagement.tsx or mutation file
const handleAddUser = async (userData: any) => {
  try {
    const response = await addUser(userData);
    // Handle success
    toast.success('User created successfully!');
  } catch (error: any) {
    // Extract the structured error response
    if (error.response?.status === 409) {
      const errorData = error.response.data;
      
      // Display user-friendly message
      if (errorData.message === 'Account Already Exists') {
        toast.error(`${errorData.message}: ${errorData.details}`);
        // Or just: toast.error(errorData.details);
      } else if (errorData.message === 'Email Already Registered') {
        toast.error(errorData.details);
      } else {
        toast.error('This email is already in use. Please use a different email.');
      }
    } else if (error.response?.status === 400) {
      const errorData = error.response.data;
      if (errorData.message === 'Invalid Email Format') {
        toast.error(errorData.details);
      } else {
        toast.error('Please check your input and try again.');
      }
    } else {
      // Generic error handling
      toast.error('Failed to create user. Please try again.');
    }
  }
};
```

### 2. Enhanced Error Handler Function

```typescript
// Create a reusable error handler function
export const handleApiError = (error: any) => {
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }

  const { status, data } = error.response;
  
  // Handle structured error responses
  if (data && typeof data === 'object') {
    if (data.message && data.details) {
      return `${data.message}: ${data.details}`;
    }
    if (data.details) {
      return data.details;
    }
    if (data.message) {
      return data.message;
    }
  }

  // Fallback based on status code
  switch (status) {
    case 409:
      return 'This email is already registered. Please use a different email or login.';
    case 400:
      return 'Invalid input. Please check your information and try again.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// Usage in your component
try {
  await addUser(userData);
  toast.success('User created successfully!');
} catch (error) {
  const errorMessage = handleApiError(error);
  toast.error(errorMessage);
}
```

### 3. React Query/TanStack Query Error Handling

If you're using React Query:

```typescript
const addUserMutation = useMutation({
  mutationFn: addUser,
  onSuccess: () => {
    toast.success('User created successfully!');
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
  onError: (error: any) => {
    const errorMessage = handleApiError(error);
    toast.error(errorMessage);
  }
});
```

### 4. Form Validation Integration

If you want to show field-specific errors:

```typescript
const handleFormError = (error: any, setFieldError: any) => {
  if (error.response?.status === 409) {
    const errorData = error.response.data;
    
    if (errorData.field === 'email') {
      setFieldError('email', errorData.details);
      return;
    }
  }
  
  if (error.response?.status === 400) {
    const errorData = error.response.data;
    
    if (errorData.field === 'email') {
      setFieldError('email', errorData.details);
      return;
    }
  }
  
  // Show general error
  toast.error(handleApiError(error));
};
```

### 5. Console Debugging

To see the actual response structure, add this temporarily:

```typescript
try {
  await addUser(userData);
} catch (error: any) {
  console.log('Full error object:', error);
  console.log('Response status:', error.response?.status);
  console.log('Response data:', error.response?.data);
  
  // Your error handling code here
}
```

## Expected Response Examples

### Duplicate Email Response (409)
```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Account Already Exists",
  "details": "An account with this email address already exists. Please use a different email address or try logging in if this is your account.",
  "suggestion": "Use a different email or login with existing credentials"
}
```

### Invalid Email Format Response (400)
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid Email Format",
  "details": "The email address format is not valid. Please provide a valid email address.",
  "suggestion": "Use format like: user@example.com",
  "field": "email"
}
```

### Database Constraint Error (409)
```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Email Already Registered",
  "details": "This email address is already registered in our system. Each email can only be used for one account.",
  "suggestion": "Please use a different email address or login if you already have an account",
  "field": "email"
}
```

## Quick Fix for Your Current Issue

Add this to your mutation error handler:

```typescript
catch (error: any) {
  console.log('Error response:', error.response?.data); // Debug line
  
  const errorMessage = error.response?.data?.details || 
                      error.response?.data?.message || 
                      'Failed to create user. Please try again.';
  
  toast.error(errorMessage);
}
```

This will extract the user-friendly message from our structured error response and display it to the user instead of the generic AxiosError.