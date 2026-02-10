from fastapi import APIRouter, Request, Query, Response, status
from typing import List

from schemas.propertySchema import (
    PropertyCreateSchema,
    PropertyUpdateSchema,
    PropertyResponseSchema,
    CreateFullPropertyRequestSchema,
    CreateFullPropertyResponseSchema,
    PropertyDetails,
)
from services.propertyService import (
    createPropertyService,
    getAllPropertiesService,
    getPropertyByIdService,
    updatePropertyService,
    deletePropertyService,
    createFullPropertyService,
    getPropertyDetailsService,
)

router = APIRouter(prefix="/properties", tags=["Properties"])


@router.post("/", response_model=PropertyResponseSchema, status_code=status.HTTP_201_CREATED)
async def createProperty(payload: PropertyCreateSchema, request: Request):
    return await createPropertyService(payload, request)


@router.post("/wizard", response_model=CreateFullPropertyResponseSchema, status_code=status.HTTP_201_CREATED)
async def createFullProperty(payload: CreateFullPropertyRequestSchema, request: Request):
    return await createFullPropertyService(payload, request)


@router.get("", response_model=List[PropertyResponseSchema])
async def getAllProperties(
    request: Request,
    propertyType: str | None = Query(default=None),
):
    return await getAllPropertiesService(request, propertyType)


@router.get("/{propertyId}", response_model=PropertyResponseSchema)
async def getPropertyById(propertyId: str, request: Request):
    print("Fetching property with ID:", propertyId)
    return await getPropertyByIdService(propertyId, request)


@router.get("/{propertyId}/details", response_model=PropertyDetails)
async def getPropertyDetails(propertyId: str, request: Request):
    return await getPropertyDetailsService(propertyId, request)


@router.patch("/{propertyId}", response_model=PropertyResponseSchema)
async def updateProperty(
    propertyId: str,
    payload: PropertyUpdateSchema,
    request: Request,
):
    return await updatePropertyService(propertyId, payload, request)



@router.delete("/{propertyId}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteProperty(propertyId: str, request: Request):
    await deletePropertyService(propertyId, request)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
