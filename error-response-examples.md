# Enhanced Error Response Examples

## Duplicate Email Error Response

When trying to register with an email that already exists, you will now receive a clear, structured response:

### Response (409 Conflict)
```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Account Already Exists",
  "details": "An account with this email address already exists. Please use a different email address or try logging in if this is your account.",
  "suggestion": "Use a different email or login with existing credentials"
}
```

## Invalid Email Format Error Response

When providing an invalid email format:

### Response (400 Bad Request)
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

## Database-Level Duplicate Email Error

If the duplicate check somehow bypasses application logic, the database constraint will catch it:

### Response (409 Conflict)
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

## Email Update Conflict Error

When trying to update user email to one that already exists:

### Response (409 Conflict)
```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Email Already In Use",
  "details": "This email address is already associated with another account. Please choose a different email address.",
  "suggestion": "Use a different email address for this account",
  "field": "email"
}
```

## Benefits of the New Response Format

1. **Clear Status Code**: Always returns appropriate HTTP status codes
2. **Structured Message**: Consistent error object structure
3. **Detailed Information**: Explains exactly what went wrong
4. **Helpful Suggestions**: Provides actionable next steps
5. **Field Identification**: Shows which field caused the error
6. **User-Friendly**: Easy to understand for end users
7. **Developer-Friendly**: Easy to parse and handle programmatically

## Frontend Integration Example

```javascript
// Example of handling the error response in frontend
try {
  const response = await fetch('/auth/add-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    
    // Display user-friendly message
    if (error.message === 'Account Already Exists') {
      showMessage(`${error.details} ${error.suggestion}`, 'warning');
    } else if (error.message === 'Invalid Email Format') {
      highlightField(error.field);
      showMessage(error.details, 'error');
    }
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## API Testing

You can test these responses using tools like Postman or curl:

```bash
# Test duplicate email
curl -X POST http://localhost:3000/auth/add-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "password": "Password123!",
    "name": "Test User",
    "role": "sales_rep"
  }'

# Test invalid email format
curl -X POST http://localhost:3000/auth/add-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "Password123!",
    "name": "Test User",
    "role": "sales_rep"
  }'
```