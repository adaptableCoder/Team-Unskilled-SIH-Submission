from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError
from pymongo.errors import DuplicateKeyError
from schemas import RegisterModel, UserOut
from database import users
from utils import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/auth/login")


users.create_index("username", unique=True)

@router.post("/register", response_model=UserOut)
def register(user: RegisterModel):
    existing = users.find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(user.password)
    try:
        users.insert_one({
            "username": user.username,
            "password": hashed_password,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "email": user.email,
            "contact": user.contact
        })
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Username already taken")

    token = create_access_token({"sub": user.username})
    return {
        "username": user.username,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "email": user.email,
        "contact": user.contact,
        "token": token
    }

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid username or password")

    token = create_access_token({"sub": form_data.username})
    return {"access_token": token, "token_type": "bearer"}


def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = decode_token(token)
        if payload is None or "sub" not in payload:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired or invalid")
