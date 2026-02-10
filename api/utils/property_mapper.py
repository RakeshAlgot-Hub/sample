from schemas.propertySchema import UIPropertyCreateSchema, CreateFullPropertyRequestSchema, WizardPropertyRequestSchema, WizardBuildingInputSchema, WizardFloorInputSchema, WizardRoomInputSchema
from typing import Tuple


def map_ui_to_backend_property(payload: UIPropertyCreateSchema) -> Tuple[CreateFullPropertyRequestSchema, str, list]:
    """
    Maps UIPropertyCreateSchema to CreateFullPropertyRequestSchema and extracts property_type and bed_pricing.
    Returns (full_property_request, property_type, bed_pricing)
    """
    wizard_property_request = WizardPropertyRequestSchema(
        name=payload.name,
        country="India",
        state="Telangana",
        city=payload.city,
        address="Default Address",
        phone="9999999999",
    )

    wizard_buildings = []
    wizard_floors = []
    wizard_rooms = []
    building_id_to_index = {b.id: i for i, b in enumerate(payload.buildings)}

    for building_index, ui_building in enumerate(payload.buildings):
        wizard_buildings.append(WizardBuildingInputSchema(name=ui_building.name, floor_count=len(ui_building.floors)))
        for ui_floor in ui_building.floors:
            floor_label_str = ui_floor.label
            try:
                floor_number_val = 0 if ui_floor.label.upper() == "G" else int(ui_floor.label)
            except ValueError:
                floor_number_val = -1
            wizard_floors.append(
                WizardFloorInputSchema(building_index=building_id_to_index[ui_building.id], floor_number=floor_number_val, floor_label=floor_label_str, room_count=len(ui_floor.rooms))
            )
            for ui_room in ui_floor.rooms:
                wizard_rooms.append(
                    WizardRoomInputSchema(building_index=building_id_to_index[ui_building.id], floor_number=floor_number_val, room_number=int(ui_room.roomNumber), share_type=ui_room.bedCount)
                )
    full_property_request = CreateFullPropertyRequestSchema(property=wizard_property_request, buildings=wizard_buildings, floors=wizard_floors, rooms=wizard_rooms)
    return full_property_request, payload.type, payload.bedPricing
