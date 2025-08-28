from pydantic import BaseModel

class User(BaseModel):
    id: int = None
    username: str
    password: str
