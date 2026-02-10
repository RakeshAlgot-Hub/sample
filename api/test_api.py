import requests
import json
import time

BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}
COOKIES = {}
OWNER_ID = None
PROPERTY_ID = None
APARTMENT_PROPERTY_ID = None
BUILDING_ID = None
APARTMENT_BUILDING_ID = None
FLOOR_ID = None
APARTMENT_FLOOR_ID = None
ROOM_UNIT_ID = None
FLAT_UNIT_ID = None
GUEST_ID = None
BED_ID = None
ASSIGNMENT_ID = None # To store assignment ID for later deletion

def print_response(response, step_name):
    print(f"\n--- {step_name} ---")
    print(f"Status Code: {response.status_code}")
    try:
        response_json = response.json()
        print(f"Response: {json.dumps(response_json, indent=2)}")
        return response_json
    except json.JSONDecodeError:
        print(f"Response (raw): {response.text}")
        return None

def register_owner():
    global OWNER_ID
    print("\n--- Registering Owner ---")
    payload = {
        "username": "testowner",
        "fullName": "Test Owner",
        "phoneNumber": "1234567890",
        "password": "password123",
        "hostelId": "60a7d7f7e2a9a4b3c1d0e9f0", # Dummy hostelId
        "branchId": "60a7d7f7e2a9a4b3c1d0e9f1", # Dummy branchId
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=payload, headers=HEADERS)
    response_json = print_response(response, "Register Owner")
    if response.status_code == 200 and response_json:
        OWNER_ID = response_json["id"]
        print(f"Registered Owner ID: {OWNER_ID}")
    return response

