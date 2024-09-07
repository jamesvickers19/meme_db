from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo import ASCENDING
import json
from utils import get_or_throw

uri = "mongodb+srv://lambdatallc:5TRz5oM8x0mS1d7J@memedb.d79rb.mongodb.net/?retryWrites=true&w=majority&appName=memedb"

# Create a new client and connect to the server
mongo_client = MongoClient(uri, server_api=ServerApi('1'))
memedb_coll = mongo_client.memedb.memes

# TODO clear database first?


def setup_db():
    memedb_coll.create_index([('id', ASCENDING)], unique=True)


def get_and_write_memes_via_api():
    get_memes_response = get_or_throw(
        "https://api.imgflip.com/get_memes").json()
    response_memes = get_memes_response["data"]["memes"]
    print(f"Found {len(response_memes)} memes via API")
    for meme in response_memes:
        # TODO may want to set 'id' as a special id
        print(f"Retrieving image for meme '{meme['name']}'")
        get_img_response = get_or_throw(meme["url"])
        meme["img_bytes"] = get_img_response.content
        print(f"inserting meme '{meme['name']}'")
        memedb_coll.insert_one(meme)


setup_db()
get_and_write_memes_via_api()
