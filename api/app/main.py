from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware



from app.routes import rooms, auth, properties, units, tenants, units_update, dashboard, payments



app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"]
)





app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(rooms.router)
app.include_router(units.router)
app.include_router(tenants.router)
app.include_router(units_update.router)

app.include_router(dashboard.router)
app.include_router(payments.router)



@app.get("/")
def root():
    return {"message": "FastAPI + MongoDB backend is running!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)