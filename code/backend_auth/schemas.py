from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class RegisterModel(BaseModel):
    username: str = Field(..., min_length=3, max_length=10)
    password: str = Field(..., min_length=6)
    firstName: str = Field(..., min_length=1)
    lastName: str = Field(..., min_length=1)
    email: str = Field(...)
    contact: str = Field(...)

class LoginModel(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    username: str
    firstName: str
    lastName: str
    email: str
    contact: str
    token: str

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status:bool = False 

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: bool = False 

from typing import Optional

class TaskOut(BaseModel):
    id: str
    title: str
    description: str
    created_at: datetime
    status: bool=False 