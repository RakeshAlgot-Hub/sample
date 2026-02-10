# utils/security.py
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

passwordHasher = PasswordHasher()

def hashPassword(password: str) -> str:
    return passwordHasher.hash(password)

def verifyPassword(plainPassword: str, hashedPassword: str) -> bool:
    try:
        return passwordHasher.verify(hashedPassword, plainPassword)
    except VerifyMismatchError:
        return False


