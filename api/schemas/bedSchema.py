from pydantic import BaseModel
from typing import Optional

# No Create or Update schema, as beds are managed by the room

class BedResponseSchema(BaseModel):
    id: str
    room_id: str
    property_id: str
    ownerId: str
    bed_number: int
    is_occupied: bool
    # member: Optional[MemberResponseSchema] # Add this later
