from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import example
from app.routes import auth

from app.routes import property as property_routes
from app.routes import member as member_routes




app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"]
)




app.include_router(example.router)
app.include_router(auth.router)

app.include_router(property_routes.router)
app.include_router(member_routes.router)



@app.get("/")
def root():
    return {"message": "FastAPI + MongoDB backend is running!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)