def login_owner():
    global COOKIES
    print("\n--- Logging in Owner ---")
    payload = {
        "identifier": "testowner",
        "password": "password123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=payload, headers=HEADERS)
    print_response(response, "Login Owner")
    if response.status_code == 200:
        COOKIES = response.cookies
    return response

def create_property(property_type="HOSTEL"):
    global PROPERTY_ID
    global APARTMENT_PROPERTY_ID
    print(f"\n--- Creating {property_type} Property ---")
    payload = {
        "name": f"Test {property_type} Property",
        "propertyType": property_type,
        "country": "TestCountry",
        "state": "TestState",
        "city": "TestCity",
        "area": "TestArea",
        "addressLine": "123 Test St",
        "pincode": "12345"
    }
    response = requests.post(f"{BASE_URL}/properties/", json=payload, headers=HEADERS, cookies=COOKIES)
    response_json = print_response(response, f"Create {property_type} Property")
    if response.status_code == 200 and response_json:
        if property_type == "HOSTEL":
            PROPERTY_ID = response_json["id"]
            print(f"Created HOSTEL Property ID: {PROPERTY_ID}")
        else:
            APARTMENT_PROPERTY_ID = response_json["id"]
            print(f"Created APARTMENT Property ID: {APARTMENT_PROPERTY_ID}")
    return response

def create_building(prop_id, building_name="Test Building"):
    global BUILDING_ID
    global APARTMENT_BUILDING_ID
    print(f"\n--- Creating {building_name} ---")
    payload = {
        "name": building_name,
        "propertyId": prop_id,
        "addressLine": f"{building_name} Address",
        "city": "TestCity",
    }
    response = requests.post(f"{BASE_URL}/buildings/", json=payload, headers=HEADERS, cookies=COOKIES)
    response_json = print_response(response, f"Create {building_name}")
    if response.status_code == 200 and response_json:
        if building_name == "Test Building":
            BUILDING_ID = response_json["id"]
            print(f"Created Building ID: {BUILDING_ID}")
        else:
            APARTMENT_BUILDING_ID = response_json["id"]
            print(f"Created Apartment Building ID: {APARTMENT_BUILDING_ID}")
    return response

def create_floor(b_id, floor_num=1, floor_name="First Floor"):
    global FLOOR_ID
    global APARTMENT_FLOOR_ID
    print(f"\n--- Creating {floor_name} ---")
    payload = {
        "floorNumber": floor_num,
        "buildingId": b_id,
        "name": floor_name,
    }
    response = requests.post(f"{BASE_URL}/floors/", json=payload, headers=HEADERS, cookies=COOKIES)
    response_json = print_response(response, f"Create {floor_name}")
    if response.status_code == 200 and response_json:
        if floor_name == "First Floor":
            FLOOR_ID = response_json["id"]
            print(f"Created Floor ID: {FLOOR_ID}")
        else:
            APARTMENT_FLOOR_ID = response_json["id"]
            print(f"Created Apartment Floor ID: {APARTMENT_FLOOR_ID}")
    return response

def create_room_unit():
    global ROOM_UNIT_ID
    print("\n--- Creating Room Unit ---")
    payload = {
        "floorId": FLOOR_ID,
        "buildingId": BUILDING_ID,
        "numberOfRooms": 5,
        "shareType": 2,
        "sharePrice": 1000,
    }
    response = requests.post(f"{BASE_URL}/properties/{PROPERTY_ID}/units", json=payload, headers=HEADERS, cookies=COOKIES)
    response_json = print_response(response, "Create Room Unit")
    if response.status_code == 200 and response_json:
        ROOM_UNIT_ID = response_json["id"]
        print(f"Created Room Unit ID: {ROOM_UNIT_ID}")
    return response

def get_beds_for_unit():
    global BED_ID
    print("\n--- Getting Beds for Room Unit ---")
    response = requests.get(f"{BASE_URL}/beds/unit/{ROOM_UNIT_ID}", headers=HEADERS, cookies=COOKIES)
    response_json = print_response(response, "Get Beds for Unit")
    if response.status_code == 200 and response_json:
        BED_ID = response_json[0]["id"] # Get the first bed ID
        print(f"First Bed ID in Unit: {BED_ID}")
    return response

def create_guest():
    global GUEST_ID
    print("\n--- Creating Guest ---")
    payload = {
        "name": "Test Guest",
        "phoneNumber": "9876543210",
        "country": "GuestCountry",
    }
    response = requests.post(f"{BASE_URL}/guests/", json=payload, headers=HEADERS, cookies=COOKIES)
    response_json = print_response(response, "Create Guest")
    if response.status_code == 200 and response_json:
        GUEST_ID = response_json["id"]
        print(f"Created Guest ID: {GUEST_ID}")
    return response

def assign_guest_to_bed():
    print("\n--- Assigning Guest to Bed ---")
    response = requests.post(f"{BASE_URL}/beds/{BED_ID}/assign/{GUEST_ID}", headers=HEADERS, cookies=COOKIES)
    print_response(response, "Assign Guest to Bed")
    return response

def assign_guest_to_bed_double_booking_attempt():
    print("\n--- Attempting to Assign Same Guest to Another Bed (Double Booking) ---")
    # To test double booking, we need another bed. Get the second bed ID from the unit
    response_get_beds = requests.get(f"{BASE_URL}/beds/unit/{ROOM_UNIT_ID}", headers=HEADERS, cookies=COOKIES)
    beds = response_get_beds.json()
    if len(beds) > 1:
        second_bed_id = beds[1]["id"]
        response = requests.post(f"{BASE_URL}/beds/{second_bed_id}/assign/{GUEST_ID}", headers=HEADERS, cookies=COOKIES)
        print_response(response, "Assign Same Guest to Another Bed (Double Booking)")
    else:
        print("Not enough beds to test double booking on a different bed.")
    return response

def create_flat_unit():
    global FLAT_UNIT_ID
    print("\n--- Creating Flat Unit (under APARTMENT property) ---")
    payload = {
        "floorId": APARTMENT_FLOOR_ID,
        "buildingId": APARTMENT_BUILDING_ID,
        "numberOfFlats": 1,
        "flatType": "1BHK",
        "listingType": "RENT",
        "rentPrice": 2000,
    }
    response = requests.post(f"{BASE_URL}/properties/{APARTMENT_PROPERTY_ID}/units", json=payload, headers=HEADERS, cookies=COOKIES)
    response_json = print_response(response, "Create Flat Unit (under APARTMENT property)")
    if response.status_code == 200 and response_json:
        FLAT_UNIT_ID = response_json["id"]
        print(f"Created Flat Unit ID: {FLAT_UNIT_ID}")
    return response

def assign_guest_to_flat():
    global ASSIGNMENT_ID
    print("\n--- Assigning Guest to Flat ---")
    payload = {"guestId": GUEST_ID, "amount": 1500.0}
    response = requests.post(f"{BASE_URL}/assignments/units/{FLAT_UNIT_ID}", json=payload, headers=HEADERS, cookies=COOKIES)
    response_json = print_response(response, "Assign Guest to Flat")
    if response.status_code == 200 and response_json:
        ASSIGNMENT_ID = response_json["id"]
        print(f"Created Assignment ID: {ASSIGNMENT_ID}")
    return response

def assign_guest_to_flat_occupied_attempt():
    print("\n--- Attempting to Assign Guest to Occupied Flat ---")
    payload = {"guestId": GUEST_ID, "amount": 1600.0} # Same guest for simplicity
    response = requests.post(f"{BASE_URL}/assignments/units/{FLAT_UNIT_ID}", json=payload, headers=HEADERS, cookies=COOKIES)
    print_response(response, "Assign Guest to Occupied Flat")
    return response

def delete_occupied_unit_attempt():
    print("\n--- Attempting to Delete Occupied Room Unit ---")
    response = requests.delete(f"{BASE_URL}/properties/units/{ROOM_UNIT_ID}", headers=HEADERS, cookies=COOKIES)
    print_response(response, "Delete Occupied Room Unit")

    print("\n--- Attempting to Delete Occupied Flat Unit ---")
    response = requests.requests.delete(f"{BASE_URL}/properties/units/{FLAT_UNIT_ID}", headers=HEADERS, cookies=COOKIES)
    print_response(response, "Delete Occupied Flat Unit")
    return response

def cleanup_data():
    print("\n--- Starting Data Cleanup ---")

    # Remove guest from bed
    if BED_ID and GUEST_ID:
        print("\n--- Removing Guest from Bed ---")
        response = requests.post(f"{BASE_URL}/beds/{BED_ID}/remove", headers=HEADERS, cookies=COOKIES)
        print_response(response, "Remove Guest from Bed")
        time.sleep(1) # Give DB a moment

    # Delete assignment
    if ASSIGNMENT_ID:
        print("\n--- Deleting Assignment ---")
        response = requests.delete(f"{BASE_URL}/assignments/{ASSIGNMENT_ID}", headers=HEADERS, cookies=COOKIES)
        print_response(response, "Delete Assignment")
        time.sleep(1)

    # Delete units
    if ROOM_UNIT_ID:
        print("\n--- Deleting Room Unit ---")
        response = requests.delete(f"{BASE_URL}/properties/units/{ROOM_UNIT_ID}", headers=HEADERS, cookies=COOKIES)
        print_response(response, "Delete Room Unit")
        time.sleep(1)
    if FLAT_UNIT_ID:
        print("\n--- Deleting Flat Unit ---")
        response = requests.delete(f"{BASE_URL}/properties/units/{FLAT_UNIT_ID}", headers=HEADERS, cookies=COOKIES)
        print_response(response, "Delete Flat Unit")
        time.sleep(1)

    # Delete guest
    if GUEST_ID:
        print("\n--- Deleting Guest ---")
        response = requests.delete(f"{BASE_URL}/guests/{GUEST_ID}", headers=HEADERS, cookies=COOKIES)
        print_response(response, "Delete Guest")
        time.sleep(1)
    
    # Delete floors
    if FLOOR_ID:
        print("\n--- Deleting Hostel Floor ---")
        response = requests.delete(f"{BASE_URL}/floors/{FLOOR_ID}", headers=HEADERS, cookies=COOKIES)
        print_response(response, "Delete Hostel Floor")
        time.sleep(1)
    if APARTMENT_FLOOR_ID:
        print("\n--- Deleting Apartment Floor ---")
        response = requests.delete(f"{BASE_URL}/floors/{APARTMENT_FLOOR_ID}", headers=HEADERS, cookies=COOKIES)
        print_response(response, "Delete Apartment Floor")
        time.sleep(1)

    # Delete buildings
    if BUILDING_ID:
        print("\n--- Deleting Hostel Building ---")
        response = requests.requests.delete(f"{BASE_URL}/buildings/{BUILDING_ID}", headers=HEADERS, cookies=COOKIES)
        print_response(response, "Delete Hostel Building")
        time.sleep(1)
    if APARTMENT_BUILDING_ID:
        print("\n--- Deleting Apartment Building ---")
        response = requests.delete(f"{BASE_URL}/buildings/{APARTMENT_BUILDING_ID}", headers=HEADERS, cookies=COOKIES)
        print_response(response, "Delete Apartment Building")
        time.sleep(1)

    # Delete properties
    if PROPERTY_ID:
        print("\n--- Deleting Hostel Property ---")
        response = requests.delete(f"{BASE_URL}/properties/{PROPERTY_ID}", headers=HEADERS, cookies=COOKIES)
        print_response(response, "Delete Hostel Property")
        time.sleep(1)
    if APARTMENT_PROPERTY_ID:
        print("\n--- Deleting Apartment Property ---")
        response = requests.delete(f"{BASE_URL}/properties/{APARTMENT_PROPERTY_ID}", headers=HEADERS, cookies=COOKIES)
        print_response(response, "Delete Apartment Property")
        time.sleep(1)

    # Logout owner (not strictly necessary for cleanup, but good practice)
    print("\n--- Logging out Owner ---")
    requests.post(f"{BASE_URL}/auth/logout", headers=HEADERS, cookies=COOKIES)


def run_tests():
    # Authentication Tests
    register_owner()
    login_owner()

    if not COOKIES:
        print("Login failed, cannot proceed with further tests.")
        return
    
    # Create Hostel Property, Building, Floor, Unit
    create_property(property_type="HOSTEL")
    if not PROPERTY_ID: return
    create_building(PROPERTY_ID, building_name="Test Hostel Building")
    if not BUILDING_ID: return
    create_floor(BUILDING_ID, floor_name="Hostel Ground Floor")
    if not FLOOR_ID: return
    create_room_unit()
    if not ROOM_UNIT_ID: return
    
    get_beds_for_unit()
    if not BED_ID:
        print("No beds found for the Room Unit, cannot proceed with bed assignment tests.")
        return

    # Guest and Bed Assignment Tests
    create_guest()
    if not GUEST_ID: return
    
    assign_guest_to_bed()
    assign_guest_to_bed_double_booking_attempt()

    # Create Apartment Property, Building, Floor, Unit
    create_property(property_type="APARTMENT")
    if not APARTMENT_PROPERTY_ID: return
    create_building(APARTMENT_PROPERTY_ID, building_name="Test Apartment Building")
    if not APARTMENT_BUILDING_ID: return
    create_floor(APARTMENT_BUILDING_ID, floor_num=2, floor_name="Apartment First Floor")
    if not APARTMENT_FLOOR_ID: return
    create_flat_unit()
    if not FLAT_UNIT_ID: return
    
    assign_guest_to_flat()
    assign_guest_to_flat_occupied_attempt()

    # Delete Occupied Unit Tests
    delete_occupied_unit_attempt()

    # Perform cleanup
    cleanup_data()


if __name__ == "__main__":
    run_tests()
