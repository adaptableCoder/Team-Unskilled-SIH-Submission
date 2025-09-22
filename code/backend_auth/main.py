from fastapi import FastAPI
import auth, crud 

app = FastAPI(title="Task Manager with Auth & MongoDB")


app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(crud.router, prefix="/tasks", tags=["Tasks"])

@app.get("/")
def root():
    return {"message": "Welcome to the Task Manager API!"}
