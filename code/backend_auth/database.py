from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")


try:
    client = MongoClient(MONGO_URI)
    client.admin.command('ping') 
    print("MongoDB connected successfully.")
except ConnectionFailure as e:
    print(f"MongoDB connection failed: {e}")

db = client["task_manager_db"]

users = db["users"]      
tasks = db["tasks"]      

users.create_index("username", unique=True)
tasks.create_index("username")  
