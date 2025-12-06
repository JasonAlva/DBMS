import bcrypt

def hash_password(password: str) -> str:
    # Ensure password is a string
    if isinstance(password, bytes):
        password = password.decode('utf-8')
    
    # Convert to bytes
    password_bytes = password.encode('utf-8')
    
    # Hash the password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Return as string
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Ensure inputs are strings
    if isinstance(plain_password, bytes):
        plain_password = plain_password.decode('utf-8')
    if isinstance(hashed_password, bytes):
        hashed_password = hashed_password.decode('utf-8')
    
    # Convert to bytes
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    
    return bcrypt.checkpw(password_bytes, hashed_bytes)