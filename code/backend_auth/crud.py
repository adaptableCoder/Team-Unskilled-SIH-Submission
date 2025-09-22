from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from datetime import datetime
from schemas import TaskCreate, TaskUpdate, TaskOut
from database import tasks
from auth import get_current_user
from schemas import TaskOut

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=TaskOut)
def create_task(task: TaskCreate, user: str = Depends(get_current_user)):
    task_data = task.dict()
    task_data.update({
        "username": user,
        "created_at": datetime.utcnow()
    })
    inserted = tasks.insert_one(task_data)
    task_data["id"] = str(inserted.inserted_id)
    return TaskOut(**{
        "id": task_data["id"],
        "title": task_data["title"],
        "description": task_data.get("description"),
        "status": task_data["status"],  # <-- include status here
        "created_at": task_data["created_at"]
    })


@router.get("/", response_model=list[TaskOut])
def get_tasks(status: bool = Query(...), user: str = Depends(get_current_user)):
    query = {   
        "status": status 
    }

    result = []
    for task in tasks.find(query):
        result.append(TaskOut(
            id=str(task["_id"]),
            title=task["title"],
            description=task.get("description"),
            created_at=task["created_at"]
        ))
    return result




@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: str, task: TaskUpdate, user: str = Depends(get_current_user)):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID")

    existing = tasks.find_one({"_id": ObjectId(task_id), "username": user})
    if not existing:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = {k: v for k, v in task.dict().items() if v is not None}
    if update_data:
        tasks.update_one({"_id": ObjectId(task_id)}, {"$set": update_data})

    updated = tasks.find_one({"_id": ObjectId(task_id)})
    return TaskOut(
        id=str(updated["_id"]),
        title=updated["title"],
        description=updated.get("description"),
        created_at=updated["created_at"]
    )



@router.delete("/{task_id}")
def delete_task(task_id: str, user: str = Depends(get_current_user)):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID format")
    delete_result = tasks.delete_one({"_id": ObjectId(task_id)})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found or unauthorized")
    return {"detail": "Task deleted successfully"}

