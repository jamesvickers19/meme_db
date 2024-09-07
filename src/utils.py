import requests


def get_or_throw(url):
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Status code ${response.status_code} for url ${url}")
    return response
