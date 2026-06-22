Auth endpoints

POST /backend-api/auth/register
Request body:
{
  "fullName": "...",
  "username": "...",
  "password": "...",
  "email": "...",   // optional
  "phone": "..."    // optional
}

Returns: { id, username, fullName, role }


POST /backend-api/auth/login
Request body:
{
  "username": "...",
  "password": "..."
}

Returns:
{
  "token": "<jwt>",
  "user": {
    "id": ...,
    "username": "...",
    "fullName": "...",
    "email": "...",
    "phone": "...",
    "role": "..."
  }
}

