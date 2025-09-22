Overview of my project :-
This FastAPI project is a task management system with full user authentication, session timeout, and CRUD operations on tasks. It uses:

✅Register (POST /auth/register)
  Stores user with hashed password
  Enforces unique username
  Returns a JWT token

✅Login (POST /auth/login)
   Verifies credentials
   Returns JWT access token (expires in 30 minutes)
   Token Auth

✅Uses OAuth2PasswordBearer
   get_current_user() extracts user from token
   Invalid/expired tokens return 401 Unauthorized

🔧 Tech Used:

FastAPI – Web framework

MongoDB – User storage

python-jose – JWT handling

bcrypt – Password hashing (via utility)

API Rote Documentation - ![Sample](https://github.com/user-attachments/assets/ceb57ff1-ba6f-4945-aead-db1e978cea6b)

Running instructions = uvicorn main:app --reload (run this in terminal)
                       after that in terminal you 'll get these type of "http://127.0.0.1:8000" link in your terminal
                       then paste that link in your browser and apply /docs with your link and then You are all set!

                       
Sample Curl as follows :-
1.Auth = ![S1](https://github.com/user-attachments/assets/39c2d974-a617-4322-9f0a-21d4d942efcc)
2.Reg = ![S2](https://github.com/user-attachments/assets/b0919941-2e51-463a-bee7-a4e4e8413531)
3.LogIn(execution) = ![S2](https://github.com/user-attachments/assets/01537628-4ae6-4e23-a25f-5851f000df5d)
       (curl) = ![S4](https://github.com/user-attachments/assets/6a5c868c-b930-4d34-8ca8-cb67d86536c5)
4.To Perform Crude operations User need to log in first = ![S5](https://github.com/user-attachments/assets/6e64c3a8-ede9-4302-861e-675d88e773d7)
5.To Creeate Task = ![S6](https://github.com/user-attachments/assets/e28ccbe5-e5cd-454b-b8e5-9eb44387c13a)
6.To Get Task = ![S7](https://github.com/user-attachments/assets/04104300-9a89-4bee-a277-1ef2e469f543)
      (Curl) = ![S8](https://github.com/user-attachments/assets/ab1bf54f-13bf-493d-9292-3d1c407351f7)
7. To Put Task = ![S9](https://github.com/user-attachments/assets/c1e58259-c0b6-4953-ab23-3595aa586c26)
       (Curl) = ![S10](https://github.com/user-attachments/assets/b27799fa-1d8f-4815-95a2-1d556e9c4374)
       (mongo) = ![S15](https://github.com/user-attachments/assets/1f1cb5e7-3c6f-49d9-b90a-c2f19601eef2)

8. Delete Task = ![S11](https://github.com/user-attachments/assets/887e03fc-245f-46d7-919e-2a975405cb14)
       (Curl) = ![S12](https://github.com/user-attachments/assets/58618f85-3ca4-46fe-9d4f-c895db2228e4)
        (mongo) =    ![S14](https://github.com/user-attachments/assets/e0d402ce-697b-4d00-ae57-aa3a060f136d)


9. Schemas = ![S13](https://github.com/user-attachments/assets/3aad66da-9954-4505-a9cc-01ddb9bcc80c)

.env files = mongodb+srv://admin:<db_password>@cluster0.2fhc37t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     










